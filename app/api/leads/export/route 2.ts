import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('ai_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvData = (leads || []).map((lead) => ({
    'Company Name': lead.company_name,
    'Website': lead.company_website || '',
    'Industry': lead.company_industry || '',
    'Size': lead.company_size || '',
    'Revenue': lead.company_revenue || '',
    'Location': lead.company_location || '',
    'Contact Name': lead.contact_name || '',
    'Contact Title': lead.contact_title || '',
    'Contact Email': lead.contact_email || '',
    'Contact Phone': lead.contact_phone || '',
    'LinkedIn': lead.contact_linkedin || '',
    'AI Score': lead.ai_score ?? '',
    'Status': lead.status,
    'Source': lead.source,
    'Notes': lead.notes || '',
  }));

  const csv = Papa.unparse(csvData);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
