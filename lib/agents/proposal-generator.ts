import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_PROPOSAL } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import { salesInteractionNotesBlock } from '@/lib/knowledge-base/sales-interaction-notes';
import type { ProposalGeneratorInput, ProposalCurrency } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS = 8000;

const CURRENCY_LABELS: Record<ProposalCurrency, string> = {
  USD: 'USD ($) — dólares estadounidenses',
  EUR: 'EUR (€) — euros',
  MXN: 'MXN ($) — pesos mexicanos',
  COP: 'COP ($) — pesos colombianos',
};

const SYSTEM = `
${KB_PROPOSAL}

Eres el agente generador de propuestas de Verymuch.ai. Tu trabajo es crear un borrador de propuesta comercial personalizada basada en toda la información recopilada.

## Contexto adicional del equipo comercial
Si el mensaje de usuario incluye la sección "Contexto adicional proporcionado por el equipo comercial", incorpórala en el resumen ejecutivo, el diagnóstico y los próximos pasos cuando sea relevante.

## Notas de interacción (objeciones, comentarios, aprendizajes)
Si aparece "Notas del equipo sobre la relación comercial", úsalas para personalizar la propuesta (objeciones a despejar, contexto no reflejado solo en el análisis de llamada, aprendizajes).

## Moneda
Cuando se especifique una moneda de salida, TODOS los precios, rangos y ejemplos de inversión deben expresarse en esa moneda. Usa el símbolo correcto y el código ISO (p.ej. €1.500 EUR, $1.500 USD, $18.000 MXN, $6.000.000 COP). No mezcles monedas.

## Mejoras solicitadas
Si el mensaje incluye la sección "Mejoras solicitadas por el equipo", aplícalas con precisión sin perder coherencia ni personalización.

## Aprendizajes de versiones anteriores
Si el mensaje incluye "Aprendizajes de versiones anteriores", tenlos en cuenta para no repetir los mismos errores y mejorar el tono, estructura o contenido.

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

IMPORTANTE: Personaliza con nombre de empresa y persona. Si mencionaron presupuesto, alinea la propuesta. No uses jerga vacía.

Genera en español por defecto; en inglés si language=en.
`.trim();

export async function runProposalGenerator(input: ProposalGeneratorInput): Promise<string> {
  const lang = input.language === 'en' ? 'en' : 'es';
  const currency = input.currency ?? 'USD';
  const extra = additionalContextBlock(input.additional_context);
  const salesNotes = salesInteractionNotesBlock(input.sales_interaction_notes);

  const feedbackBlock = input.improvement_feedback
    ? `\n## Mejoras solicitadas por el equipo\n${input.improvement_feedback}\n`
    : '';

  const userPrompt = `
**Idioma de salida:** ${lang === 'en' ? 'English' : 'Español'}
**Moneda de salida:** ${CURRENCY_LABELS[currency]}

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
${feedbackBlock}

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
