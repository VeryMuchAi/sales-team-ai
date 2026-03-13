'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ICP } from '@/lib/types';

interface ICPCardProps {
  icp: ICP;
  onDelete: () => void;
  onGenerate: (icpId: string) => void;
}

export function ICPCard({ icp, onDelete, onGenerate }: ICPCardProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this ICP?')) return;

    const res = await fetch(`/api/icp/${icp.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete ICP');
      return;
    }

    toast.success('ICP deleted');
    onDelete();
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
      <div className="flex flex-row items-start justify-between p-6 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-[#363536]">{icp.name}</h3>
          {icp.description && (
            <p className="mt-1 text-sm text-[#6B6B6B]">{icp.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/icp/new?edit=${icp.id}`)}
            className="text-[#6B6B6B] hover:text-[#363536] hover:bg-[#F0EFED]"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-[#6B6B6B] hover:text-[#E85D5D] hover:bg-[#FDEAEA]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3 px-6 pb-6">
        {icp.industry.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {icp.industry.map((ind) => (
              <span
                key={ind}
                className="inline-flex items-center rounded-full bg-[#DDEAEE] px-2.5 py-0.5 text-xs font-medium text-[#363536]"
              >
                {ind}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm text-[#6B6B6B]">
          {(icp.company_size_min || icp.company_size_max) && (
            <span>
              Tamaño: {icp.company_size_min || '?'} - {icp.company_size_max || '?'}
            </span>
          )}
          {icp.job_titles.length > 0 && (
            <span>Roles: {icp.job_titles.length}</span>
          )}
          {icp.locations.length > 0 && (
            <span>Ubicaciones: {icp.locations.length}</span>
          )}
          {icp.technologies.length > 0 && (
            <span>Tech: {icp.technologies.length}</span>
          )}
        </div>

        <Button
          className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A] font-medium"
          onClick={() => onGenerate(icp.id)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generar Leads
        </Button>
      </div>
    </div>
  );
}
