'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LeadScoreBadge } from './LeadScoreBadge';
import { LeadStatusBadge } from './LeadStatusBadge';
import type { Lead } from '@/lib/types';

interface LeadTableProps {
  leads: Lead[];
}

export function LeadTable({ leads }: LeadTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.company_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company_location || ''}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{lead.contact_name || '--'}</p>
                    <p className="text-xs text-muted-foreground">{lead.contact_title || ''}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.company_industry || '--'}</TableCell>
                <TableCell className="text-center">
                  <LeadScoreBadge score={lead.ai_score} />
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {lead.source === 'ai_generated' ? 'AI' : lead.source}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
