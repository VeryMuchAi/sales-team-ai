import { analyzeWithJSON } from './openai';
import type { Lead } from '@/lib/types';

interface EnrichResult {
  company_website: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_revenue: string | null;
  company_location: string | null;
  company_description: string | null;
  contact_title: string | null;
  contact_linkedin: string | null;
}

export async function enrichLead(lead: Lead): Promise<Partial<Lead>> {
  const systemPrompt = `You are a B2B data enrichment expert. Given partial information about a company/lead, fill in missing details with realistic, plausible information based on your knowledge.

Only fill in fields that are currently null/empty. Return JSON with only the fields you can enrich:
{
  "company_website": "string or null",
  "company_industry": "string or null",
  "company_size": "string or null",
  "company_revenue": "string or null",
  "company_location": "string or null",
  "company_description": "string or null",
  "contact_title": "string or null",
  "contact_linkedin": "string or null"
}`;

  const userPrompt = `Enrich this lead with missing information:

Company: ${lead.company_name}
Website: ${lead.company_website || 'MISSING'}
Industry: ${lead.company_industry || 'MISSING'}
Size: ${lead.company_size || 'MISSING'}
Revenue: ${lead.company_revenue || 'MISSING'}
Location: ${lead.company_location || 'MISSING'}
Description: ${lead.company_description || 'MISSING'}
Contact: ${lead.contact_name || 'MISSING'}
Title: ${lead.contact_title || 'MISSING'}
LinkedIn: ${lead.contact_linkedin || 'MISSING'}

Only provide values for fields marked MISSING. Return null for fields that already have values.`;

  const enriched = await analyzeWithJSON<EnrichResult>(systemPrompt, userPrompt);

  // Only return fields that were actually missing
  const updates: Partial<Lead> = {};
  if (!lead.company_website && enriched.company_website) updates.company_website = enriched.company_website;
  if (!lead.company_industry && enriched.company_industry) updates.company_industry = enriched.company_industry;
  if (!lead.company_size && enriched.company_size) updates.company_size = enriched.company_size;
  if (!lead.company_revenue && enriched.company_revenue) updates.company_revenue = enriched.company_revenue;
  if (!lead.company_location && enriched.company_location) updates.company_location = enriched.company_location;
  if (!lead.company_description && enriched.company_description) updates.company_description = enriched.company_description;
  if (!lead.contact_title && enriched.contact_title) updates.contact_title = enriched.contact_title;
  if (!lead.contact_linkedin && enriched.contact_linkedin) updates.contact_linkedin = enriched.contact_linkedin;

  return updates;
}
