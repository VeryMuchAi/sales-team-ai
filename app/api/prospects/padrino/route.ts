/**
 * POST /api/prospects/padrino
 *
 * Hardens the existing 7-slide proposal for a prospect into a Godfather-style
 * offer (JSON). Server-side: loads intel + proposal + call analysis from
 * Supabase so the client only needs to pass `prospect_id`.
 *
 * Body: { prospect_id: string }
 * Response: { success: true, padrino: PadrinoOutput }
 *
 * Requires:
 *   - prospect.proposal must exist (run /api/prospects/proposal first)
 *   - prospect.prospect_intel OR agent_results.research_output must exist
 *
 * Side effects:
 *   - prospects.padrino_output, padrino_hash, padrino_generated_at updated
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runPadrino, type PadrinoInput } from '@/lib/agents/padrino';
import { getPriorProposalContext } from '@/lib/knowledge-base/proposal-history';

export const runtime = 'nodejs';
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { prospect_id?: string };
    if (!body.prospect_id?.trim()) {
      return NextResponse.json(
        { success: false, error: 'prospect_id is required' },
        { status: 400 },
      );
    }

    const { data: prospect, error: pErr } = await supabase
      .from('prospects')
      .select(
        'id, company_name, contact_name, proposal, call_analysis, prospect_intel',
      )
      .eq('id', body.prospect_id)
      .single();

    if (pErr || !prospect) {
      return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });
    }

    if (!prospect.proposal?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No proposal found. Genera primero la propuesta 7-slide en /api/prospects/proposal.',
        },
        { status: 400 },
      );
    }

    const { data: latestResult } = await supabase
      .from('agent_results')
      .select('research_output')
      .eq('prospect_id', body.prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const prospectIntelJson =
      latestResult?.research_output?.trim() ||
      (prospect.prospect_intel ? JSON.stringify(prospect.prospect_intel) : '');

    if (!prospectIntelJson) {
      return NextResponse.json(
        { success: false, error: 'Missing prospect intel for this prospect.' },
        { status: 400 },
      );
    }

    const callAnalysis =
      typeof prospect.call_analysis === 'string'
        ? prospect.call_analysis
        : prospect.call_analysis != null
          ? JSON.stringify(prospect.call_analysis)
          : undefined;

    // Prior proposals from Notion KB / Supabase — resilient: we keep going on error.
    let priorBlock = '';
    try {
      const ctx = await getPriorProposalContext(supabase, {
        companyName: prospect.company_name,
      });
      priorBlock = ctx.promptBlock;
    } catch (err) {
      console.warn('[padrino] prior proposal lookup failed, continuing without KB', err);
    }

    const input: PadrinoInput = {
      company_name: prospect.company_name,
      contact_name: prospect.contact_name ?? undefined,
      proposal_draft: prospect.proposal,
      prospect_intel_json: prospectIntelJson,
      call_analysis: callAnalysis,
      prior_proposals_block: priorBlock,
    };

    const padrino = await runPadrino(input);

    // Persist — best-effort; we still return padrino even if the write fails.
    const { error: upErr } = await supabase
      .from('prospects')
      .update({
        padrino_output: padrino,
        padrino_hash: padrino.hash ?? null,
        padrino_generated_at: new Date().toISOString(),
      })
      .eq('id', body.prospect_id);
    if (upErr) {
      console.warn('[padrino] failed to persist padrino_output', upErr.message);
    }

    return NextResponse.json({ success: true, padrino });
  } catch (err) {
    console.error('Padrino prospect route error:', err);
    const msg = err instanceof Error ? err.message : 'Padrino failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
