import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isOpenAIConfigured } from '@/lib/ai/openai';
import { generateLeads } from '@/lib/ai/lead-generator';
import { scoreLead } from '@/lib/ai/lead-scorer';
import type { ICP, Lead } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 });
    }

    const { icp_id, count = 10 } = await req.json();

    if (!icp_id) {
      return NextResponse.json({ error: 'icp_id is required' }, { status: 400 });
    }

    // Fetch ICP
    const { data: icp, error: icpError } = await supabase
      .from('icps')
      .select('*')
      .eq('id', icp_id)
      .eq('user_id', user.id)
      .single();

    if (icpError || !icp) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }

    // Generate leads via AI
    const generatedLeads = await generateLeads(icp as ICP, Math.min(count, 20));

    // Insert leads into database
    const insertData = generatedLeads.map((lead) => ({
      user_id: user.id,
      icp_id,
      company_name: lead.company_name,
      company_website: lead.company_website,
      company_industry: lead.company_industry,
      company_size: lead.company_size,
      company_revenue: lead.company_revenue,
      company_location: lead.company_location,
      company_description: lead.company_description,
      contact_name: lead.contact_name,
      contact_title: lead.contact_title,
      contact_email: lead.contact_email,
      contact_linkedin: lead.contact_linkedin,
      status: 'new' as const,
      source: 'ai_generated' as const,
    }));

    const { data: insertedLeads, error: insertError } = await supabase
      .from('leads')
      .insert(insertData)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Score each lead against the ICP
    const scoredLeads = [];
    for (const lead of (insertedLeads || []) as Lead[]) {
      try {
        const scoreResult = await scoreLead(lead, icp as ICP);
        await supabase
          .from('leads')
          .update({
            ai_score: scoreResult.score,
            ai_score_reasons: scoreResult.reasons,
          })
          .eq('id', lead.id);

        scoredLeads.push({ ...lead, ai_score: scoreResult.score });
      } catch {
        scoredLeads.push(lead);
      }
    }

    return NextResponse.json({ leads: scoredLeads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate leads error:', message);
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
}
