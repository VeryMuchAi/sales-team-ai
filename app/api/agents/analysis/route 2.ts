import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/ai/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface AnalysisRequest {
  research: string;
  company_name: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();

    const userPrompt = `
Based on this research, score and analyze this prospect:

**Research Output:**
${body.research}

**Analysis Task:**
Provide a strategic assessment with these components:

1. **ICP Fit Score (1-10)**
   - How well they match our ideal customer profile
   - Consider: industry, size, tech stack, decision-maker accessibility
   - Reasoning for the score

2. **Timing Score (1-10)**
   - Urgency and readiness to buy
   - Consider: growth signals, recent changes, visible pain points
   - Reasoning for the score

3. **Best Angle for Outreach**
   - What specific pain point can we solve?
   - Which value proposition resonates most?
   - Concrete angle based on research findings

4. **Potential Objections**
   - What concerns might they raise?
   - Budget/timing/competition objections to pre-handle
   - How to address each

5. **Budget Likelihood**
   - Assess their ability and willingness to invest
   - Consider funding, size, growth stage
   - Realistic budget range if possible

6. **Recommended Priority Level**
   - **HOT**: Strong fit + urgent timing (scores 7-10 on both)
   - **WARM**: Good fit or decent timing (scores 5-8)
   - **COLD**: Poor fit or bad timing (scores 1-4)
   
Provide clear reasoning for each assessment. Be honest and critical - not every prospect is a good fit.

**Context:** We are verymuch.ai - we build AI-powered sales and marketing automation systems for businesses.
    `.trim();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3072,
      system: "You are a sales strategist who scores and prioritizes prospects. You work for verymuch.ai — we build AI-powered sales and marketing automation systems for businesses. Be analytical, strategic, and honest. Provide scores with clear reasoning. Don't oversell — acknowledge when fit or timing isn't ideal.",
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const analysisOutput = message.content
      .filter((block) => block.type === 'text')
      .map((block) => 'text' in block ? block.text : '')
      .join('\n');

    // Extract scores with regex (basic parsing)
    const icpMatch = analysisOutput.match(/ICP.*?(\d+)\/10/i);
    const timingMatch = analysisOutput.match(/Timing.*?(\d+)\/10/i);
    const priorityMatch = analysisOutput.match(/Priority.*?(HOT|WARM|COLD)/i);

    const icpScore = icpMatch ? parseInt(icpMatch[1]) : null;
    const timingScore = timingMatch ? parseInt(timingMatch[1]) : null;
    const priority = priorityMatch ? priorityMatch[1].toUpperCase() : null;

    return NextResponse.json({
      success: true,
      analysis: analysisOutput,
      icp_score: icpScore,
      timing_score: timingScore,
      priority,
    });
  } catch (error) {
    console.error('Analysis agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
