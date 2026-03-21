/**
 * Bloque de texto para agentes (Call Analyzer, Proposal) con objeciones,
 * comentarios y aprendizajes del equipo.
 */
export function formatSalesInteractionNotes(
  objections?: string | null,
  comments?: string | null,
  learnings?: string | null
): string {
  const parts: string[] = [];
  if (objections?.trim()) {
    parts.push(`**Objeciones** (registradas por el equipo):\n${objections.trim()}`);
  }
  if (comments?.trim()) {
    parts.push(`**Comentarios / contexto comercial:**\n${comments.trim()}`);
  }
  if (learnings?.trim()) {
    parts.push(`**Aprendizajes con el cliente:**\n${learnings.trim()}`);
  }
  if (parts.length === 0) return '';
  return `## Notas del equipo sobre la relación comercial\n\n${parts.join('\n\n')}`;
}

/** Fragmento listo para pegar en prompts de agentes (vacío si no hay notas). */
export function salesInteractionNotesBlock(notes?: string | null): string {
  if (!notes?.trim()) return '';
  return notes.trim();
}
