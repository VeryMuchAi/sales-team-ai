'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ICPCard } from '@/components/icp/ICPCard';
import { toast } from 'sonner';
import type { ICP } from '@/lib/types';

export default function ICPListPage() {
  const router = useRouter();
  const [icps, setIcps] = useState<ICP[]>([]);
  const [loading, setLoading] = useState(true);

  const loadICPs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('icps')
      .select('*')
      .order('created_at', { ascending: false });
    setIcps((data || []) as ICP[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadICPs();
  }, [loadICPs]);

  async function handleGenerate(icpId: string) {
    toast.info('Generating leads...');
    const res = await fetch('/api/leads/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icp_id: icpId }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || 'Failed to generate leads');
      return;
    }

    const data = await res.json();
    toast.success(`Generated ${data.leads?.length || 0} leads!`);
    router.push('/dashboard/leads');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#363536]">Ideal Customer Profiles</h1>
        <Button onClick={() => router.push('/dashboard/icp/new')} className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]">
          <Plus className="mr-2 h-4 w-4" />
          New ICP
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : icps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
          <p className="text-[#6B6B6B]">Sin ICPs todavía. Crea uno para empezar a generar leads.</p>
          <Button className="mt-4 bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]" onClick={() => router.push('/dashboard/icp/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First ICP
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {icps.map((icp) => (
            <ICPCard
              key={icp.id}
              icp={icp}
              onDelete={loadICPs}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
