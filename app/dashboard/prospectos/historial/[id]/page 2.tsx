'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ProspectResult {
  id: string;
  prospect_id: string;
  research_output: string;
  analysis_output: string;
  outreach_output: string;
  coordinator_output: string;
  icp_score: number | null;
  timing_score: number | null;
  priority: 'HOT' | 'WARM' | 'COLD' | null;
  created_at: string;
  prospects: {
    company_name: string;
    website_url: string | null;
    contact_name: string | null;
    contact_email: string | null;
  };
}

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prospectId = params?.id as string;

  const [result, setResult] = useState<ProspectResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('agent_results')
        .select('*, prospects(company_name, website_url, contact_name, contact_email)')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Load result error:', error);
        toast.error('Error al cargar el análisis');
        router.push('/dashboard/prospectos/historial');
        return;
      }

      setResult(data as ProspectResult);
      setLoading(false);
    }

    if (prospectId) {
      loadResult();
    }
  }, [prospectId, router]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No se encontró el análisis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/dashboard/prospectos/historial')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Historial
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{result.prospects.company_name}</CardTitle>
              <CardDescription>
                Analizado el {new Date(result.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {result.priority && (
                <Badge className={getPriorityColor(result.priority)}>
                  {result.priority}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {result.icp_score !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">ICP Score</p>
                <p className="text-2xl font-bold">{result.icp_score}/10</p>
              </div>
            )}
            {result.timing_score !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Timing Score</p>
                <p className="text-2xl font-bold">{result.timing_score}/10</p>
              </div>
            )}
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Prioridad</p>
              <p className="text-2xl font-bold">{result.priority || 'N/A'}</p>
            </div>
          </div>

          {result.prospects.website_url && (
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground">Sitio web: </span>
              <a
                href={result.prospects.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {result.prospects.website_url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="research" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="research">🔍 Research</TabsTrigger>
          <TabsTrigger value="analysis">📊 Analysis</TabsTrigger>
          <TabsTrigger value="outreach">✉️ Outreach</TabsTrigger>
          <TabsTrigger value="action">📋 Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Investigación de la Empresa</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.research_output, 'Investigación')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.research_output}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Análisis Estratégico</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.analysis_output, 'Análisis')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.analysis_output}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outreach" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mensajes de Outreach</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.outreach_output, 'Outreach')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Todo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.outreach_output}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plan de Acción</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.coordinator_output, 'Plan de Acción')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.coordinator_output}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
