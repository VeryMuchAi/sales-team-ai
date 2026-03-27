import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProposalGenerator } from '@/lib/agents/proposal-generator';
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
    const { prospect_id, language, currency } = body as {
      prospect_id?: string;
      language?: 'es' | 'en';
      currency?: 'USD' | 'EUR' | 'MXN' | 'COP';
    };

    if (!prospect_id?.trim()) {
      return NextResponse.json({ success: false, error: 'prospect_id is required' }, { status: 400 });
    }

    const { data: prospect, error: pErr } = await supabase
      .from('prospects')
      .select(
        'id, company_name, contact_name, call_analysis, additional_context, prospect_objections, prospect_comments, prospect_learnings, prospect_intel, pre_call_brief'
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
        {
          success: false,
          error: 'No call analysis found. Upload a transcript via /api/prospects/call-analyze first.',
        },
        { status: 400 }
      );
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
      return NextResponse.json({ success: false, error: 'Missing prior analysis (prospect intel + pre-call brief) for prospect' }, { status: 400 });
    }

    const salesNotes = formatSalesInteractionNotes(
      prospect.prospect_objections as string | null | undefined,
      prospect.prospect_comments as string | null | undefined,
      prospect.prospect_learnings as string | null | undefined
    );

    const validCurrencies = ['USD', 'EUR', 'MXN', 'COP'] as const;
    const selectedCurrency = validCurrencies.includes(currency as (typeof validCurrencies)[number])
      ? (currency as (typeof validCurrencies)[number])
      : 'USD';

    // Auto-fetch the most recent PDF presentation document uploaded by the team
    let document_base64: string | undefined;
    const { data: pdfDocs } = await supabase
      .from('prospect_documents')
      .select('storage_path, mime_type')
      .eq('prospect_id', prospect_id)
      .in('kind', ['presentation', 'other'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (pdfDocs?.length) {
      const pdfDoc = pdfDocs.find(
        (d) => d.mime_type === 'application/pdf' || d.storage_path?.toLowerCase().endsWith('.pdf')
      );
      if (pdfDoc) {
        try {
          const { data: fileData, error: fileErr } = await supabase.storage
            .from('prospect-documents')
            .download(pdfDoc.storage_path);
          if (!fileErr && fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            document_base64 = Buffer.from(arrayBuffer).toString('base64');
          }
        } catch (e) {
          console.warn('Could not load prospect PDF for proposal:', e);
        }
      }
    }

    const proposal = await runProposalGenerator({
      prospect_intel_json: prospectIntelJson,
      pre_call_brief: preCallBriefText,
      call_analysis: callAnalysis,
      company_name: prospect.company_name,
      contact_name: prospect.contact_name ?? undefined,
      language: language === 'en' ? 'en' : 'es',
      currency: selectedCurrency,
      additional_context:
        typeof prospect.additional_context === 'string' ? prospect.additional_context : undefined,
      sales_interaction_notes: salesNotes || undefined,
      document_base64,
    });

    await supabase
      .from('prospects')
      .update({
        stage: 'proposal',
        proposal,
        proposal_currency: selectedCurrency,
      })
      .eq('id', prospect_id);

    const { data: latestAr } = await supabase
      .from('agent_results')
      .select('id')
      .eq('prospect_id', prospect_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAr?.id) {
      await supabase.from('agent_results').update({ outreach_output: proposal }).eq('id', latestAr.id);
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error('Proposal generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Proposal generation failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
