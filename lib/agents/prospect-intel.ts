import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_PROSPECT_INTEL } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import type { ProspectIntelInput } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS = 4000;

const SYSTEM = `
${KB_PROSPECT_INTEL}

Eres el agente de inteligencia de prospectos de Verymuch.ai. Tu trabajo es investigar al prospecto y su empresa para evaluar si es un cliente ideal.

## REGLAS IMPORTANTES DE SCORING

1. **GEOGRAFÍA**: Verymuch.ai vende en línea a empresas de cualquier país hispanohablante o angloparlante. La geografía NO es factor de descalificación. Un prospecto de Argentina, Chile, Perú, Uruguay o cualquier otro país hispanohablante tiene el mismo potencial que uno de España o México. Solo penaliza geografía si el prospecto está en un país donde no hablamos su idioma (ej: Japón, China) o donde hay restricciones de pago internacionales severas.

2. **PRIORIDAD DE CRITERIOS PARA EL SCORE**:
   - Peso ALTO (60%): Tamaño de empresa (10-500 empleados), tiene equipo comercial, usa CRM, facturación en rango ($500K-$50M), sector B2B/B2B2C
   - Peso MEDIO (30%): Madurez digital, presupuesto tech estimado, señales de compra detectadas
   - Peso BAJO (10%): Geografía (solo si es un país con barrera idiomática o de pagos)

3. **SEÑALES DE COMPRA**: Si el prospecto solicitó una reunión directamente, eso es una señal de ALTA intención. Siempre incluirla como buying signal. Otras señales de alta intención: pidió demo, preguntó por precios, mencionó presupuesto, respondió a contenido en LinkedIn con preguntas de implementación.

4. **INTERÉS Y QUIÉN PIDIÓ LA LLAMADA**:
   - Debes evaluar **prospect_requested_call**: \`"yes"\` si hay evidencia clara de que el prospecto solicitó la reunión/llamada; \`"no"\` si es evidente que fue outbound o frío; \`"unknown"\` si no hay datos suficientes.
   - Si el equipo indica explícitamente (hint) que sí o no pidieron, **respóndelo** con esa información salvo que el texto contradiga algo.
   - **interest_score** (1-10): qué tan interesado está el prospecto en avanzar con Verymuch.ai. **Sube el score** si solicitaron la llamada, pidieron demo, hay urgencia o presupuesto. **Baja** si es solo curiosidad o exploración sin señales.

## Tu tarea
Con la información del perfil de LinkedIn (URL o texto) y el website de la empresa (URL o texto):

1. **Perfil del prospecto**: Nombre, cargo, antigüedad, responsabilidades clave, experiencia previa relevante
2. **Perfil de la empresa**: Sector, tamaño estimado (empleados), mercado, productos/servicios, tech stack visible (si hay indicios)
3. **Evaluación ICP**: Score de fit (1-10) con justificación contra cada criterio del ICP
4. **timing_score** (1-10): Urgencia / momento de compra inferido de señales (sube si el contexto adicional indica reunión pedida, demo, referido, etc.)
5. **priority**: "HOT" | "WARM" | "COLD" según fit + timing (HOT: fuerte fit + urgencia; WARM: fit o timing moderado; COLD: mal fit o sin señales)
6. **Buyer persona match**: ¿Cuál de nuestros buyer personas es? ¿Qué le quita el sueño?
7. **Señales detectadas**: Cualquier señal de compra identificada
8. **Dolores probables**: Basado en sector, tamaño y madurez digital
9. **Red flags**: Cualquier señal de anti-ICP

Sé específico y basado en evidencia. No inventes información que no esté en los datos proporcionados.

## Formato de salida OBLIGATORIO
Responde ÚNICAMENTE con un JSON válido (sin markdown fuera del JSON) con esta forma:
{
  "prospect_profile": { "name": "", "role": "", "tenure": "", "responsibilities": "", "relevant_experience": "" },
  "company_profile": { "sector": "", "estimated_employees": "", "market": "", "products_services": "", "tech_stack_hints": [] },
  "icp_fit_score": 0,
  "icp_justification": "",
  "timing_score": 0,
  "interest_score": 0,
  "prospect_requested_call": "unknown",
  "interest_rationale": "",
  "priority": "WARM",
  "buyer_persona_match": "",
  "buying_signals": [],
  "likely_pains": [],
  "red_flags": [],
  "evidence_notes": ""
}

**interest_score**: 1-10 (interés del prospecto en avanzar). **prospect_requested_call**: solo "yes", "no" o "unknown". **interest_rationale**: 1-2 frases sobre interés y si solicitaron la llamada.
`.trim();

