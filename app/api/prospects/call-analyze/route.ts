import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runCallAnalyzer } from '@/lib/agents/call-analyzer';

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
      .select('id, company_name, contact_name, additional_context')
      .eq('id', prospect_id)
      .eq('user_id', user.id)
      .single();

    if (pErr || !prospect) {
      return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });
    }

    const { data: latestResult, error: rErr } = await supabase
      .from('agent_results')
      .select('research_output, analysis_output')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rErr || !latestResult?.research_output?.trim() || !latestResult?.analysis_output?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing prior analysis. Run Prospect Intel + Pre-Call Brief first (análisis inicial).',
        },
        { status: 400 }
      );
    }

    const call_analysis = await runCallAnalyzer({
      transcript,
      prospect_intel_json: latestResult.research_output,
      pre_call_brief: latestResult.analysis_output,
      company_name: prospect.company_name,
      additional_context:
        typeof prospect.additional_context === 'string' ? prospect.additional_context : undefined,
    });

    await supabase
      .from('prospects')
      .update({
        stage: 'call_analyzed',
        call_transcript: transcript,
        call_analysis: call_analysis,
      })
      .eq('id', prospect_id);

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
