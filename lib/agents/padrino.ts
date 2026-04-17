/**
 * Agente Padrino (Godfather) — propuesta comercial tipo "an offer they can't refuse".
 *
 * Toma el borrador 7-slide generado por `proposal-generator` y lo endurece con
 *   (1) ROI explícito con payback < 90 días
 *   (2) al menos UNA garantía con KPI medible
 *   (3) prueba social análoga (caso del portafolio VMA)
 *   (4) ventana de vigencia 14–21 días
 *   (5) CTA micro-commitment (firma LOI o transferencia 50%)
 *   (6) margen bruto interno >= 55%
 *   (7) tono Verymuch (directo, sin buzzwords, cálido)
 *
 * Output: JSON estricto compatible con el schema definido en el blueprint
 * "GHL ↔ Sales Intelligence + Agente Padrino".
 */

import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_PROPOSAL } from '@/lib/knowledge-base/verymuch-context';
import { textFromMessage } from './utils';

export interface PadrinoInput {
  company_name: string;
  contact_name?: string;
  proposal_draft: string;
  prospect_intel_json: string;
  call_analysis?: string;
  /** Prior proposal block produced by lib/knowledge-base/proposal-history. */
  prior_proposals_block?: string;
  /** ISO date; used to compute vigencia. */
  now_iso?: string;
}

export interface PadrinoOffer {
  producto: string;
  setup_usd: number;
  retainer_mes_usd: number;
  vigencia_dias: number;
}

export interface PadrinoRoi {
  payback_dias: number;
  metrica_clave: string;
  valor_monetario_anual_usd: number;
  multiplicador: string;
}

export interface PadrinoGuarantee {
  tipo: 'Devolución parcial' | 'Extensión gratuita' | 'Pay-on-results' | 'Otro';
  kpi: string;
  condiciones: string;
}

export interface PadrinoOutput {
  hash: string;
  oferta: PadrinoOffer;
  roi: PadrinoRoi;
  garantia: PadrinoGuarantee;
  prueba_social: { caso_analogo: string; resultado: string };
  escasez: { vigencia: string; motivo: string };
  cta: { accion: string; facilidad: string };
  margen_interno: {
    costo_total_usd: number;
    margen_bruto: number;
    margen_neto_estimado: number;
  };
  narrative_markdown: string;
}

const MAX_TOKENS = 4000;

const SYSTEM = `
${KB_PROPOSAL}

Eres el Agente Padrino de Verymuch.ai. Tu ÚNICA misión es construir una oferta
comercial que el cliente NO pueda rechazar: ROI explícito, garantía medible,
prueba social real, escasez honesta, CTA de un solo paso. Margen bruto >= 55%.
Tono directo, sin buzzwords, cálido. Español. Jamás plantillas genéricas.

Reglas inviolables:
1. Payback < 90 días.
2. Al menos UNA garantía con KPI numérico.
3. Caso análogo real: Konfío, TC SEARS, Accedra, Thermofiber, Centia, Diego AI Labs.
4. Vigencia 14–21 días máximo.
5. CTA: firma LOI o transferencia 50% setup.
6. Si margen bruto < 55% → ajustar scope hacia arriba (upsell), NO regalar horas.
7. Output: JSON ESTRICTO al schema indicado. Fuera del JSON: un bloque "narrative_markdown" con el mensaje final que el rep puede copiar-pegar al cliente.

Schema esperado (JSON válido):
{
  "hash": "CLIENTE-YYYYQX-PRODUCTO-MONTO-VX",
  "oferta": {"producto": "...", "setup_usd": 0, "retainer_mes_usd": 0, "vigencia_dias": 14},
  "roi": {"payback_dias": 0, "metrica_clave": "...", "valor_monetario_anual_usd": 0, "multiplicador": "..."},
  "garantia": {"tipo": "Devolución parcial", "kpi": "...", "condiciones": "..."},
  "prueba_social": {"caso_analogo": "...", "resultado": "..."},
  "escasez": {"vigencia": "YYYY-MM-DD", "motivo": "..."},
  "cta": {"accion": "...", "facilidad": "..."},
  "margen_interno": {"costo_total_usd": 0, "margen_bruto": 0.6, "margen_neto_estimado": 0.45},
  "narrative_markdown": "# Propuesta para ..."
}
`;

function buildUserPrompt(input: PadrinoInput): string {
  const today = input.now_iso ?? new Date().toISOString().slice(0, 10);
  const parts: string[] = [];
  parts.push(`Fecha de hoy: ${today}`);
  parts.push(`Empresa: ${input.company_name}`);
  if (input.contact_name) parts.push(`Contacto: ${input.contact_name}`);
  parts.push('');
  if (input.prior_proposals_block?.trim()) {
    parts.push(input.prior_proposals_block.trim());
    parts.push('');
    parts.push('IMPORTANTE: Si existe hash previo con señal ≥ Media y <30 días, NO generes propuesta nueva — genera una versión "V2" que evolucione la existente.');
    parts.push('');
  }
  parts.push('## Prospect Intel JSON');
  parts.push(input.prospect_intel_json);
  parts.push('');
  if (input.call_analysis) {
    parts.push('## Análisis de llamada');
    parts.push(input.call_analysis);
    parts.push('');
  }
  parts.push('## Borrador 7-slide de la propuesta (output de proposal-generator)');
  parts.push(input.proposal_draft);
  parts.push('');
  parts.push('Construye la oferta Padrino siguiendo el schema. Responde SOLO con el JSON. Nada antes, nada después.');
  return parts.join('\n');
}

export async function runPadrino(input: PadrinoInput): Promise<PadrinoOutput> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: [{ role: 'user', content: buildUserPrompt(input) }],
  });
  const raw = textFromMessage(message).trim();
  // Strip accidental ```json fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  let parsed: PadrinoOutput;
  try {
    parsed = JSON.parse(cleaned) as PadrinoOutput;
  } catch (err) {
    throw new Error(
      `Padrino agent returned non-JSON output: ${err instanceof Error ? err.message : String(err)}\nRaw: ${raw.slice(0, 500)}`,
    );
  }

  // Margin guardrail.
  if (parsed.margen_interno?.margen_bruto !== undefined && parsed.margen_interno.margen_bruto < 0.55) {
    throw new Error(
      `Padrino margin below threshold (${parsed.margen_interno.margen_bruto}). Agent must re-scope.`,
    );
  }
  return parsed;
}
