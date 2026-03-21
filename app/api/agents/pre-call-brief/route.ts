import { NextRequest, NextResponse } from 'next/server';
import { runPreCallBrief } from '@/lib/agents/pre-call-brief';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospect_intel_json, company_name, additional_context } = body as {
      prospect_intel_json?: string;
      company_name?: string;
      additional_context?: string;
    };

    if (!prospect_intel_json?.trim() || !company_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'prospect_intel_json and company_name are required' },
        { status: 400 }
      );
    }

    const brief = await runPreCallBrief({ prospect_intel_json, company_name, additional_context });

    return NextResponse.json({
      success: true,
      pre_call_brief: brief,
    });
  } catch (error) {
    console.error('Pre-Call Brief agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Pre-Call Brief failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
