/**
 * GHL (GoHighLevel) push trigger — stub.
 *
 * Este módulo fue referenciado en el commit 457e276 (feat(ghl-sync): trigger
 * GHL push after call-analyze, proposal, padrino) pero el archivo nunca fue
 * commiteado. Sin este stub, el build falla con "Module not found".
 *
 * Por ahora es un no-op que loggea — la implementación real debe:
 *   1. Leer el prospect de Supabase
 *   2. Llamar al webhook de N8N/GHL con el payload estandarizado
 *   3. Manejar errores silenciosamente (fire-and-forget)
 *
 * TODO (Verymuch team): implementar la lógica real cuando se retome GHL sync,
 * o remover las llamadas desde:
 *   - app/api/prospects/call-analyze/route.ts:115
 *   - app/api/prospects/proposal/route.ts:116
 *   - app/api/prospects/padrino/route.ts:131
 */
export async function triggerGhlPush(prospectId: string): Promise<void> {
  if (!process.env.GHL_WEBHOOK_ENABLED || process.env.GHL_WEBHOOK_ENABLED !== 'true') {
    return;
  }
  console.log('[ghl-trigger] stub called for prospect:', prospectId);
  // Implementación real pendiente.
}
