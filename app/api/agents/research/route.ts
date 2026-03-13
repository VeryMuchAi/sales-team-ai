import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { fetchWebsiteContent } from '@/lib/utils/web-fetcher';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ResearchRequest {
  company_name: string;
  website_url?: string;
  contact_name?: string;
  contact_title?: string;
  linkedin_url?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ResearchRequest = await req.json();

    // Fetch website content if URL provided
    let websiteContent = '';
    if (body.website_url) {
      const webData = await fetchWebsiteContent(body.website_url);
      if (webData.error) {
        websiteContent = `Website fetch error: ${webData.error}`;
      } else {
        websiteContent = `
Website Title: ${webData.title}
Description: ${webData.description}

Content Preview:
${webData.content}
        `.trim();
      }
    }

    // Build user prompt with all prospect data
    const userPrompt = `
For this company, find and structure comprehensive intelligence:

**Prospect Data:**
- Company: ${body.company_name}
${body.website_url ? `- Website: ${body.website_url}` : ''}
${body.contact_name ? `- Contact: ${body.contact_name}` : ''}
${body.contact_title ? `- Title: ${body.contact_title}` : ''}
${body.linkedin_url ? `- LinkedIn: ${body.linkedin_url}` : ''}
${body.notes ? `- Additional Context: ${body.notes}` : ''}

${websiteContent ? `**Website Content:**\n${websiteContent}\n` : ''}

**Research Task:**
Build a comprehensive intelligence profile with these sections:

1. **Main Product/Service & Value Proposition**
   - What they sell and to whom
   - Key differentiators
   - Core value proposition

2. **Recent Funding or Growth Signals**
   - Any funding rounds, acquisitions, or partnerships
   - Growth indicators (hiring, expansion, press)
   - Financial health signals

3. **Key Decision Makers**
   - C-level executives and their backgrounds
   - Relevant department heads
   - Who likely owns buying decisions for our solutions

4. **Tech Stack (if available)**
   - Technologies they use or advertise
   - Job postings mentioning specific tools
   - Integration opportunities

5. **Pain Points & Challenges**
   - Problems visible from website, reviews, social media
   - Industry challenges they face
   - Inefficiencies in their current approach

6. **Company Profile**
   - Size (employee count)
   - Location and market presence
   - Industry position and competitors

Format as a structured brief with clear sections and bullet points.
If information is unavailable, note it clearly rather than speculating.
    `.trim();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: "You are a sales research specialist. Your job is to build comprehensive intelligence profiles on prospects. Be thorough, factual, and structured. If information isn't available from the provided data, clearly state that rather than making assumptions.",
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const researchOutput = message.content
      .filter((block) => block.type === 'text')
      .map((block) => 'text' in block ? block.text : '')
      .join('\n');

    return NextResponse.json({
      success: true,
      research: researchOutput,
    });
  } catch (error) {
    console.error('Research agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Research failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
