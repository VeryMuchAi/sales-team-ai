import { NextRequest, NextResponse } from 'next/server';
import { runProposalGenerator } from '@/lib/agents/proposal-generator';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prospect_intel_json,
      pre_call_brief,
      call_analysis,
      company_name,
      contact_name,
      language,
      additional_context,
    } = body as Record<string, string | undefined>;

    if (
      !prospect_intel_json?.trim() ||
      !pre_call_brief?.trim() ||
      !call_analysis?.trim() ||
      !company_name?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'prospect_intel_json, pre_call_brief, call_analysis, and company_name are required',
        },
        { status: 400 }
      );
    }

    const proposal = await runProposalGenerator({
      prospect_intel_json,
      pre_call_brief,
      call_analysis,
      company_name,
      contact_name,
      language: language === 'en' ? 'en' : 'es',
      additional_context,
    });

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error('Proposal Generator agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Proposal generation failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
