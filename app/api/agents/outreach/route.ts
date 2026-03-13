import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/ai/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface OutreachRequest {
  research: string;
  analysis: string;
  company_name: string;
  contact_name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OutreachRequest = await req.json();

    const userPrompt = `
Using the research and analysis, write 3 outreach variations for this prospect — **ALL IN SPANISH**:

**Research Summary:**
${body.research}

**Strategic Analysis:**
${body.analysis}

**Writing Task:**
Create 3 personalized outreach messages in Spanish:

### 1. LinkedIn Connection Request
- Under 200 characters
- Reference something specific about them or their company
- Conversational and professional
- No sales pitch, just genuine connection
- Format: Provide the message ready to copy

### 2. Cold Email
- Subject line included
- Short (under 150 words)
- Reference a specific pain point or opportunity from research
- One clear call-to-action
- No generic phrases or templates
- Personalized to their situation
- Format: 
  **Asunto:** [subject line]
  
  [email body]

### 3. Follow-up Email (3 days later)
- Different angle from first email
- Add new value or insight
- Don't just "bump" the thread
- Reference the previous email briefly
- Short and actionable
- Format:
  **Asunto:** [subject line]
  
  [email body]

**Requirements:**
- Every message MUST reference something specific from the research
- NO generic templates or phrases
- Write as if you personally researched them
- Use proper Spanish (Spain or Latin America neutral)
- Keep tone professional but warm
- Each message should feel hand-written

**Context:** 
- We are verymuch.ai
- We build AI-powered sales and marketing automation
- The prospect is: ${body.company_name}
${body.contact_name ? `- Contact name: ${body.contact_name}` : ''}
    `.trim();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3072,
      system: "You are an expert sales copywriter. You write hyper-personalized outreach that references specific details about the prospect. Never use templates. Every message must feel hand-written. Write everything in Spanish (neutral Spanish that works across Spain and Latin America). Be conversational, warm, and specific.",
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const outreachOutput = message.content
      .filter((block) => block.type === 'text')
      .map((block) => 'text' in block ? block.text : '')
      .join('\n');

    return NextResponse.json({
      success: true,
      outreach: outreachOutput,
    });
  } catch (error) {
    console.error('Outreach agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Outreach generation failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
