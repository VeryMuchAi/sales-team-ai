'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import { toast } from 'sonner';
import type { Lead, LeadActivity, LeadStatus } from '@/lib/types';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLead() {
      const res = await fetch(`/api/leads/${params.id}`);
      if (!res.ok) {
        toast.error('Lead not found');
        router.push('/dashboard/leads');
        return;
      }
      const data = await res.json();
      setLead(data.lead);
      setActivities(data.activities || []);
      setLoading(false);
    }
    loadLead();
  }, [params.id, router]);

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/leads/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLead(updated);
      toast.success('Status updated');
    }
  }

  async function handleEnrich() {
    toast.info('Enriching lead...');
    const res = await fetch('/api/leads/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: params.id }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(`Enriched ${data.fieldsUpdated} fields`);
      // Reload lead
      const leadRes = await fetch(`/api/leads/${params.id}`);
      const leadData = await leadRes.json();
      setLead(leadData.lead);
    } else {
      toast.error('Failed to enrich lead');
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este lead? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/leads/${params.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'No se pudo eliminar');
      }
      toast.success('Lead eliminado');
      router.push('/dashboard/leads');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/leads')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{lead.company_name}</h1>
        <LeadScoreBadge score={lead.ai_score} />
      </div>

      <div className="flex flex-wrap gap-3">
        {lead.prospect_id && (
          <Button
            variant="outline"
            className="border-[#AAD4AE] bg-[#D6EDD8]/40 text-[#363536] hover:bg-[#D6EDD8]"
            onClick={() => router.push(`/dashboard/prospectos/historial/${lead.prospect_id}`)}
          >
            Ver en Prospectos AI
          </Button>
        )}
        <Select value={lead.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['new', 'contacted', 'qualified', 'unqualified', 'converted'] as LeadStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleEnrich}>
          <Sparkles className="mr-2 h-4 w-4" />
          Enrich
        </Button>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Website" value={lead.company_website} />
            <Field label="Industry" value={lead.company_industry} />
            <Field label="Size" value={lead.company_size} />
            <Field label="Revenue" value={lead.company_revenue} />
            <Field label="Location" value={lead.company_location} />
            {lead.company_description && (
              <>
                <Separator />
                <p className="text-muted-foreground">{lead.company_description}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Name" value={lead.contact_name} />
            <Field label="Title" value={lead.contact_title} />
            <Field label="Email" value={lead.contact_email} />
            <Field label="Phone" value={lead.contact_phone} />
            <Field label="LinkedIn" value={lead.contact_linkedin} />
          </CardContent>
        </Card>
      </div>

      {lead.ai_score_reasons && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(lead.ai_score_reasons) && lead.ai_score_reasons.length > 0 ? (
              <div className="space-y-2">
                {lead.ai_score_reasons.map((reason, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{reason.factor}</span>
                      <span className="ml-2 text-muted-foreground">{reason.explanation}</span>
                    </div>
                    <Badge variant="outline">{reason.score} pts</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(lead.ai_score_reasons, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  <span>{activity.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || '--'}</span>
    </div>
  );
}
