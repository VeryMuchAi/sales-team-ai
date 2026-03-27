'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Loader2, MessageSquarePlus, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { readTranscriptFromFile } from '@/lib/utils/read-transcript-file';
import type { Lead } from '@/lib/types';
import { embeddedProfile, createdByLabel } from '@/lib/utils/creator-display';
import { ProspectIntelCards } from '@/components/prospects/ProspectIntelCards';
import { MarkdownBlock } from '@/components/prospects/MarkdownBlock';
import { StageStepper, defaultTabForStage } from '@/components/prospects/StageStepper';
import { ProspectDocumentsAndNotes } from '@/components/prospects/ProspectDocumentsAndNotes';

type ProposalCurrency = 'USD' | 'EUR' | 'MXN' | 'COP';

const CURRENCY_OPTIONS: { value: ProposalCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'MXN', label: 'MXN', symbol: '$MX' },
  { value: 'COP', label: 'COP', symbol: '$CO' },
];

interface ProspectRow {
  id: string;
  user_id: string;
  profiles?: Lead['profiles'];
  company_name: string;
  website_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  linkedin_url: string | null;
  stage: string | null;
  prospect_intel: Record<string, unknown> | null;
  pre_call_brief: string | null;
  call_transcript: string | null;
  call_analysis: string | null;
  proposal: string | null;
  proposal_currency: ProposalCurrency | null;
  prospect_objections: string | null;
  prospect_comments: string | null;
  prospect_learnings: string | null;
}

