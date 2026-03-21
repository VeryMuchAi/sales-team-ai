import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWebsiteContent } from '@/lib/utils/web-fetcher';
import { runProspectIntel } from '@/lib/agents/prospect-intel';
import { runPreCallBrief } from '@/lib/agents/pre-call-brief';
import { runCoordinator } from '@/lib/agents/coordinator';
import { upsertLeadFromProspectIntel } from '@/lib/leads/sync-from-prospect';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface AnalyzeRequest {
  company_name: string;
  website_url?: string;
  website_text?: string;
  contact_email?: string;
  contact_name?: string;
  contact_title?: string;
  linkedin_url?: string;
  linkedin_text?: string;
  notes?: string;
  /** Contexto del equipo comercial (reunión, referido, ARRI, etc.) */
  additional_context?: string;
  /** El prospecto solicitó la reunión/llamada (criterio de interés) */
  prospect_requested_call?: boolean;
}

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

    const body: AnalyzeRequest = await req.json();

    if (!body.company_name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    let website_content_preview = '';
    if (body.website_url) {
      const webData = await fetchWebsiteContent(body.website_url);
      if (webData.error) {
        website_content_preview = `Website fetch error: ${webData.error}`;
      } else {
        website_content_preview = `
Website Title: ${webData.title}
Description: ${webData.description}

Content Preview:
${webData.content}
        `.trim();
      }
    }

    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .insert({
        user_id: user.id,
        company_name: body.company_name,
        website_url: body.website_url,
        contact_email: body.contact_email,
        contact_name: body.contact_name,
        contact_title: body.contact_title,
        linkedin_url: body.linkedin_url,
        linkedin_text: body.linkedin_text,
        website_text: body.website_text,
        notes: body.notes,
        additional_context: body.additional_context,
        prospect_name: body.contact_name ?? null,
        stage: 'brief',
      })
      .select()
      .single();

    if (prospectError || !prospect) {
      console.error('Prospect creation error:', prospectError);
      return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 });
    }

    const { raw: prospectIntelJson, parsed: intelParsed } = await runProspectIntel({
      company_name: body.company_name,
      website_url: body.website_url,
      website_text: body.website_text,
      linkedin_url: body.linkedin_url,
      linkedin_text: body.linkedin_text,
      contact_name: body.contact_name,
      contact_title: body.contact_title,
      notes: body.notes,
      website_content_preview: website_content_preview || undefined,
      additional_context: body.additional_context,
      prospect_requested_call_hint:
        typeof body.prospect_requested_call === 'boolean' ? body.prospect_requested_call : undefined,
    });

    const preCallBrief = await runPreCallBrief({
      prospect_intel_json: prospectIntelJson,
      company_name: body.company_name,
      additional_context: body.additional_context,
    });

    const coord = await runCoordinator({
      action: 'synthesize',
      prospect_intel_json: prospectIntelJson,
      pre_call_brief: preCallBrief,
      company_name: body.company_name,
      additional_context: body.additional_context,
    });

    const coordinatorOutput = coord.synthesis ?? '';

    const icpScore = intelParsed?.icp_fit_score ?? null;
    const timingScore = intelParsed?.timing_score ?? null;
    const interestScore = intelParsed?.interest_score ?? null;
    const prospectRequestedCall = intelParsed?.prospect_requested_call ?? null;
    const priority = intelParsed?.priority ?? null;

    let intelForDb: unknown = intelParsed;
    if (!intelForDb) {
      try {
        intelForDb = JSON.parse(prospectIntelJson);
      } catch {
        intelForDb = { raw: prospectIntelJson };
      }
    }

    await supabase
      .from('prospects')
      .update({
        stage: 'brief',
        prospect_intel: intelForDb as Record<string, unknown>,
        pre_call_brief: preCallBrief,
      })
      .eq('id', prospect.id);

    const { data: agentRow, error: resultError } = await supabase
      .from('agent_results')
      .insert({
        prospect_id: prospect.id,
        user_id: user.id,
        research_output: prospectIntelJson,
        analysis_output: preCallBrief,
        outreach_output: null,
        coordinator_output: coordinatorOutput,
        icp_score: icpScore,
        timing_score: timingScore,
        priority: priority as 'HOT' | 'WARM' | 'COLD' | null,
      })
      .select('id')
      .single();

    if (resultError) {
      console.error('Result save error:', resultError);
    }

    const leadSync = await upsertLeadFromProspectIntel(supabase, {
      userId: user.id,
      prospectId: prospect.id,
      companyName: body.company_name,
      websiteUrl: body.website_url,
      linkedinUrl: body.linkedin_url,
      intel: intelParsed,
      intelRaw: prospectIntelJson,
    });
    if ('error' in leadSync) {
      console.error('Lead sync warning:', leadSync.error);
    }

    return NextResponse.json({
      success: true,
      prospect_id: prospect.id,
      result_id: agentRow?.id,
      research: prospectIntelJson,
      prospect_intel: intelParsed,
      prospect_intel_json: prospectIntelJson,
      analysis: preCallBrief,
      pre_call_brief: preCallBrief,
      outreach: null,
      coordinator: coordinatorOutput,
      icp_score: icpScore,
      timing_score: timingScore,
      interest_score: interestScore,
      prospect_requested_call: prospectRequestedCall,
      priority,
      lead_id: 'leadId' in leadSync ? leadSync.leadId : undefined,
      lead_created: 'created' in leadSync ? leadSync.created : undefined,
    });
  } catch (error) {
    console.error('Analyze pipeline error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis pipeline failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
