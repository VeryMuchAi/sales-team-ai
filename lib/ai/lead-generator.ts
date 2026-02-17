import { analyzeWithJSON } from './openai';
import type { ICP } from '@/lib/types';

interface GeneratedLead {
  company_name: string;
  company_website: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_revenue: string | null;
  company_location: string | null;
  company_description: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_linkedin: string | null;
}

interface GenerateResult {
  leads: GeneratedLead[];
}

export async function generateLeads(icp: ICP, count: number = 10): Promise<GeneratedLead[]> {
  const systemPrompt = `You are a B2B lead generation expert. Generate realistic but fictional company leads that match the given Ideal Customer Profile (ICP). Each lead should be plausible and detailed.

Return JSON with this structure:
{
  "leads": [
    {
      "company_name": "string",
      "company_website": "string or null",
      "company_industry": "string or null",
      "company_size": "string (e.g., '50-200 employees')",
      "company_revenue": "string (e.g., '$5M-$20M')",
      "company_location": "string or null",
      "company_description": "string - brief company description",
      "contact_name": "string - realistic full name",
      "contact_title": "string - job title matching ICP targets",
      "contact_email": "string - realistic email",
      "contact_linkedin": "string or null"
    }
  ]
}`;

  const userPrompt = `Generate ${count} leads matching this ICP:

Name: ${icp.name}
Description: ${icp.description || 'N/A'}
Target Industries: ${icp.industry.join(', ') || 'Any'}
Company Size: ${icp.company_size_min || '?'} - ${icp.company_size_max || '?'} employees
Revenue Range: $${icp.revenue_min || '?'} - $${icp.revenue_max || '?'}
Target Job Titles: ${icp.job_titles.join(', ') || 'Decision makers'}
Target Locations: ${icp.locations.join(', ') || 'Any'}
Technologies: ${icp.technologies.join(', ') || 'Any'}
Keywords: ${icp.keywords.join(', ') || 'N/A'}

Make the companies diverse but realistic. Vary company sizes and industries within the ICP parameters.`;

  const result = await analyzeWithJSON<GenerateResult>(systemPrompt, userPrompt);
  return result.leads;
}
