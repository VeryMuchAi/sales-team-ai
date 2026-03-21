import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { VERYMUCH_IDENTITY } from '@/lib/knowledge-base/verymuch-context';
import { additionalContextBlock } from '@/lib/knowledge-base/additional-context';
import type { CoordinatorOrchestratorInput, CoordinatorState, SalesStage } from './types';
import { textFromMessage } from './utils';

const MAX_TOKENS_SYNTH = 4000;
const MAX_TOKENS_ROUTE = 2000;

const SYSTEM_ORCHESTRATOR = `
${VERYMUCH_IDENTITY}

Eres el coordinador del sistema de ventas de Verymuch.ai.

## Flujo de trabajo
- Si el usuario proporciona LinkedIn URL o website o datos de investigación → Prospect Intel Agent
- Si ya hay research y pide preparar la llamada → Pre-Call Brief Agent
- Si sube una transcripción → Call Analyzer Agent
- Si ya hay análisis de llamada y pide propuesta → Proposal Generator Agent

## Reglas
- Siempre pasa el contexto completo de los pasos anteriores al agente actual
- Si falta información de un paso previo, indícalo claramente
- Mantén un JSON de estado con: prospect_name, company, stage, accumulated_context
- Permite saltar pasos si el usuario aporta la información equivalente
- Si recibes "Contexto adicional del equipo comercial", úsalo para priorizar próximos pasos y señales de intención

Para action=route: responde SOLO JSON: { "next_agent": "prospect_intel"|"pre_call_brief"|"call_analyzer"|"proposal_generator"|"none", "reason": "", "missing": [] }
Para action=synthesize: redacta resumen ejecutivo en markdown para el equipo comercial.
`.trim();

export async function runCoordinator(input: CoordinatorOrchestratorInput): Promise<{
  kind: 'route' | 'synthesis';
  route?: { next_agent: string; reason: string; missing: string[] };
  synthesis?: string;
}> {
  if (input.action === 'route') {
    const userPrompt = `
Usuario / input:
${input.user_input ?? '(vacío)'}

Estado actual (JSON):
${input.state_json ? JSON.stringify(input.state_json) : '{}'}

Determina el siguiente agente.
`.trim();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS_ROUTE,
      system: SYSTEM_ORCHESTRATOR,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = textFromMessage(message);
    let route: { next_agent: string; reason: string; missing: string[] } | undefined;
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) route = JSON.parse(m[0]) as typeof route;
    } catch {
      route = { next_agent: 'none', reason: raw, missing: [] };
    }
    return { kind: 'route', route };
  }

  const extra = additionalContextBlock(input.additional_context);

  const userPrompt = `
**Síntesis del pipeline (post Prospect Intel + Pre-Call Brief y/u otros pasos)**

Empresa: ${input.company_name ?? ''}

**Prospect Intel (JSON):**
${input.prospect_intel_json ?? ''}

**Pre-Call Brief:**
${input.pre_call_brief ?? ''}

${input.call_analysis ? `**Call Analysis:**\n${input.call_analysis}\n` : ''}
${input.proposal_draft ? `**Borrador propuesta:**\n${input.proposal_draft}\n` : ''}
${extra ? `\n${extra}\n` : ''}

Produce:
1) Resumen ejecutivo del prospecto (actualizado)
2) En qué etapa del proceso está
3) Próximos pasos concretos para el equipo (discovery, transcripción, propuesta)
4) Riesgos / red flags a vigilar

Formato markdown claro.
`.trim();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS_SYNTH,
    system: SYSTEM_ORCHESTRATOR,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return { kind: 'synthesis', synthesis: textFromMessage(message) };
}

export function defaultCoordinatorState(
  company: string,
  prospectName: string | null,
  stage: SalesStage
): CoordinatorState {
  return {
    prospect_name: prospectName,
    company,
    stage,
    accumulated_context: '',
  };
}
