import { NextRequest, NextResponse } from 'next/server';
import { runCoordinator } from '@/lib/agents/coordinator';
import type { CoordinatorState } from '@/lib/agents/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface CoordinatorRequest {
  action?: 'route' | 'synthesize';
  research?: string;
  analysis?: string;
  outreach?: string;
  proposal?: string;
  company_name?: string;
  prospect_intel_json?: string;
  pre_call_brief?: string;
  call_analysis?: string;
  additional_context?: string;
  user_input?: string;
  state?: CoordinatorState;
}

export async function POST(req: NextRequest) {
  try {
    const body: CoordinatorRequest = await req.json();
    const action = body.action ?? 'synthesize';

    if (action === 'route') {
      const result = await runCoordinator({
        action: 'route',
        user_input: body.user_input,
        state_json: body.state,
      });
      return NextResponse.json({
        success: true,
        kind: 'route',
        route: result.route,
      });
    }

    // Legacy: old pipeline passed research, analysis, outreach
    const prospect_intel_json =
      body.prospect_intel_json ??
      body.research ??
      '';
    const pre_call_brief = body.pre_call_brief ?? body.analysis ?? '';
    const call_analysis = body.call_analysis;
    const proposal_draft = body.proposal ?? body.outreach;

    const result = await runCoordinator({
      action: 'synthesize',
      prospect_intel_json,
      pre_call_brief,
      call_analysis,
      proposal_draft,
      company_name: body.company_name,
      additional_context: body.additional_context,
    });

    return NextResponse.json({
      success: true,
      coordinator: result.synthesis ?? '',
      kind: 'synthesis',
    });
  } catch (error) {
    console.error('Coordinator agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Coordinator failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
