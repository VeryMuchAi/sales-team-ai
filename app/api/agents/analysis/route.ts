import { NextRequest, NextResponse } from 'next/server';
import { runPreCallBrief } from '@/lib/agents/pre-call-brief';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** Pre-Call Brief Agent (legacy path: /api/agents/analysis) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { research, prospect_intel_json, company_name } = body as {
      research?: string;
      prospect_intel_json?: string;
      company_name?: string;
    };

    const intel = prospect_intel_json ?? research;
    if (!intel?.trim() || !company_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'prospect_intel_json (or research) and company_name are required' },
        { status: 400 }
      );
    }

    const brief = await runPreCallBrief({
      prospect_intel_json: intel,
      company_name,
    });

    return NextResponse.json({
      success: true,
      analysis: brief,
      pre_call_brief: brief,
    });
  } catch (error) {
    console.error('Pre-Call Brief agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Pre-Call Brief failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
