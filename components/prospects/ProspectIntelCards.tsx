'use client';

import { AlertTriangle, User, Building2, Gauge, Target, ListChecks, HeartHandshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProspectIntelResult } from '@/lib/agents/prospect-intel';

function scoreBarColor(score: number): string {
  if (score > 7) return 'bg-[#5BA66B]';
  if (score >= 5) return 'bg-[#F5A05E]';
  return 'bg-[#E85D5D]';
}

function priorityBadgeClass(p: string): string {
  switch (p) {
    case 'HOT':
      return 'bg-[#FDE7D0] text-[#C4621A]';
    case 'WARM':
      return 'bg-[#D6EDD8] text-[#3D7A4A]';
    case 'COLD':
      return 'bg-[#DDEAEE] text-[#363536]';
    default:
      return 'bg-[#F0EFED] text-[#6B6B6B]';
  }
}

function parseIntel(raw: string): ProspectIntelResult | null {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]) as ProspectIntelResult;
  } catch {
    return null;
  }
}

export function ProspectIntelCards({ raw }: { raw: string }) {
  const intel = parseIntel(raw);

  if (!raw?.trim()) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardContent className="pt-6">
          <p className="text-sm text-[#6B6B6B]">
            No hay datos de Prospect Intel. Ejecuta un análisis inicial para generarlos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!intel) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <CardTitle className="text-base">Prospect Intel (raw)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-xs text-[#363536]">{raw}</pre>
        </CardContent>
      </Card>
    );
  }

  const pp = intel.prospect_profile as Record<string, unknown> | undefined;
  const cp = intel.company_profile as Record<string, unknown> | undefined;
  const tech = (cp?.tech_stack_hints as unknown[]) ?? [];

  const icp = intel.icp_fit_score ?? 0;
  const timing = intel.timing_score ?? 0;
  const interest = intel.interest_score ?? 0;
  const reqCall = intel.prospect_requested_call;

  const requestedCallLabel =
    reqCall === 'yes' ? 'Sí — pidieron la llamada' : reqCall === 'no' ? 'No — contacto outbound / frío' : 'No consta';

  return (
    <div className="space-y-4">
      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#363536]">
            <User className="h-4 w-4 text-[#5BA66B]" />
            Perfil del prospecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-[#6B6B6B]">Nombre: </span>
              <span className="font-medium text-[#363536]">{String(pp?.name ?? '—')}</span>
            </p>
            <p>
              <span className="text-[#6B6B6B]">Cargo: </span>
              <span className="font-medium text-[#363536]">{String(pp?.role ?? '—')}</span>
            </p>
            <p>
              <span className="text-[#6B6B6B]">Antigüedad: </span>
              {String(pp?.tenure ?? '—')}
            </p>
          </div>
          <p>
            <span className="text-[#6B6B6B]">Responsabilidades: </span>
            {String(pp?.responsibilities ?? '—')}
          </p>
          <p>
            <span className="text-[#6B6B6B]">Experiencia relevante: </span>
            {String(pp?.relevant_experience ?? '—')}
          </p>
          {intel.buyer_persona_match && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[#6B6B6B]">Buyer persona:</span>
              <Badge className="bg-[#DDEAEE] text-[#363536]">{intel.buyer_persona_match}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#363536]">
            <Building2 className="h-4 w-4 text-[#4A8FA8]" />
            Perfil de la empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-[#6B6B6B]">Sector: </span>
              {String(cp?.sector ?? '—')}
            </p>
            <p>
              <span className="text-[#6B6B6B]">Tamaño estimado: </span>
              {String(cp?.estimated_employees ?? '—')}
            </p>
            <p className="sm:col-span-2">
              <span className="text-[#6B6B6B]">Mercado: </span>
              {String(cp?.market ?? '—')}
            </p>
          </div>
          <p>
            <span className="text-[#6B6B6B]">Productos/servicios: </span>
            {String(cp?.products_services ?? '—')}
          </p>
          {Array.isArray(tech) && tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tech.map((t, i) => (
                <Badge key={i} variant="secondary" className="bg-[#F0EFED] text-[#363536]">
                  {String(t)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#363536]">
            <Gauge className="h-4 w-4 text-[#F5A05E]" />
            Evaluación ICP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[#6B6B6B]">ICP Score</span>
              <span className="font-semibold text-[#363536]">{icp}/10</span>
            </div>
            <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[#F0EFED]')}>
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor(icp))}
                style={{ width: `${Math.min(100, icp * 10)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[#6B6B6B]">Timing Score</span>
              <span className="font-semibold text-[#363536]">{timing}/10</span>
            </div>
            <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[#F0EFED]')}>
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor(timing))}
                style={{ width: `${Math.min(100, timing * 10)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[#6B6B6B]">Interest Score (interés / intención)</span>
              <span className="font-semibold text-[#363536]">{interest > 0 ? `${interest}/10` : '—'}</span>
            </div>
            {interest > 0 ? (
              <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[#F0EFED]')}>
                <div
                  className={cn('h-full rounded-full transition-all', scoreBarColor(interest))}
                  style={{ width: `${Math.min(100, interest * 10)}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-[#6B6B6B]">Sin dato en esta respuesta</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#FAF9F7] px-3 py-2">
            <HeartHandshake className="h-4 w-4 shrink-0 text-[#5BA66B]" />
            <div className="min-w-0 text-sm">
              <span className="text-[#6B6B6B]">¿Solicitaron la llamada? </span>
              <span className="font-medium text-[#363536]">{requestedCallLabel}</span>
            </div>
          </div>
          {intel.interest_rationale && (
            <p className="text-sm text-[#363536]">
              <span className="font-medium text-[#6B6B6B]">Criterio de interés: </span>
              {intel.interest_rationale}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#6B6B6B]">Prioridad:</span>
            <Badge className={priorityBadgeClass(intel.priority || '')}>{intel.priority ?? '—'}</Badge>
          </div>
          {intel.icp_justification && (
            <p className="text-sm leading-relaxed text-[#363536]">{intel.icp_justification}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#363536]">
            <Target className="h-4 w-4 text-[#AAD4AE]" />
            Dolores probables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#363536]">
            {(intel.likely_pains as unknown[] | undefined)?.map((x, i) => (
              <li key={i}>{String(x)}</li>
            ))}
            {(!intel.likely_pains || (intel.likely_pains as unknown[]).length === 0) && (
              <li className="text-[#6B6B6B]">—</li>
            )}
          </ul>
          {(intel.red_flags as unknown[] | undefined)?.length ? (
            <div className="mt-4 rounded-lg border border-[#F5A05E]/40 bg-[#FDE7D0]/30 p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#C4621A]">
                <AlertTriangle className="h-4 w-4" />
                Red flags
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[#363536]">
                {(intel.red_flags as unknown[]).map((x, i) => (
                  <li key={i}>{String(x)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-[#E5E5E5]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#363536]">
            <ListChecks className="h-4 w-4 text-[#5BA66B]" />
            Señales de compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#363536]">
            {(intel.buying_signals as unknown[] | undefined)?.map((x, i) => (
              <li key={i}>{String(x)}</li>
            ))}
            {(!intel.buying_signals || (intel.buying_signals as unknown[]).length === 0) && (
              <li className="text-[#6B6B6B]">Sin señales explícitas en los datos.</li>
            )}
          </ul>
          {intel.evidence_notes && (
            <p className="mt-3 text-sm italic text-[#6B6B6B]">{String(intel.evidence_notes)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
