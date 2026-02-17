'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{icp.name}</CardTitle>
          {icp.description && (
            <p className="mt-1 text-sm text-muted-foreground">{icp.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/icp/new?edit=${icp.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {icp.industry.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {icp.industry.map((ind) => (
              <Badge key={ind} variant="secondary">{ind}</Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {(icp.company_size_min || icp.company_size_max) && (
            <span>
              Size: {icp.company_size_min || '?'} - {icp.company_size_max || '?'}
            </span>
          )}
          {icp.job_titles.length > 0 && (
            <span>Titles: {icp.job_titles.length}</span>
          )}
          {icp.locations.length > 0 && (
            <span>Locations: {icp.locations.length}</span>
          )}
          {icp.technologies.length > 0 && (
            <span>Tech: {icp.technologies.length}</span>
          )}
        </div>

        <Button
          className="w-full"
          onClick={() => onGenerate(icp.id)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Leads
        </Button>
      </CardContent>
    </Card>
  );
}
