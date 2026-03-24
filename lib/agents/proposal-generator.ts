import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_PROPOSAL } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import { salesInteractionNotesBlock } from '@/lib/knowledge-base/sales-interaction-notes';
import type { ProposalGeneratorInput } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS = 8000;

const SYSTEM = `
${KB_PROPOSAL}

Eres el agente generador de propuestas de Verymuch.ai. Tu trabajo es crear un borrador de propuesta comercial personalizada basada en toda la información recopilada.

## Contexto adicional del equipo comercial
Si el mensaje de usuario incluye la sección "Contexto adicional proporcionado por el equipo comercial", incorpórala en el resumen ejecutivo, el diagnóstico y los próximos pasos cuando sea relevante.

## Notas de interacción (objeciones, comentarios, aprendizajes)
Si aparece "Notas del equipo sobre la relación comercial", úsalas para personalizar la propuesta (objeciones a despejar, contexto no reflejado solo en el análisis de llamada, aprendizajes).

## Tu tarea
Genera una propuesta comercial estructurada con:

1. **Encabezado**: Propuesta para [Empresa] - Verymuch.ai - Fecha
2. **Resumen ejecutivo** (2-3 párrafos)
3. **Diagnóstico** (basado en el análisis de llamada)
4. **Solución propuesta**: agentes recomendados, cómo trabajan juntos, integraciones, pack aplicable
5. **Plan de implementación**: Fase 1 Validación (quick win), Fase 2 Expansión, hitos — evita llamarlo "piloto"; usa "Fase 1: Validación"
6. **Inversión**: Instalación vs AaaS, tabla comparativa, nota de APIs externas a cargo del cliente
7. **Por qué Verymuch.ai**: diferenciadores relevantes para ESTE cliente + datos de mercado si aplican
8. **Próximos pasos**

IMPORTANTE: Personaliza con nombre de empresa y persona. Usa precios del catálogo (EUR, y USD orientativo). Si mencionaron presupuesto, alinea la propuesta. No uses jerga vacía.

Genera en español por defecto; en inglés si language=en.
`.trim();

export async function runProposalGenerator(input: ProposalGeneratorInput): Promise<string> {
  const lang = input.language === 'en' ? 'en' : 'es';
  const extra = additionalContextBlock(input.additional_context);
  const salesNotes = salesInteractionNotesBlock(input.sales_interaction_notes);
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const userPrompt = `
**Fecha actual:** ${today}
**Idioma de salida:** ${lang === 'en' ? 'English' : 'Español'}

**Empresa:** ${input.company_name}
${input.contact_name ? `- Contacto principal: ${input.contact_name}` : ''}

**Prospect Intel (JSON):**
${input.prospect_intel_json}

**Pre-Call Brief:**
${input.pre_call_brief}

**Análisis de llamada (Call Analysis):**
${input.call_analysis}
${extra ? `\n${extra}\n` : ''}
${salesNotes ? `\n${salesNotes}\n` : ''}

Redacta la propuesta comercial completa.
`.trim();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return textFromMessage(message);
}
