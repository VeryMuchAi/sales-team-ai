import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runCallAnalyzer } from '@/lib/agents/call-analyzer';
import { formatSalesInteractionNotes } from '@/lib/knowledge-base/sales-interaction-notes';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prospect_id, transcript } = body as { prospect_id?: string; transcript?: string };

    if (!prospect_id?.trim() || !transcript?.trim()) {
      return NextResponse.json(
        { success: false, error: 'prospect_id and transcript are required' },
        { status: 400 }
      );
    }

    const { data: prospect, error: pErr } = await supabase
      .from('prospects')
      .select(
        'id, company_name, contact_name, additional_context, prospect_objections, prospect_comments, prospect_learnings, prospect_intel, pre_call_brief'
      )
      .eq('id', prospect_id)
      .single();

    if (pErr || !prospect) {
      return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });
    }

    const { data: latestResult } = await supabase
      .from('agent_results')
      .select('research_output, analysis_output')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Prefer agent_results; fall back to data written directly to prospects (external pipeline)
    const prospectIntelJson =
      latestResult?.research_output?.trim() ||
      (prospect.prospect_intel ? JSON.stringify(prospect.prospect_intel) : '');
    const preCallBriefText =
      latestResult?.analysis_output?.trim() ||
      (typeof prospect.pre_call_brief === 'string' ? prospect.pre_call_brief : '');

    if (!prospectIntelJson || !preCallBriefText) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing prior analysis. Run Prospect Intel + Pre-Call Brief first (análisis inicial).',
        },
        { status: 400 }
      );
    }

    const salesNotes = formatSalesInteractionNotes(
      prospect.prospect_objections as string | null | undefined,
      prospect.prospect_comments as string | null | undefined,
      prospect.prospect_learnings as string | null | undefined
    );

    const call_analysis = await runCallAnalyzer({
      transcript,
      prospect_intel_json: prospectIntelJson,
      pre_call_brief: preCallBriefText,
      company_name: prospect.company_name,
      additional_context:
        typeof prospect.additional_context === 'string' ? prospect.additional_context : undefined,
      sales_interaction_notes: salesNotes || undefined,
    });

    await supabase
      .from('prospects')
      .update({
        stage: 'call_analyzed',
        call_transcript: transcript,
        call_analysis: call_analysis,
      })
      .eq('id', prospect_id);

    // Also persist as a session in prospect_call_sessions
    const { count: sessionCount } = await supabase
      .from('prospect_call_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('prospect_id', prospect_id);

    const sessionNumber = (sessionCount ?? 0) + 1;

    await supabase.from('prospect_call_sessions').insert({
      prospect_id,
      user_id: user.id,
      session_number: sessionNumber,
      session_label: `Llamada ${sessionNumber}`,
      call_transcript: transcript,
      call_analysis,
      call_date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      call_analysis,
    });
  } catch (error) {
    console.error('Call analyze error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Call analysis failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
