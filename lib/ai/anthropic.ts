import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Default: Sonnet 4 — override with ANTHROPIC_MODEL in .env */
export const MODEL =
  process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';

/**
 * Aliases por caso de uso. Permiten override vía env sin tocar código.
 *
 *  - MODEL_OPUS    → análisis profundos (evaluación de talento, propuestas,
 *                    razonamiento estratégico).
 *  - MODEL_HAIKU   → tareas rápidas y de bajo costo (parsers, clasificadores,
 *                    resúmenes cortos, auto-trackers).
 *
 * IDs oficiales (abril 2026): claude-opus-4-7, claude-haiku-4-5-20251001.
 */
export const MODEL_OPUS =
  process.env.ANTHROPIC_MODEL_OPUS ?? 'claude-opus-4-7';

export const MODEL_HAIKU =
  process.env.ANTHROPIC_MODEL_HAIKU ?? 'claude-haiku-4-5-20251001';
