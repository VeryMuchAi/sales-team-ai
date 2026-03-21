import type { SupabaseClient } from '@supabase/supabase-js';

const RESTRICTED_MSG =
  'Acceso restringido. Contacta al administrador.';

export { RESTRICTED_MSG };

/**
 * Comprueba si el email está en `whitelisted_emails` vía RPC `is_email_whitelisted`.
 * Requiere que la función exista en Supabase (ver supabase/schema.sql).
 */
export async function isEmailWhitelisted(
  supabase: SupabaseClient,
  email: string | null | undefined
): Promise<boolean> {
  if (!email?.trim()) return false;
  const { data, error } = await supabase.rpc('is_email_whitelisted', {
    check_email: email.trim(),
  });
  if (error) {
    console.error('[whitelist] RPC is_email_whitelisted:', error.message);
    return false;
  }
  return data === true;
}
