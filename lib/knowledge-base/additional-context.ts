/**
 * Bloque reutilizable para que todos los agentes consideren el contexto del equipo comercial.
 */
export function additionalContextBlock(additional_context?: string | null): string {
  if (!additional_context?.trim()) return '';
  return `
## Contexto adicional proporcionado por el equipo comercial
${additional_context.trim()}

Toma en cuenta este contexto adicional al hacer tu análisis. Si menciona que el prospecto solicitó una reunión directamente, pidió demo, fue referido, o mostró interés activo, considéralo como señal de alta intención de compra.
`.trim();
}
