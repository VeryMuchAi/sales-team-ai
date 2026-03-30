import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { KB_PRE_CALL_BRIEF } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import type { PreCallBriefInput } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS = 4000;

const QUESTION_RULES = `
## REGLAS PARA LAS PREGUNTAS DE LA DISCOVERY CALL

1. **NUNCA** hagas preguntas sobre la geografía o mercado local del prospecto. No nos importa si están en Argentina, España o Tailandia — vendemos servicios digitales en línea.

2. Las preguntas deben enfocarse en:
   - Su proceso de ventas actual: ¿Cómo generan leads hoy? ¿Cuánto tiempo dedican a prospección manual? ¿Qué herramientas usan?
   - Su dolor: ¿Cuál es su mayor cuello de botella comercial? ¿Cuántos leads se les enfrían? ¿Cuánto tarda en responder a un lead nuevo?
   - Su stack tecnológico: ¿Qué CRM usan? ¿Tienen automatizaciones? ¿Usan email marketing?
   - Su equipo: ¿Cuántas personas tiene su equipo comercial? ¿Tienen roles de SDR, marketing, closer?
   - Su presupuesto y timeline: ¿Tienen presupuesto asignado para herramientas de IA/automatización? ¿Cuándo quieren tener resultados?
   - Su experiencia previa: ¿Han probado herramientas de IA antes? ¿Han trabajado con agencias o freelancers?

3. Las preguntas deben ayudarnos a cualificar (BANT): Budget, Authority, Need, Timing.

4. Incluye 1-2 preguntas "de enganche" que demuestren que hicimos research de su empresa. Ejemplo: "Vi que están usando [herramienta X], ¿qué tan contentos están con los resultados?"

5. **Máximo 7 preguntas. Mejor 5 buenas que 10 genéricas.**
`.trim();

const SYSTEM = `
${KB_PRE_CALL_BRIEF}

${QUESTION_RULES}

Eres el agente de preparación pre-llamada de Verymuch.ai. Tu trabajo es generar un brief conciso y accionable para que Edwin o Jorge tengan una discovery call efectiva.

## Tu tarea
Con la información del Prospect Intel (JSON), genera un brief de 1 página con:

1. **Resumen ejecutivo del prospecto** (3-4 líneas)
2. **Dolores probables** (priorizados): Los 3 dolores principales con evidencia del research
3. **Preguntas clave para la llamada** (máximo 7, preferible 5-6 fuertes): sin enfoque geográfico; según las reglas de arriba
4. **Mapeo preliminar de agentes**: Qué agentes/pack podrían encajar
5. **Approach recomendado**: Cómo enfocar la conversación
6. **Datos de mercado relevantes**: Si aplica, bullets con datos que refuercen la propuesta

Formato: claro, escaneable, con bullets. El brief debe poderse leer en 2 minutos antes de la llamada. Responde en español salvo que el contexto indique prospecto angloparlante.
`.trim();

export async function runPreCallBrief(input: PreCallBriefInput): Promise<string> {
  const extra = additionalContextBlock(input.additional_context);

  const userPrompt = `
**Empresa:** ${input.company_name}

**Prospect Intel (JSON):**
${input.prospect_intel_json}
${extra ? `\n${extra}\n` : ''}

Genera el brief pre-llamada completo.
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
            'El prospecto compartió este documento. Úsalo para enriquecer el brief con contexto sobre su operación y para formular preguntas de discovery más específicas y personalizadas.',
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

  return textFromMessage(message);
}
