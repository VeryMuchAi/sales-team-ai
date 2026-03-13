import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for full pipeline

interface AnalyzeRequest {
  company_name: string;
  website_url?: string;
  contact_email?: string;
  contact_name?: string;
  contact_title?: string;
  linkedin_url?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AnalyzeRequest = await req.json();

    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   `http://localhost:${process.env.PORT || 3000}`;

    // Step 1: Save prospect to database
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
        notes: body.notes,
      })
      .select()
      .single();

    if (prospectError || !prospect) {
      console.error('Prospect creation error:', prospectError);
      return NextResponse.json(
        { error: 'Failed to create prospect' },
        { status: 500 }
      );
    }

    // Step 2: Run Research Agent
    const researchRes = await fetch(`${baseUrl}/api/agents/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: body.company_name,
        website_url: body.website_url,
        contact_name: body.contact_name,
        contact_title: body.contact_title,
        linkedin_url: body.linkedin_url,
        notes: body.notes,
      }),
    });

    if (!researchRes.ok) {
      throw new Error('Research agent failed');
    }

    const researchData = await researchRes.json();
    const researchOutput = researchData.research;

    // Step 3: Run Analysis Agent
    const analysisRes = await fetch(`${baseUrl}/api/agents/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        research: researchOutput,
        company_name: body.company_name,
      }),
    });

    if (!analysisRes.ok) {
      throw new Error('Analysis agent failed');
    }

    const analysisData = await analysisRes.json();
    const analysisOutput = analysisData.analysis;
    const icpScore = analysisData.icp_score;
    const timingScore = analysisData.timing_score;
    const priority = analysisData.priority;

    // Step 4: Run Outreach Agent
    const outreachRes = await fetch(`${baseUrl}/api/agents/outreach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        research: researchOutput,
        analysis: analysisOutput,
        company_name: body.company_name,
        contact_name: body.contact_name,
      }),
    });

    if (!outreachRes.ok) {
      throw new Error('Outreach agent failed');
    }

    const outreachData = await outreachRes.json();
    const outreachOutput = outreachData.outreach;

    // Step 5: Run Coordinator Agent
    const coordinatorRes = await fetch(`${baseUrl}/api/agents/coordinator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        research: researchOutput,
        analysis: analysisOutput,
        outreach: outreachOutput,
        company_name: body.company_name,
      }),
    });

    if (!coordinatorRes.ok) {
      throw new Error('Coordinator agent failed');
    }

    const coordinatorData = await coordinatorRes.json();
    const coordinatorOutput = coordinatorData.coordinator;

    // Step 6: Save results to database
    const { data: result, error: resultError } = await supabase
      .from('agent_results')
      .insert({
        prospect_id: prospect.id,
        user_id: user.id,
        research_output: researchOutput,
        analysis_output: analysisOutput,
        outreach_output: outreachOutput,
        coordinator_output: coordinatorOutput,
        icp_score: icpScore,
        timing_score: timingScore,
        priority: priority,
      })
      .select()
      .single();

    if (resultError) {
      console.error('Result save error:', resultError);
      // Don't fail the request, just log it
    }

    return NextResponse.json({
      success: true,
      prospect_id: prospect.id,
      result_id: result?.id,
      research: researchOutput,
      analysis: analysisOutput,
      outreach: outreachOutput,
      coordinator: coordinatorOutput,
      icp_score: icpScore,
      timing_score: timingScore,
      priority,
    });
  } catch (error) {
    console.error('Analyze pipeline error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis pipeline failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
