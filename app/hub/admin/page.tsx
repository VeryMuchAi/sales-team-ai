import { createClient } from '@/lib/supabase/server';
import { GraduationCap, Users, CheckCircle2, Hourglass } from 'lucide-react';
import type { HubMetrics } from '@/lib/types/hub';

/**
 * Admin del Hub — lista de aplicaciones con filtros y cards de métricas.
 * Shell en Fase 1: cards + placeholder de tabla. La tabla real con filtros
 * y acciones llega en Fase 3.
 */
export default async function HubAdminPage() {
  const supabase = await createClient();
  const { data: metricsData } = await supabase.rpc('get_hub_metrics');
  const metrics = (metricsData as HubMetrics | null) ?? {
    total: 0,
    pending_review: 0,
    ready_for_interview: 0,
    human_review: 0,
    accepted_pending_setup: 0,
    active_in_certification: 0,
    certification_in_progress: 0,
    certified: 0,
    available: 0,
    engaged: 0,
  };

  const cards = [
    {
      label: 'Aplicaciones totales',
      value: metrics.total,
      icon: Users,
      color: { bg: 'bg-[#DDEAEE]', icon: 'text-[#4A8FA8]' },
    },
    {
      label: 'Por revisar',
      value: metrics.pending_review + metrics.human_review,
      icon: Hourglass,
      color: { bg: 'bg-[#FDE7D0]', icon: 'text-[#C4621A]' },
    },
    {
      label: 'En certificación',
      value: metrics.active_in_certification + metrics.certification_in_progress,
      icon: GraduationCap,
      color: { bg: 'bg-[#F0EFED]', icon: 'text-[#363536]' },
    },
    {
      label: 'Certificados',
      value: metrics.certified,
      icon: CheckCircle2,
      color: { bg: 'bg-[#D6EDD8]', icon: 'text-[#5BA66B]' },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#363536]">Hub · Talento</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Aplicaciones, certificación y asignación de proyectos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B6B6B]">{card.label}</p>
                <div className={`rounded-lg p-2 ${card.color.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color.icon}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#363536]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
        <div className="border-b border-[#E5E5E5] px-6 py-4">
          <h2 className="font-semibold text-[#363536]">Aplicaciones recientes</h2>
        </div>
        <div className="p-6 text-sm text-[#6B6B6B]">
          Shell Fase 1 — la tabla con filtros (status, score, fecha, país) y
          acciones (aprobar, pedir info, rechazar) se construye en Fase 3.
        </div>
      </div>
    </div>
  );
}
