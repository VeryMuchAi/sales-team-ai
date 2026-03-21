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
