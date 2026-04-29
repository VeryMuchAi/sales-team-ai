import { createClient } from '@/lib/supabase/server';
import { CURRENT_QUARTER, PARTNERSHIP_DEADLINE } from '@/lib/types/okrs';
import type { OkrProgressSummary } from '@/lib/types/okrs';
import { Target, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';

/**
 * OKR Command Center — dashboard del quarter actual con KPI cards arriba
 * y cards de cada OKR abajo. Shell en Fase 1: lee seed data del quarter y
 * muestra los agregados. Interacciones y sparklines en Fase 4.
 */
export default async function OkrDashboardPage() {
  const supabase = await createClient();

  const { data: progressData } = await supabase.rpc('get_okr_progress', {
    p_quarter: CURRENT_QUARTER.id,
  });
  const progress = (progressData as OkrProgressSummary | null) ?? {
    quarter: CURRENT_QUARTER.id,
    total_okrs: 0,
    achieved: 0,
    on_track: 0,
    at_risk: 0,
    behind: 0,
    weighted_progress: 0,
  };

  const deadline = new Date(PARTNERSHIP_DEADLINE);
  const today = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000)
  );

  const kpis = [
    {
      label: 'Progreso global',
      value: `${Math.round(progress.weighted_progress * 100)}%`,
      icon: TrendingUp,
      color: { bg: 'bg-[#D6EDD8]', icon: 'text-[#5BA66B]' },
    },
    {
      label: 'En ruta',
      value: progress.on_track,
      icon: Target,
      color: { bg: 'bg-[#DDEAEE]', icon: 'text-[#4A8FA8]' },
    },
    {
      label: 'En riesgo',
      value: progress.at_risk + progress.behind,
      icon: AlertTriangle,
      color: { bg: 'bg-[#FDE7D0]', icon: 'text-[#C4621A]' },
    },
    {
      label: 'Alcanzados',
      value: progress.achieved,
      icon: Trophy,
      color: { bg: 'bg-[#F0EFED]', icon: 'text-[#363536]' },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#363536]">
            OKR Command Center
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            {CURRENT_QUARTER.label} · Partnership deadline en{' '}
            <span className="font-semibold text-[#363536]">{daysLeft} días</span>{' '}
            (15 jul 2026)
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B6B6B]">{kpi.label}</p>
                <div className={`rounded-lg p-2 ${kpi.color.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color.icon}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#363536]">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
        <div className="border-b border-[#E5E5E5] px-6 py-4">
          <h2 className="font-semibold text-[#363536]">
            OKRs del quarter ({progress.total_okrs})
          </h2>
        </div>
        <div className="p-6 text-sm text-[#6B6B6B]">
          Shell Fase 1 — Fase 4 incluye: cards plegables con barras de progreso
          por KR, sparklines de histórico, botones de update, auto-trackers de
          Stripe/Hub, cron de weekly digest.
        </div>
      </div>
    </div>
  );
}
