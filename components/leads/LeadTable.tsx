'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { embeddedProfile, createdByLabel } from '@/lib/utils/creator-display';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LeadScoreBadge } from './LeadScoreBadge';
import { LeadStatusBadge } from './LeadStatusBadge';
import type { Lead } from '@/lib/types';

interface LeadTableProps {
  leads: Lead[];
  /** Recarga la lista tras borrar (ej. loadLeads del padre) */
  onLeadDeleted?: () => void;
}

export function LeadTable({ leads, onLeadDeleted }: LeadTableProps) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  async function handleDelete(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation();
    if (
      !confirm(
        `¿Eliminar el lead "${lead.company_name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'No se pudo eliminar');
      }
      toast.success('Lead eliminado');
      onLeadDeleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Creado por</TableHead>
            <TableHead className="w-[72px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-[#6B6B6B]">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => {
                  if (lead.source === 'ai_generated' && lead.prospect_id) {
                    router.push(`/dashboard/prospectos/historial/${lead.prospect_id}`);
                  } else {
                    router.push(`/dashboard/leads/${lead.id}`);
                  }
                }}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.company_name}</p>
                    <p className="text-xs text-[#6B6B6B]">{lead.company_location || ''}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{lead.contact_name || '--'}</p>
                    <p className="text-xs text-[#6B6B6B]">{lead.contact_title || ''}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.company_industry || '--'}</TableCell>
                <TableCell className="text-center">
                  <LeadScoreBadge score={lead.ai_score} />
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-xs">
                  {lead.source === 'ai_generated' ? (
                    <span className="inline-flex items-center rounded-full bg-[#D6EDD8] px-2 py-0.5 font-medium text-[#3D7A4A]">
                      AI Generated
                    </span>
                  ) : (
                    <span className="text-[#6B6B6B]">{lead.source}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[140px] text-xs text-[#6B6B6B]">
                  {createdByLabel(embeddedProfile(lead.profiles))}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {currentUserId === lead.user_id ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#6B6B6B] hover:text-red-600"
                      title="Eliminar lead"
                      onClick={(e) => handleDelete(e, lead)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-[#B0B0B0]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
