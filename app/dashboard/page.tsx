'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Target, TrendingUp, Star } from 'lucide-react';
import type { Lead } from '@/lib/types';

interface Stats {
  totalLeads: number;
  avgScore: number;
  qualifiedLeads: number;
  icpCount: number;
}

const statIcons = [Users, Star, TrendingUp, Target];
const statColors = [
  { bg: 'bg-[#DDEAEE]', icon: 'text-[#4A8FA8]' },
  { bg: 'bg-[#D6EDD8]', icon: 'text-[#5BA66B]' },
  { bg: 'bg-[#FDE7D0]', icon: 'text-[#C4621A]' },
  { bg: 'bg-[#F0EFED]', icon: 'text-[#363536]' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const [leadsRes, icpsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('icps').select('id', { count: 'exact' }),
      ]);

      const leads = (leadsRes.data || []) as Lead[];
      const scores = leads.filter((l) => l.ai_score !== null).map((l) => l.ai_score!);

      setStats({
        totalLeads: leads.length,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        qualifiedLeads: leads.filter((l) => l.status === 'qualified').length,
        icpCount: icpsRes.count || 0,
      });

      setRecentLeads(leads.slice(0, 5));
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads ?? 0, iconIndex: 0 },
    { label: 'Score Promedio', value: stats?.avgScore ?? 0, iconIndex: 1 },
    { label: 'Calificados', value: stats?.qualifiedLeads ?? 0, iconIndex: 2 },
    { label: 'ICPs', value: stats?.icpCount ?? 0, iconIndex: 3 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#363536]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Resumen de tu pipeline de ventas</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#363536]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Resumen de tu pipeline de ventas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = statIcons[stat.iconIndex];
          const color = statColors[stat.iconIndex];
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B6B6B]">{stat.label}</p>
                <div className={`rounded-lg p-2 ${color.bg}`}>
                  <Icon className={`h-4 w-4 ${color.icon}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#363536]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
        <div className="border-b border-[#E5E5E5] px-6 py-4">
          <h2 className="font-semibold text-[#363536]">Leads recientes</h2>
        </div>
        <div className="p-6">
          {recentLeads.length === 0 ? (
            <p className="text-sm text-[#6B6B6B]">
              Sin leads todavía. Crea un ICP y genera leads para comenzar.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-[#FAF9F7] p-3 transition-colors hover:bg-[#F0EFED]"
                >
                  <div>
                    <p className="text-sm font-medium text-[#363536]">{lead.company_name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {lead.contact_name || 'Sin contacto'} · {lead.status}
                    </p>
                  </div>
                  {lead.ai_score !== null && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        lead.ai_score >= 80
                          ? 'bg-[#D6EDD8] text-[#3D7A4A]'
                          : lead.ai_score >= 60
                          ? 'bg-[#FDE7D0] text-[#C4621A]'
                          : 'bg-[#DDEAEE] text-[#363536]'
                      }`}
                    >
                      {lead.ai_score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