export interface ProspectIntelResult {
  prospect_profile: Record<string, unknown>;
  company_profile: Record<string, unknown>;
  icp_fit_score: number;
  icp_justification?: string;
  timing_score: number;
  /** 1-10: interés del prospecto (incluye si solicitaron la llamada) */
  interest_score?: number;
  /** Si el prospecto solicitó la reunión/llamada */
  prospect_requested_call?: 'yes' | 'no' | 'unknown';
  interest_rationale?: string;
  priority: 'HOT' | 'WARM' | 'COLD';
  buyer_persona_match?: string;
  buying_signals?: unknown[];
  likely_pains?: unknown[];
  red_flags?: unknown[];
  evidence_notes?: string;
}

export async function runProspectIntel(input: ProspectIntelInput): Promise<{
  raw: string;
  parsed: ProspectIntelResult | null;
}> {
  const extra = additionalContextBlock(input.additional_context);

  const callHint =
    input.prospect_requested_call_hint === true
      ? '- **Indicación del equipo:** El prospecto solicitó activamente la reunión o llamada con nosotros (pondera fuerte en interest_score y prospect_requested_call).'
      : input.prospect_requested_call_hint === false
        ? '- **Indicación del equipo:** El primer contacto fue iniciado por nosotros (outbound / cold outreach), no consta que el prospecto pidiera la llamada salvo que el contexto diga lo contrario.'
        : '';

  const userPrompt = `
**Datos del prospecto**
- Empresa: ${input.company_name}
${input.contact_name ? `- Contacto: ${input.contact_name}` : ''}
${input.contact_title ? `- Cargo: ${input.contact_title}` : ''}
${input.linkedin_url ? `- LinkedIn URL: ${input.linkedin_url}` : ''}
${input.linkedin_text ? `\n**Texto perfil LinkedIn (pegado):**\n${input.linkedin_text}\n` : ''}
${input.website_url ? `- Website: ${input.website_url}` : ''}
${input.website_text ? `\n**Texto website (pegado):**\n${input.website_text}\n` : ''}
${input.notes ? `- Notas: ${input.notes}` : ''}
${input.website_content_preview ? `\n**Preview del website (fetch automático):**\n${input.website_content_preview}\n` : ''}
${callHint ? `\n${callHint}\n` : ''}
${extra ? `\n${extra}\n` : ''}

Si el contexto adicional indica reunión solicitada, referido, ARRI alto, o interés activo, incorpóralo en buying_signals, **interest_score**, **prospect_requested_call** y refléjalo en timing_score y priority.

Devuelve SOLO el JSON solicitado.
`.trim();

  const messageContent = input.document_base64
    ? [
        {
          type: 'document' as const,
          source: {
            type: 'base64' as const,
            media_type: 'application/pdf' as const,
            data: input.document_base64,
          },
          title: 'Documento compartido por el prospecto',
          context:
            'El prospecto compartió este documento (presentación, diagrama de flujo o informe). Extrae información clave sobre su operación, procesos, tecnología, dolores y contexto comercial para enriquecer el análisis.',
        },
        { type: 'text' as const, text: userPrompt },
      ]
    : userPrompt;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: [{ role: 'user', content: messageContent }],
  });

  const raw = textFromMessage(message);
  let parsed: ProspectIntelResult | null = null;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as ProspectIntelResult) : null;
  } catch {
    parsed = null;
  }

  return { raw, parsed };
}
