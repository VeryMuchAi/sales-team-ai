/**
 * POST /api/agents/padrino
 *
 * Hardens a 7-slide proposal draft into a Godfather-style offer (JSON).
 *
 * Body:
 *   {
 *     company_name: string,
 *     contact_name?: string,
 *     proposal_draft: string,          // 7-slide markdown from proposal-generator
 *     prospect_intel_json: string,
 *     call_analysis?: string,
 *   }
 *
 * Response: { success: true, padrino: PadrinoOutput }
 *
 * Behavior:
 *   - Pulls prior proposals for this company from Notion KB (resilient).
 *   - If a recent hot/warm hash exists, sends an extra instruction to the
 *     agent to evolve the existing proposal instead of drafting a new one.
 *   - Enforces a minimum gross-margin guardrail (55%).
 */

import { NextRequest, NextResponse } from 'next/server';
import { runPadrino, type PadrinoInput } from '@/lib/agents/padrino';
import { getPriorProposalContext } from '@/lib/knowledge-base/proposal-history';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface PadrinoBody {
  company_name?: string;
  contact_name?: string;
  proposal_draft?: string;
  prospect_intel_json?: string;
  call_analysis?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PadrinoBody;
    if (!body.company_name || !body.proposal_draft || !body.prospect_intel_json) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: company_name, proposal_draft, prospect_intel_json',
        },
        { status: 400 },
      );
    }

    let priorBlock = '';
    try {
      const supabase = await createClient();
      const ctx = await getPriorProposalContext(supabase, {
        companyName: body.company_name,
      });
      priorBlock = ctx.promptBlock;
    } catch (err) {
      console.warn('[padrino] prior proposal lookup failed, proceeding without KB', err);
    }

    const input: PadrinoInput = {
      company_name: body.company_name,
      contact_name: body.contact_name,
      proposal_draft: body.proposal_draft,
      prospect_intel_json: body.prospect_intel_json,
      call_analysis: body.call_analysis,
      prior_proposals_block: priorBlock,
    };

    const padrino = await runPadrino(input);

    return NextResponse.json({ success: true, padrino });
  } catch (err) {
    console.error('Padrino agent error:', err);
    const msg = err instanceof Error ? err.message : 'Padrino failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
