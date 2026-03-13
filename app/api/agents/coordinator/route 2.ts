import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/ai/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CoordinatorRequest {
  research: string;
  analysis: string;
  outreach: string;
  company_name: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CoordinatorRequest = await req.json();

    const today = new Date().toISOString().split('T')[0];

    const userPrompt = `
Create a final action plan compiling everything for this prospect:

**Research Output:**
${body.research}

**Analysis Output:**
${body.analysis}

**Outreach Messages:**
${body.outreach}

**Coordination Task:**
Synthesize all agent outputs into a clear, actionable plan:

### 1. Executive Summary
- 2-3 sentence overview of this prospect
- Key opportunity and challenge
- Why they're worth pursuing (or not)

### 2. Outreach Sequence Order
- Which message to send first, second, third
- Clear rationale for the sequence
- Timing between each touchpoint

### 3. Channel Priority
- LinkedIn vs Email vs Phone
- Reasoning based on prospect profile
- Backup channels if primary doesn't work

### 4. Suggested Timeline
- Today's date: ${today}
- Specific suggested send dates for each message
- Time of day recommendations if relevant
- Follow-up schedule

### 5. Key Talking Points (If They Respond)
- Main value propositions to emphasize
- Specific problems we can solve for them
- Questions to ask to qualify further
- Social proof or case studies to mention

### 6. Agent Findings Summary
- Brief recap of all research insights
- Strategic conclusions from analysis
- Ready-to-use outreach templates
- Any yellow/red flags to be aware of

Format this as a clean, scannable action plan that a sales rep can review in 2 minutes and then execute immediately.

**Context:** Prospect is ${body.company_name}. This plan should be specific to them, not generic.
    `.trim();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3072,
      system: "You are a sales operations coordinator. You synthesize all agent outputs into actionable plans. Be clear, concise, and practical. Format information so it's scannable and immediately useful. Think like a sales manager briefing their team before a call.",
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const coordinatorOutput = message.content
      .filter((block) => block.type === 'text')
      .map((block) => 'text' in block ? block.text : '')
      .join('\n');

    return NextResponse.json({
      success: true,
      coordinator: coordinatorOutput,
    });
  } catch (error) {
    console.error('Coordinator agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Coordinator failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
