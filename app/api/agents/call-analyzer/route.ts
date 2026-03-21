import { NextRequest, NextResponse } from 'next/server';
import { runCallAnalyzer } from '@/lib/agents/call-analyzer';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, prospect_intel_json, pre_call_brief, company_name, additional_context } =
      body as Record<string, string | undefined>;

    if (
      !transcript?.trim() ||
      !prospect_intel_json?.trim() ||
      !pre_call_brief?.trim() ||
      !company_name?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'transcript, prospect_intel_json, pre_call_brief, and company_name are required',
        },
        { status: 400 }
      );
    }

    const call_analysis = await runCallAnalyzer({
      transcript,
      prospect_intel_json,
      pre_call_brief,
      company_name,
      additional_context,
    });

    return NextResponse.json({
      success: true,
      call_analysis,
    });
  } catch (error) {
    console.error('Call Analyzer agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Call analysis failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
