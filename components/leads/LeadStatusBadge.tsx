import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/lib/types';

const statusConfig: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'New', variant: 'default' },
  contacted: { label: 'Contacted', variant: 'secondary' },
  qualified: { label: 'Qualified', variant: 'default' },
  unqualified: { label: 'Unqualified', variant: 'destructive' },
  converted: { label: 'Converted', variant: 'outline' },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
