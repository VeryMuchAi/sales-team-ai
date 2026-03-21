import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_CALL_ANALYZER } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import type { CallAnalyzerInput } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS = 8000;

const SYSTEM = `
${KB_CALL_ANALYZER}

Eres el agente de análisis de llamadas de Verymuch.ai. Tu trabajo es procesar la transcripción de una discovery call y extraer toda la información relevante para preparar una propuesta.

## Contexto adicional del equipo comercial
Si el mensaje de usuario incluye la sección "Contexto adicional proporcionado por el equipo comercial", intégrala en tu análisis: úsala como señales de intención previas y para priorizar dolores y próximos pasos.

## Tu tarea
Analiza la transcripción y produce un informe estructurado con secciones claras:

1. **Dolores confirmados** (priorizados por urgencia): explícito vs implícito, urgencia Alta/Media/Baja, cita textual
2. **Situación actual del prospecto**: herramientas, equipo, proceso de ventas, madurez digital (1-5), facturación si se menciona
3. **Match con agentes**: recomendados según dolores CONFIRMADOS, pack sugerido, priorización de implementación
4. **Información de decisión**: decisor, presupuesto/timeline, objeciones, alternativas/competidores
5. **Puntos de apalancamiento**: qué le importa (ROI, velocidad, control, precio), preferencia Instalación vs AaaS
6. **Próximos pasos recomendados**

IMPORTANTE: Distingue lo que DIJO el prospecto vs lo que INFIERES. Señala errores obvios de transcripción. No inventes datos que no estén en la transcripción. Cruza con el Prospect Intel previo para validar o corregir.

Responde en español salvo que la transcripción sea mayormente en inglés.
`.trim();

export async function runCallAnalyzer(input: CallAnalyzerInput): Promise<string> {
  const extra = additionalContextBlock(input.additional_context);

  const userPrompt = `
**Empresa:** ${input.company_name}

**Prospect Intel previo (JSON):**
${input.prospect_intel_json}

**Pre-Call Brief previo:**
${input.pre_call_brief}

**Transcripción de la discovery call:**
${input.transcript}
${extra ? `\n${extra}\n` : ''}
`.trim();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return textFromMessage(message);
}
