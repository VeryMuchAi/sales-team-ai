import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProposalGenerator } from '@/lib/agents/proposal-generator';
import { formatSalesInteractionNotes } from '@/lib/knowledge-base/sales-interaction-notes';
import type { ProposalCurrency } from '@/lib/agents/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const VALID_CURRENCIES: ProposalCurrency[] = ['USD', 'EUR', 'MXN', 'COP'];

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
    const { prospect_id, feedback, currency } = body as {
      prospect_id?: string;
      feedback?: string;
      currency?: ProposalCurrency;
    };

    if (!prospect_id?.trim()) {
      return NextResponse.json({ success: false, error: 'prospect_id is required' }, { status: 400 });
    }
    if (!feedback?.trim()) {
      return NextResponse.json({ success: false, error: 'feedback is required' }, { status: 400 });
    }

    const selectedCurrency: ProposalCurrency = VALID_CURRENCIES.includes(currency as ProposalCurrency)
      ? (currency as ProposalCurrency)
      : 'USD';

    const { data: prospect, error: pErr } = await supabase
      .from('prospects')
      .select(
        'id, company_name, contact_name, call_analysis, additional_context, prospect_objections, prospect_comments, prospect_learnings'
      )
      .eq('id', prospect_id)
      .single();

    if (pErr || !prospect) {
      return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });
    }

    const callAnalysis =
      typeof prospect.call_analysis === 'string'
        ? prospect.call_analysis
        : prospect.call_analysis != null
          ? JSON.stringify(prospect.call_analysis)
          : '';

    if (!callAnalysis?.trim()) {
      return NextResponse.json(
        { success: false, error: 'No call analysis found' },
        { status: 400 }
      );
    }

    const { data: latestResult, error: rErr } = await supabase
      .from('agent_results')
      .select('research_output, analysis_output')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rErr || !latestResult) {
      return NextResponse.json({ success: false, error: 'Missing agent results' }, { status: 400 });
    }

    // Load previous feedback entries to give the agent learning context
    const { data: previousFeedback } = await supabase
      .from('proposal_feedback')
      .select('feedback, created_at')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: true });

    const learningContext =
      previousFeedback && previousFeedback.length > 0
        ? `## Aprendizajes de versiones anteriores\n${previousFeedback
            .map((f, i) => `- Revisión ${i + 1}: ${f.feedback}`)
            .join('\n')}`
        : undefined;

    const salesNotes = formatSalesInteractionNotes(
      prospect.prospect_objections as string | null | undefined,
      prospect.prospect_comments as string | null | undefined,
      prospect.prospect_learnings as string | null | undefined
    );

    const improvedProposal = await runProposalGenerator({
      prospect_intel_json: latestResult.research_output ?? '',
      pre_call_brief: latestResult.analysis_output ?? '',
      call_analysis: callAnalysis,
      company_name: prospect.company_name,
      contact_name: prospect.contact_name ?? undefined,
      currency: selectedCurrency,
      additional_context:
        typeof prospect.additional_context === 'string' ? prospect.additional_context : undefined,
      sales_interaction_notes: salesNotes || undefined,
      improvement_feedback: learningContext
        ? `${feedback.trim()}\n\n${learningContext}`
        : feedback.trim(),
    });

    // Persist improved proposal + feedback entry
    await supabase
      .from('prospects')
      .update({ proposal: improvedProposal, proposal_currency: selectedCurrency })
      .eq('id', prospect_id);

    const { data: latestAr } = await supabase
      .from('agent_results')
      .select('id')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAr?.id) {
      await supabase
        .from('agent_results')
        .update({ outreach_output: improvedProposal })
        .eq('id', latestAr.id);
    }

    await supabase.from('proposal_feedback').insert({
      prospect_id,
      user_id: user.id,
      feedback: feedback.trim(),
      improved_proposal: improvedProposal,
      currency: selectedCurrency,
    });

    return NextResponse.json({ success: true, proposal: improvedProposal });
  } catch (error) {
    console.error('Proposal improvement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Proposal improvement failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
