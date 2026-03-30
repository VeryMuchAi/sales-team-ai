'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Search, Sparkles, Copy, ArrowLeft, ExternalLink, FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ProspectIntelCards } from '@/components/prospects/ProspectIntelCards';
import { MarkdownBlock } from '@/components/prospects/MarkdownBlock';
import { StageStepper } from '@/components/prospects/StageStepper';
import { createClient } from '@/lib/supabase/client';

interface AnalysisResult {
  prospect_id: string;
  result_id?: string;
  research: string;
  prospect_intel?: Record<string, unknown> | null;
  analysis: string;
  pre_call_brief?: string;
  outreach: string | null;
  coordinator: string;
  icp_score: number | null;
  timing_score: number | null;
  interest_score?: number | null;
  prospect_requested_call?: 'yes' | 'no' | 'unknown' | null;
  priority: 'HOT' | 'WARM' | 'COLD' | null;
}

type AnalysisStep = 'idle' | 'intel' | 'brief' | 'coordinator' | 'complete';

export default function ProspectosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    website_url: '',
    website_text: '',
    contact_email: '',
    contact_name: '',
    contact_title: '',
    linkedin_url: '',
    linkedin_text: '',
    notes: '',
    additional_context: '',
    prospect_requested_call: false,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfStoragePath, setPdfStoragePath] = useState<string | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePdfSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos PDF');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error('El PDF no puede superar 30MB');
      return;
    }
    setPdfFile(file);
    setPdfStoragePath(null);
    setPdfUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${safeName}`;
      const { data, error } = await supabase.storage
        .from('prospect-documents')
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      setPdfStoragePath(data.path);
      toast.success('Documento cargado');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'desconocido';
      toast.error('Error al cargar el documento: ' + msg);
      setPdfFile(null);
    } finally {
      setPdfUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfStoragePath(null);
  };

  const getStepProgress = (step: AnalysisStep): number => {
    const steps = { idle: 0, intel: 30, brief: 60, coordinator: 90, complete: 100 };
    return steps[step] || 0;
  };

  const getStepLabel = (step: AnalysisStep): string => {
    const labels = {
      idle: 'Listo para analizar',
      intel: '🔍 Prospect Intel (ICP + empresa)...',
      brief: '📋 Pre-Call Brief...',
      coordinator: '🧭 Coordinador (siguientes pasos)...',
      complete: '✅ Pipeline listo',
    };
    return labels[step] || '';
  };

  const handleAnalyze = async () => {
    if (!formData.company_name.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setCurrentStep('intel');

    try {
      const stepSequence: AnalysisStep[] = ['intel', 'brief', 'coordinator'];
      let stepIndex = 0;

      const progressInterval = setInterval(() => {
        if (stepIndex < stepSequence.length - 1) {
          stepIndex++;
          setCurrentStep(stepSequence[stepIndex]);
        }
      }, 6000);

      const response = await fetch('/api/prospects/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(pdfStoragePath ? { document_storage_path: pdfStoragePath } : {}),
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setCurrentStep('complete');
      setResult(data);
      toast.success('Análisis completado exitosamente');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Error al analizar prospecto');
      setCurrentStep('idle');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleReset = () => {
    setFormData({
      company_name: '',
      website_url: '',
      website_text: '',
      contact_email: '',
      contact_name: '',
      contact_title: '',
      linkedin_url: '',
      linkedin_text: '',
      notes: '',
      additional_context: '',
      prospect_requested_call: false,
    });
    setResult(null);
    setCurrentStep('idle');
    setPdfFile(null);
    setPdfStoragePath(null);
  };

  const getPriorityStyle = (priority: string | null) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#363536]">Análisis de Prospectos</h1>
          <p className="text-sm text-[#6B6B6B]">
            Flujo Verymuch.ai: Prospect Intel → Pre-Call Brief → Coordinador (propuesta tras transcripción vía API)
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={() => router.push('/dashboard/prospectos/historial')} className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]">
            Ver Historial
          </Button>
        )}
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Prospecto</CardTitle>
            <CardDescription>
              Completa la información para iniciar el análisis con los agentes AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Ej: Factorial HR"
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Sitio Web</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://ejemplo.com"
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Nombre del Contacto</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Juan Pérez"
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_title">Cargo</Label>
                <Input
                  id="contact_title"
                  value={formData.contact_title}
                  onChange={(e) => handleInputChange('contact_title', e.target.value)}
                  placeholder="CEO, Director de Ventas"
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de Contacto</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contacto@empresa.com"
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={analyzing}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="linkedin_text">Perfil LinkedIn (texto pegado, opcional)</Label>
                <Textarea
                  id="linkedin_text"
                  value={formData.linkedin_text}
                  onChange={(e) => handleInputChange('linkedin_text', e.target.value)}
                  placeholder="Pega aquí el resumen del perfil si no hay URL pública..."
                  rows={3}
                  disabled={analyzing}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website_text">Website (texto pegado, opcional)</Label>
                <Textarea
                  id="website_text"
                  value={formData.website_text}
                  onChange={(e) => handleInputChange('website_text', e.target.value)}
                  placeholder="Pega contenido clave del sitio si el fetch automático no es suficiente..."
                  rows={3}
                  disabled={analyzing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_context">Contexto adicional</Label>
              <Textarea
                id="additional_context"
                value={formData.additional_context}
                onChange={(e) => handleInputChange('additional_context', e.target.value)}
                placeholder='Ej: "Este prospecto escribió directamente a Jorge pidiendo reunión", "Viene referido por cliente X", "Completó el ARRI con score alto", "Ya tuvimos una llamada informal"...'
                rows={4}
                disabled={analyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Otras notas internas (opcional)..."
                rows={3}
                disabled={analyzing}
              />
            </div>

            <div className="space-y-2">
              <Label>Documento del cliente (PDF opcional)</Label>
              <p className="text-xs text-[#6B6B6B]">
                Sube una presentación o diagrama que te haya enviado el cliente. Los agentes lo analizarán como contexto.
              </p>
              {pdfFile ? (
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${pdfStoragePath ? 'border-[#AAD4AE] bg-[#D6EDD8]/30' : pdfUploading ? 'border-[#E5E5E5] bg-[#FAF9F7]' : 'border-red-200 bg-red-50'}`}>
                  <FileText className={`h-5 w-5 shrink-0 ${pdfStoragePath ? 'text-[#3D7A4A]' : 'text-[#6B6B6B]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#363536]">{pdfFile.name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {pdfUploading ? 'Subiendo...' : pdfStoragePath ? 'Listo — el agente lo analizará' : 'Error al subir'}
                    </p>
                  </div>
                  {!analyzing && !pdfUploading && (
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="rounded p-1 text-[#6B6B6B] hover:text-[#363536]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#E5E5E5] bg-[#FAF9F7] p-6 transition-colors ${analyzing ? 'cursor-not-allowed opacity-50' : 'hover:border-[#AAD4AE] hover:bg-[#F0EFED]'}`}>
                  <Upload className="h-6 w-6 text-[#6B6B6B]" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#363536]">Subir presentación o diagrama</p>
                    <p className="text-xs text-[#6B6B6B]">PDF hasta 30MB</p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={analyzing}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePdfSelect(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
              <Checkbox
                id="prospect_requested_call"
                checked={formData.prospect_requested_call}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({ ...prev, prospect_requested_call: v === true }))
                }
                disabled={analyzing}
                className="mt-0.5 border-[#AAD4AE] data-[state=checked]:bg-[#AAD4AE] data-[state=checked]:text-[#363536]"
              />
              <div className="space-y-1">
                <Label htmlFor="prospect_requested_call" className="cursor-pointer text-[#363536]">
                  El prospecto solicitó la reunión / llamada con nosotros
                </Label>
                <p className="text-xs text-[#6B6B6B]">
                  Marca esto si ellos pidieron la cita (no fue cold outbound). El agente lo usará para medir interés y si
                  solicitaron la llamada.
                </p>
              </div>
            </div>

            {analyzing && (
              <div className="space-y-3 rounded-xl border border-[#AAD4AE] bg-[#D6EDD8]/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#363536]">{getStepLabel(currentStep)}</p>
                  <span className="text-sm text-[#6B6B6B]">{getStepProgress(currentStep)}%</span>
                </div>
                <Progress value={getStepProgress(currentStep)} className="h-2" />
                <p className="text-xs text-[#6B6B6B]">
                  Esto puede tomar 1-2 minutos. Por favor espera...
                </p>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !formData.company_name.trim()}
              className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A] font-semibold"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Analizando Prospecto...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Analizar Prospecto
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <StageStepper stage="brief" />
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{formData.company_name}</CardTitle>
                  <CardDescription>Análisis completado — lead sincronizado con la sección Leads</CardDescription>
                </div>
                <div className="flex gap-2">
                  {result.priority && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getPriorityStyle(result.priority)}`}>
                      {result.priority}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {result.icp_score !== null && result.icp_score !== undefined && (
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                    <p className="text-xs text-[#6B6B6B]">ICP Score</p>
                    <p className="text-2xl font-extrabold text-[#363536]">{result.icp_score}/10</p>
                  </div>
                )}
                {result.timing_score !== null && result.timing_score !== undefined && (
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                    <p className="text-xs text-[#6B6B6B]">Timing Score</p>
                    <p className="text-2xl font-extrabold text-[#363536]">{result.timing_score}/10</p>
                  </div>
                )}
                {result.interest_score != null && result.interest_score > 0 && (
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                    <p className="text-xs text-[#6B6B6B]">Interest Score</p>
                    <p className="text-2xl font-extrabold text-[#363536]">{result.interest_score}/10</p>
                  </div>
                )}
                <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                  <p className="text-xs text-[#6B6B6B]">¿Solicitaron la llamada?</p>
                  <p className="text-lg font-extrabold leading-tight text-[#363536]">
                    {result.prospect_requested_call === 'yes'
                      ? 'Sí'
                      : result.prospect_requested_call === 'no'
                        ? 'No'
                        : result.prospect_requested_call === 'unknown'
                          ? 'No consta'
                          : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                  <p className="text-xs text-[#6B6B6B]">Prioridad</p>
                  <p className="text-2xl font-extrabold text-[#363536]">{result.priority || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="intel" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="intel">🧠 Prospect Intel</TabsTrigger>
              <TabsTrigger value="brief">📋 Pre-Call Brief</TabsTrigger>
              <TabsTrigger value="proposal">📄 Propuesta</TabsTrigger>
              <TabsTrigger value="action">🧭 Coordinador</TabsTrigger>
            </TabsList>

            <TabsContent value="intel" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(result.research, 'Prospect Intel')}
                  className="border-[#E5E5E5]"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar JSON
                </Button>
              </div>
              <ProspectIntelCards raw={result.research} />
            </TabsContent>

            <TabsContent value="brief" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(result.analysis, 'Pre-Call Brief')}
                  className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
              </div>
              <Card className="border-[#E5E5E5]">
                <CardContent className="pt-6">
                  <MarkdownBlock content={result.analysis} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposal" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Propuesta comercial</CardTitle>
                  {result.outreach ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(result.outreach!, 'Propuesta')}
                      className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {result.outreach ? (
                    <MarkdownBlock content={result.outreach} />
                  ) : (
                    <p className="text-sm text-[#6B6B6B]">
                      Tras la discovery, abre la{' '}
                      <strong>ficha del prospecto</strong> en Historial para pegar la transcripción y generar la
                      propuesta.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Coordinador — próximos pasos</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.coordinator, 'Coordinador')}
                    className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </CardHeader>
                <CardContent>
                  <MarkdownBlock content={result.coordinator} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
              onClick={() => router.push(`/dashboard/prospectos/historial/${result.prospect_id}`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir ficha (transcripción &amp; propuesta)
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1 border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Analizar Otro Prospecto
            </Button>
            <Button onClick={() => router.push('/dashboard/prospectos/historial')} className="flex-1 bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]">
              Ver Historial Completo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
