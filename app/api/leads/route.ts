import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const icpId = searchParams.get('icp_id');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') === 'asc';

  let query = supabase
    .from('leads')
    .select('*, profiles(full_name, email)');

  if (status) query = query.eq('status', status);
  if (icpId) query = query.eq('icp_id', icpId);
  if (search) query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%`);

  query = query.order(sortBy, { ascending: order });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: user.id,
      company_name: body.company_name,
      company_website: body.company_website || null,
      company_industry: body.company_industry || null,
      company_size: body.company_size || null,
      company_revenue: body.company_revenue || null,
      company_location: body.company_location || null,
      company_description: body.company_description || null,
      contact_name: body.contact_name || null,
      contact_title: body.contact_title || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      contact_linkedin: body.contact_linkedin || null,
      status: 'new',
      source: 'manual',
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
