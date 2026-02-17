import { analyzeWithJSON } from './openai';
import type { ICP, Lead, ScoreReason } from '@/lib/types';

interface ScoreResult {
  score: number;
  reasons: ScoreReason[];
}

export async function scoreLead(lead: Lead, icp: ICP): Promise<ScoreResult> {
  const systemPrompt = `You are a B2B lead scoring expert. Score how well a lead matches an Ideal Customer Profile on a scale of 0-100.

Evaluate these factors:
- Industry fit (0-25 points)
- Company size fit (0-20 points)
- Revenue fit (0-15 points)
- Job title relevance (0-20 points)
- Location match (0-10 points)
- Technology/keyword overlap (0-10 points)

Return JSON:
{
  "score": number (0-100),
  "reasons": [
    {
      "factor": "string - e.g., Industry Fit",
      "score": number (points for this factor),
      "explanation": "string - why this score"
    }
  ]
}`;

  const userPrompt = `Score this lead against the ICP:

ICP:
- Name: ${icp.name}
- Industries: ${icp.industry.join(', ') || 'Any'}
- Company Size: ${icp.company_size_min || '?'} - ${icp.company_size_max || '?'}
- Revenue: $${icp.revenue_min || '?'} - $${icp.revenue_max || '?'}
- Job Titles: ${icp.job_titles.join(', ') || 'Any'}
- Locations: ${icp.locations.join(', ') || 'Any'}
- Technologies: ${icp.technologies.join(', ') || 'Any'}
- Keywords: ${icp.keywords.join(', ') || 'Any'}

Lead:
- Company: ${lead.company_name}
- Industry: ${lead.company_industry || 'Unknown'}
- Size: ${lead.company_size || 'Unknown'}
- Revenue: ${lead.company_revenue || 'Unknown'}
- Location: ${lead.company_location || 'Unknown'}
- Contact: ${lead.contact_name || 'Unknown'}, ${lead.contact_title || 'Unknown'}
- Description: ${lead.company_description || 'N/A'}`;

  return analyzeWithJSON<ScoreResult>(systemPrompt, userPrompt);
}

export async function scoreLeadsBatch(leads: Lead[], icp: ICP): Promise<Map<string, ScoreResult>> {
  const results = new Map<string, ScoreResult>();

  // Process in parallel, max 5 at a time
  const batchSize = 5;
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    const scores = await Promise.all(batch.map((lead) => scoreLead(lead, icp)));
    batch.forEach((lead, idx) => {
      results.set(lead.id, scores[idx]);
    });
  }

  return results;
}
