import type Anthropic from '@anthropic-ai/sdk';

export function textFromMessage(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('\n');
}

/** Best-effort JSON parse; returns null on failure */
export function safeJsonParse<T>(raw: string): T | null {
  try {
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const payload = jsonMatch ? jsonMatch[1] : trimmed;
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}
