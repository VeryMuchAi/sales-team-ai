'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead } from '@/lib/types';
import { embeddedProfile, createdByLabel } from '@/lib/utils/creator-display';

interface ProspectWithResult {
  id: string;
  user_id: string;
  company_name: string;
  website_url: string | null;
  created_at: string;
  profiles?: Lead['profiles'];
  agent_results: {
    id: string;
    icp_score: number | null;
    timing_score: number | null;
    priority: 'HOT' | 'WARM' | 'COLD' | null;
    created_at: string;
  }[];
}

export default function HistorialPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<ProspectWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadProspects = useCallback(async () => {
    const supabase = createClient();

    let query = supabase
      .from('prospects')
      .select(
        'id, user_id, company_name, website_url, created_at, profiles(full_name, email), agent_results(id, icp_score, timing_score, priority, created_at)'
      )
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('company_name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Load prospects error:', error);
      toast.error('Error al cargar prospectos');
      return;
    }

    let filtered = (data || []) as ProspectWithResult[];

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        (p) => p.agent_results[0]?.priority === priorityFilter.toUpperCase()
      );
    }

    setProspects(filtered);
    setLoading(false);
  }, [search, priorityFilter]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleExport = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('prospects')
        .select('*, agent_results(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = [
        'Empresa',
        'Sitio Web',
        'ICP Score',
        'Timing Score',
        'Prioridad',
        'Fecha Análisis',
      ];

      const rows = (data || []).map((p: any) => {
        const result = p.agent_results?.[0] || {};
        return [
          p.company_name,
          p.website_url || '',
          result.icp_score || '',
          result.timing_score || '',
          result.priority || '',
          new Date(p.created_at).toLocaleDateString('es-ES'),
        ];
      });

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospectos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exportado exitosamente');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar CSV');
    }
  };

  const handleViewDetails = async (prospectId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('agent_results')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      toast.error('No se encontraron resultados para este prospecto');
      return;
    }

    // Store in session storage for the details page
    sessionStorage.setItem('prospect-result', JSON.stringify(data));
    router.push(`/dashboard/prospectos/historial/${prospectId}`);
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'bg-gray-500';
    switch (priority) {
      case 'HOT':
        return 'bg-red-500';
      case 'WARM':
        return 'bg-orange-500';
      case 'COLD':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Prospectos</h1>
          <p className="text-sm text-muted-foreground">
            Todos los prospectos analizados por el equipo de agentes
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/prospectos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nuevo Análisis
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Prospectos Analizados</CardTitle>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="hot">HOT</SelectItem>
                <SelectItem value="warm">WARM</SelectItem>
                <SelectItem value="cold">COLD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : prospects.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron prospectos. Analiza tu primer prospecto para empezar.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/dashboard/prospectos')}
              >
                Analizar Prospecto
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-center">ICP Score</TableHead>
                    <TableHead className="text-center">Timing Score</TableHead>
                    <TableHead className="text-center">Prioridad</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((prospect) => {
                    const result = prospect.agent_results[0];
                    return (
                      <TableRow key={prospect.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prospect.company_name}</p>
                            {prospect.website_url && (
                              <a
                                href={prospect.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:underline"
                              >
                                {prospect.website_url}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {result?.icp_score !== null ? (
                            <span className="font-semibold">{result.icp_score}/10</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {result?.timing_score !== null ? (
                            <span className="font-semibold">{result.timing_score}/10</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {result?.priority ? (
                            <Badge className={getPriorityColor(result.priority)}>
                              {result.priority}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[160px] text-xs text-muted-foreground">
                          {createdByLabel(embeddedProfile(prospect.profiles))}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(prospect.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(prospect.id)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
