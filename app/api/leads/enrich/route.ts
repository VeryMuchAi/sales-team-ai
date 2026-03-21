import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isOpenAIConfigured } from '@/lib/ai/openai';
import { enrichLead } from '@/lib/ai/lead-enricher';
import type { Lead } from '@/lib/types';

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

    const { lead_id } = await req.json();

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const enriched = await enrichLead(lead as Lead);

    if (Object.keys(enriched).length > 0) {
      await supabase
        .from('leads')
        .update(enriched)
        .eq('id', lead_id);
    }

    return NextResponse.json({ enriched, fieldsUpdated: Object.keys(enriched).length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Enrich lead error:', message);
    return NextResponse.json({ error: 'Failed to enrich lead' }, { status: 500 });
  }
}