interface AgentResultRow {
  id: string;
  research_output: string | null;
  analysis_output: string | null;
  outreach_output: string | null;
  coordinator_output: string | null;
  icp_score: number | null;
  timing_score: number | null;
  priority: 'HOT' | 'WARM' | 'COLD' | null;
  created_at: string;
}

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prospectId = params?.id as string;

  const [prospect, setProspect] = useState<ProspectRow | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResultRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('intel');

  const [transcript, setTranscript] = useState('');
  const [callAnalyzing, setCallAnalyzing] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const [proposalLang, setProposalLang] = useState<'es' | 'en'>('es');
  const [proposalCurrency, setProposalCurrency] = useState<ProposalCurrency>('USD');
  const [showImprovePanel, setShowImprovePanel] = useState(false);
  const [improveFeedback, setImproveFeedback] = useState('');
  const [improveLoading, setImproveLoading] = useState(false);
  const transcriptFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: p, error: pErr } = await supabase
      .from('prospects')
      .select(
        'id, user_id, company_name, website_url, contact_name, contact_email, linkedin_url, stage, prospect_intel, pre_call_brief, call_transcript, call_analysis, proposal, proposal_currency, prospect_objections, prospect_comments, prospect_learnings, profiles(full_name, email)'
      )
      .eq('id', prospectId)
      .single();

    if (pErr || !p) {
      console.error(pErr);
      toast.error('No se encontró el prospecto');
      router.push('/dashboard/prospectos/historial');
      return;
    }

    const { data: ar } = await supabase
      .from('agent_results')
      .select(
        'id, research_output, analysis_output, outreach_output, coordinator_output, icp_score, timing_score, priority, created_at'
      )
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setProspect(p as ProspectRow);
    setAgentResult(ar as AgentResultRow | null);
    setTab(defaultTabForStage(p.stage));
    if ((p as ProspectRow).proposal_currency) {
      setProposalCurrency((p as ProspectRow).proposal_currency!);
    }
    setLoading(false);
  }, [prospectId, router]);

  useEffect(() => {
    if (prospectId) loadData();
  }, [prospectId, loadData]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'bg-[#F0EFED] text-[#6B6B6B]';
    switch (priority) {
      case 'HOT':
        return 'bg-[#FDE7D0] text-[#C4621A]';
      case 'WARM':
        return 'bg-[#D6EDD8] text-[#3D7A4A]';
      case 'COLD':
        return 'bg-[#DDEAEE] text-[#363536]';
      default:
        return 'bg-[#F0EFED] text-[#6B6B6B]';
    }
  };

  async function handleTranscriptFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await readTranscriptFromFile(file);
      if (!text) {
        toast.warning('El archivo parece vacío');
        return;
      }
      setTranscript(text);
      toast.success(`Transcripción cargada (${file.name})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo leer el archivo');
    }
  }

  async function handleAnalyzeCall() {
    if (!transcript.trim()) {
      toast.error('Pega la transcripción de la llamada');
      return;
    }
    setCallAnalyzing(true);
    try {
      const res = await fetch('/api/prospects/call-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_id: prospectId, transcript: transcript.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al analizar');
      toast.success('Llamada analizada');
      setTranscript('');
      setShowTranscriptInput(false);
      await loadData();
      setTab('call');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setCallAnalyzing(false);
    }
  }

  async function handleGenerateProposal() {
    setProposalLoading(true);
    try {
      const res = await fetch('/api/prospects/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_id: prospectId, language: proposalLang, currency: proposalCurrency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar propuesta');
      toast.success('Propuesta generada');
      await loadData();
      setTab('proposal');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setProposalLoading(false);
    }
  }

  async function handleImproveProposal() {
    if (!improveFeedback.trim()) {
      toast.error('Describe las mejoras que necesitas');
      return;
    }
    setImproveLoading(true);
    try {
      const res = await fetch('/api/prospects/proposal/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: prospectId,
          feedback: improveFeedback.trim(),
          currency: proposalCurrency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al mejorar propuesta');
      toast.success('Propuesta mejorada y guardada');
      setImproveFeedback('');
      setShowImprovePanel(false);
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setImproveLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[#6B6B6B]">No se encontró el prospecto.</p>
      </div>
    );
  }

  const intelRaw =
    agentResult?.research_output ??
    (prospect.prospect_intel ? JSON.stringify(prospect.prospect_intel, null, 2) : '') ??
    '';

  const briefText = prospect.pre_call_brief ?? agentResult?.analysis_output ?? '';

  const callAnalysisText =
    typeof prospect.call_analysis === 'string'
      ? prospect.call_analysis
      : prospect.call_analysis != null
        ? JSON.stringify(prospect.call_analysis, null, 2)
        : '';

  const proposalText = prospect.proposal ?? agentResult?.outreach_output ?? '';

  const canGenerateProposal = callAnalysisText.trim().length > 0 && !proposalText.trim();

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push('/dashboard/prospectos/historial')}
        className="border-[#E5E5E5] text-[#363536]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Historial
      </Button>

      <StageStepper stage={prospect.stage} />

      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-[#363536]">{prospect.company_name}</CardTitle>
              <CardDescription>
                {agentResult
                  ? `Analizado el ${new Date(agentResult.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Sin resultado de agentes aún'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-[#E5E5E5] text-[#6B6B6B]">
                {createdByLabel(embeddedProfile(prospect.profiles))}
              </Badge>
              {agentResult?.priority && (
                <Badge className={getPriorityColor(agentResult.priority)}>{agentResult.priority}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {agentResult?.icp_score != null && (
              <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                <p className="text-xs text-[#6B6B6B]">ICP Score</p>
                <p className="text-2xl font-extrabold text-[#363536]">{agentResult.icp_score}/10</p>
              </div>
            )}
            {agentResult?.timing_score != null && (
              <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                <p className="text-xs text-[#6B6B6B]">Timing Score</p>
                <p className="text-2xl font-extrabold text-[#363536]">{agentResult.timing_score}/10</p>
              </div>
            )}
            <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
              <p className="text-xs text-[#6B6B6B]">Prioridad</p>
              <p className="text-2xl font-extrabold text-[#363536]">{agentResult?.priority || 'N/A'}</p>
            </div>
          </div>

          {prospect.website_url && (
            <div className="mt-4 text-sm">
              <span className="text-[#6B6B6B]">Sitio web: </span>
              <a
                href={prospect.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#5BA66B] hover:underline"
              >
                {prospect.website_url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-[#F0EFED] p-1 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="intel" className="text-xs md:text-sm">
            Prospect Intel
          </TabsTrigger>
          <TabsTrigger value="brief" className="text-xs md:text-sm">
            Pre-Call Brief
          </TabsTrigger>
          <TabsTrigger value="call" className="text-xs md:text-sm">
            Call Analysis
          </TabsTrigger>
          <TabsTrigger value="proposal" className="text-xs md:text-sm">
            Propuesta
          </TabsTrigger>
          <TabsTrigger value="material" className="text-xs md:text-sm">
            Material y notas
          </TabsTrigger>
          <TabsTrigger value="action" className="text-xs md:text-sm">
            Coordinador
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intel" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E5E5]"
              onClick={() => handleCopy(intelRaw, 'Prospect Intel')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar JSON
            </Button>
          </div>
          <ProspectIntelCards raw={intelRaw} />
        </TabsContent>

        <TabsContent value="brief" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E5E5]"
              onClick={() => handleCopy(briefText, 'Pre-Call Brief')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
          <Card className="border-[#E5E5E5]">
            <CardContent className="pt-6">
              <MarkdownBlock content={briefText} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="call" className="space-y-4 pt-4">
          {(!callAnalysisText || showTranscriptInput) && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-base text-[#363536]">Transcripción de la discovery call</CardTitle>
                <CardDescription>
                  Pega el texto o sube un archivo (.txt, .md, .csv, .srt, .vtt). Word: guarda como .txt o pega aquí.
                  Puedes guardar varias transcripciones en la pestaña «Material y notas» y usar «Usar en análisis».
                  Las objeciones y notas del equipo también se envían al analizar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={transcriptFileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".txt,.text,.md,.csv,.srt,.vtt,text/plain,text/markdown,text/csv"
                  onChange={handleTranscriptFileChange}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#E5E5E5] text-[#363536]"
                    onClick={() => transcriptFileInputRef.current?.click()}
                    disabled={callAnalyzing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir archivo
                  </Button>
                </div>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcripción..."
                  rows={16}
                  className="min-h-[320px] font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleAnalyzeCall}
                    disabled={callAnalyzing || !transcript.trim()}
                    className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]"
                  >
                    {callAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analizando…
                      </>
                    ) : (
                      'Analizar llamada'
                    )}
                  </Button>
                  {callAnalysisText && showTranscriptInput && (
                    <Button variant="outline" onClick={() => setShowTranscriptInput(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {callAnalysisText && !showTranscriptInput && (
            <>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E5E5E5]"
                  onClick={() => handleCopy(callAnalysisText, 'Call Analysis')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E5E5E5]"
                  onClick={() => {
                    setShowTranscriptInput(true);
                    setTranscript(prospect.call_transcript ?? '');
                  }}
                >
                  Subir nueva transcripción
                </Button>
              </div>
              <Card className="border-[#E5E5E5]">
                <CardContent className="pt-6">
                  <MarkdownBlock content={callAnalysisText} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="material" className="space-y-4 pt-4">
          <ProspectDocumentsAndNotes
            prospectId={prospectId}
            initialObjections={prospect.prospect_objections}
            initialComments={prospect.prospect_comments}
            initialLearnings={prospect.prospect_learnings}
            onNotesSaved={() => loadData()}
            onUseTranscriptForAnalysis={(text) => {
              setTranscript(text);
              setShowTranscriptInput(true);
              setTab('call');
              toast.success('Texto cargado en Call Analysis');
            }}
          />
        </TabsContent>

        <TabsContent value="proposal" className="space-y-4 pt-4">
          {/* Generation controls — shown when no proposal yet OR when user wants to regenerate */}
          {(canGenerateProposal || (proposalText && !showImprovePanel)) && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-base text-[#363536]">
                  {proposalText ? 'Configuración de la propuesta' : 'Generar propuesta pre-aprobada'}
                </CardTitle>
                <CardDescription>
                  Selecciona moneda e idioma. El agente generará una propuesta personalizada lista para presentar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currency selector */}
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="w-16 shrink-0 text-[#363536]">Moneda</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProposalCurrency(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          proposalCurrency === opt.value
                            ? 'border-[#AAD4AE] bg-[#AAD4AE] text-[#363536]'
                            : 'border-[#E5E5E5] text-[#6B6B6B] hover:border-[#AAD4AE]'
                        }`}
                      >
                        <span className="mr-1 opacity-60">{opt.symbol}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language selector */}
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="w-16 shrink-0 text-[#363536]">Idioma</Label>
                  <div className="flex rounded-lg border border-[#E5E5E5] p-0.5">
                    <button
                      type="button"
                      onClick={() => setProposalLang('es')}
                      className={`rounded-md px-3 py-1 text-sm ${
                        proposalLang === 'es' ? 'bg-[#AAD4AE] text-[#363536]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      ES
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposalLang('en')}
                      className={`rounded-md px-3 py-1 text-sm ${
                        proposalLang === 'en' ? 'bg-[#AAD4AE] text-[#363536]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {canGenerateProposal && (
                  <Button
                    onClick={handleGenerateProposal}
                    disabled={proposalLoading}
                    className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]"
                  >
                    {proposalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando propuesta…
                      </>
                    ) : (
                      'Generar propuesta pre-aprobada'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {proposalText ? (
            <>
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#AAD4AE] text-[#3D7A4A]">
                    {prospect.proposal_currency ?? proposalCurrency}
                  </Badge>
                  <span className="text-xs text-[#6B6B6B]">Propuesta pre-aprobada</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5]"
                    onClick={() => handleCopy(proposalText, 'Propuesta')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5]"
                    onClick={() => {
                      setShowImprovePanel((v) => !v);
                    }}
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Pedir mejoras
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5]"
                    onClick={handleGenerateProposal}
                    disabled={proposalLoading}
                  >
                    {proposalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Regenerar
                  </Button>
                </div>
              </div>

              {/* Improve panel */}
              {showImprovePanel && (
                <Card className="border-[#AAD4AE] bg-[#F6FBF6]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#363536]">Pedir mejoras al agente</CardTitle>
                    <CardDescription>
                      Describe qué quieres ajustar. El agente aprenderá de estas instrucciones para
                      propuestas futuras de este prospecto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={improveFeedback}
                      onChange={(e) => setImproveFeedback(e.target.value)}
                      placeholder="Ej: Ajusta los precios a MXN, sé más directo en el resumen ejecutivo, añade más detalles sobre la Fase 1…"
                      rows={4}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleImproveProposal}
                        disabled={improveLoading || !improveFeedback.trim()}
                        className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]"
                        size="sm"
                      >
                        {improveLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mejorando…
                          </>
                        ) : (
                          'Aplicar mejoras'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowImprovePanel(false);
                          setImproveFeedback('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Proposal content */}
              <Card className="border-[#E5E5E5]">
                <CardContent className="pt-6">
                  <MarkdownBlock content={proposalText} />
                </CardContent>
              </Card>
            </>
          ) : (
            !callAnalysisText.trim() && (
              <p className="text-sm text-[#6B6B6B]">
                Primero completa el análisis de la llamada en la pestaña Call Analysis.
              </p>
            )
          )}
        </TabsContent>

        <TabsContent value="action" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E5E5]"
              onClick={() => handleCopy(agentResult?.coordinator_output ?? '', 'Coordinador')}
              disabled={!agentResult?.coordinator_output}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
          <Card className="border-[#E5E5E5]">
            <CardContent className="pt-6">
              <MarkdownBlock content={agentResult?.coordinator_output ?? ''} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
