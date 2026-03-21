import { NextRequest, NextResponse } from 'next/server';
import { fetchWebsiteContent } from '@/lib/utils/web-fetcher';
import { runProspectIntel } from '@/lib/agents/prospect-intel';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name,
      website_url,
      contact_name,
      contact_title,
      linkedin_url,
      linkedin_text,
      website_text,
      notes,
      additional_context,
      prospect_requested_call,
    } = body as Record<string, unknown>;

    if (!String(company_name ?? '').trim()) {
      return NextResponse.json({ success: false, error: 'company_name is required' }, { status: 400 });
    }

    let website_content_preview = '';
    const websiteUrlStr = website_url ? String(website_url).trim() : '';
    if (websiteUrlStr) {
      const webData = await fetchWebsiteContent(websiteUrlStr);
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

    const { raw, parsed } = await runProspectIntel({
      company_name: String(company_name ?? ''),
      website_url: websiteUrlStr || undefined,
      linkedin_url: linkedin_url ? String(linkedin_url) : undefined,
      linkedin_text: linkedin_text ? String(linkedin_text) : undefined,
      website_text: website_text ? String(website_text) : undefined,
      contact_name: contact_name ? String(contact_name) : undefined,
      contact_title: contact_title ? String(contact_title) : undefined,
      notes: notes ? String(notes) : undefined,
      website_content_preview: website_content_preview || undefined,
      additional_context: additional_context ? String(additional_context) : undefined,
      prospect_requested_call_hint:
        typeof prospect_requested_call === 'boolean' ? prospect_requested_call : undefined,
    });

    return NextResponse.json({
      success: true,
      prospect_intel_json: raw,
      prospect_intel: parsed,
      icp_score: parsed?.icp_fit_score ?? null,
      timing_score: parsed?.timing_score ?? null,
      interest_score: parsed?.interest_score ?? null,
      prospect_requested_call: parsed?.prospect_requested_call ?? null,
      priority: parsed?.priority ?? null,
    });
  } catch (error) {
    console.error('Prospect Intel agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Prospect Intel failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
