'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Target, TrendingUp, Star } from 'lucide-react';
import type { Lead } from '@/lib/types';

interface Stats {
  totalLeads: number;
  avgScore: number;
  qualifiedLeads: number;
  icpCount: number;
}

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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: Users },
    { label: 'Avg AI Score', value: stats?.avgScore ?? 0, icon: Star },
    { label: 'Qualified', value: stats?.qualifiedLeads ?? 0, icon: TrendingUp },
    { label: 'ICPs', value: stats?.icpCount ?? 0, icon: Target },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leads yet. Create an ICP and generate leads to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{lead.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.contact_name || 'No contact'} &middot; {lead.status}
                    </p>
                  </div>
                  {lead.ai_score !== null && (
                    <span className="text-sm font-semibold text-primary">
                      {lead.ai_score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
