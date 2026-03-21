'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import type { Lead } from '@/lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const loadLeads = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from('leads')
      .select('*')
      .order('ai_score', { ascending: false, nullsFirst: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%`);
    }

    const { data } = await query;
    setLeads((data || []) as Lead[]);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  function handleExport() {
    window.open('/api/leads/export', '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#363536]">Leads</h1>
        <Button variant="outline" onClick={handleExport} className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <LeadTable leads={leads} onLeadDeleted={loadLeads} />
      )}
    </div>
  );
}
