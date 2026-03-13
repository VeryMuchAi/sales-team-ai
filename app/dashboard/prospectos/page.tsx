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
import { Search, Sparkles, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  prospect_id: string;
  result_id: string;
  research: string;
  analysis: string;
  outreach: string;
  coordinator: string;
  icp_score: number | null;
  timing_score: number | null;
  priority: 'HOT' | 'WARM' | 'COLD' | null;
}

type AnalysisStep = 'idle' | 'research' | 'analysis' | 'outreach' | 'coordinator' | 'complete';

export default function ProspectosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    website_url: '',
    contact_email: '',
    contact_name: '',
    contact_title: '',
    linkedin_url: '',
    notes: '',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStepProgress = (step: AnalysisStep): number => {
    const steps = { idle: 0, research: 25, analysis: 50, outreach: 75, coordinator: 90, complete: 100 };
    return steps[step] || 0;
  };

  const getStepLabel = (step: AnalysisStep): string => {
    const labels = {
      idle: 'Listo para analizar',
      research: '🔍 Investigando empresa...',
      analysis: '📊 Analizando fit estratégico...',
      outreach: '✉️ Generando mensajes personalizados...',
      coordinator: '📋 Compilando plan de acción...',
      complete: '✅ Análisis completo',
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
    setCurrentStep('research');

    try {
      // Simulate step progression for UX
      const stepSequence: AnalysisStep[] = ['research', 'analysis', 'outreach', 'coordinator'];
      let stepIndex = 0;

      const progressInterval = setInterval(() => {
        if (stepIndex < stepSequence.length - 1) {
          stepIndex++;
          setCurrentStep(stepSequence[stepIndex]);
        }
      }, 5000); // Update UI every 5 seconds

      const response = await fetch('/api/prospects/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      contact_email: '',
      contact_name: '',
      contact_title: '',
      linkedin_url: '',
      notes: '',
    });
    setResult(null);
    setCurrentStep('idle');
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
            Análisis inteligente con 4 agentes AI trabajando en secuencia
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notas / Contexto Adicional</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Cualquier información adicional que pueda ayudar al análisis..."
                rows={3}
                disabled={analyzing}
              />
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
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{formData.company_name}</CardTitle>
                  <CardDescription>Análisis completado</CardDescription>
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
              <div className="grid gap-4 sm:grid-cols-3">
                {result.icp_score !== null && (
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                    <p className="text-xs text-[#6B6B6B]">ICP Score</p>
                    <p className="text-2xl font-extrabold text-[#363536]">{result.icp_score}/10</p>
                  </div>
                )}
                {result.timing_score !== null && (
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                    <p className="text-xs text-[#6B6B6B]">Timing Score</p>
                    <p className="text-2xl font-extrabold text-[#363536]">{result.timing_score}/10</p>
                  </div>
                )}
                <div className="rounded-xl border border-[#E5E5E5] bg-[#FAF9F7] p-4">
                  <p className="text-xs text-[#6B6B6B]">Prioridad</p>
                  <p className="text-2xl font-extrabold text-[#363536]">{result.priority || 'N/A'}</p>
                </div>
              </div>
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
                    onClick={() => handleCopy(result.research, 'Investigación')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#363536]">{result.research}</pre>
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
                    onClick={() => handleCopy(result.analysis, 'Análisis')}
                    className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#363536]">{result.analysis}</pre>
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
                    onClick={() => handleCopy(result.outreach, 'Outreach')}
                    className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Todo
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#363536]">{result.outreach}</pre>
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
                    onClick={() => handleCopy(result.coordinator, 'Plan de Acción')}
                    className="border-[#E5E5E5] text-[#363536] hover:bg-[#F0EFED]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#363536]">{result.coordinator}</pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
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
