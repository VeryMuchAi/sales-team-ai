import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isOpenAIConfigured } from '@/lib/ai/openai';
import { scoreLeadsBatch } from '@/lib/ai/lead-scorer';
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

    const { lead_ids, icp_id } = await req.json();

    if (!icp_id || !lead_ids?.length) {
      return NextResponse.json({ error: 'icp_id and lead_ids are required' }, { status: 400 });
    }

    const { data: icp } = await supabase
      .from('icps')
      .select('*')
      .eq('id', icp_id)
      .eq('user_id', user.id)
      .single();

    if (!icp) {
      return NextResponse.json({ error: 'ICP not found' }, { status: 404 });
    }

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', lead_ids)
      .eq('user_id', user.id);

    if (!leads?.length) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 });
    }

    const scores = await scoreLeadsBatch(leads as Lead[], icp as ICP);

    // Update scores in database
    for (const [leadId, scoreResult] of scores) {
      await supabase
        .from('leads')
        .update({
          ai_score: scoreResult.score,
          ai_score_reasons: scoreResult.reasons,
        })
        .eq('id', leadId);
    }

    return NextResponse.json({
      scored: scores.size,
      results: Object.fromEntries(scores),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Score leads error:', message);
    return NextResponse.json({ error: 'Failed to score leads' }, { status: 500 });
  }
}
