import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Helpers para gatear rutas admin (/hub/admin/*, /admin/okrs/*).
 *
 * Modelo: columna `role` en `profiles` con valores 'user' | 'admin' | 'founder'.
 * Las funciones helper de este archivo son la fuente única de verdad para
 * server components y route handlers.
 */

export type UserRole = 'user' | 'admin' | 'founder' | null;

export interface AuthContext {
  userId: string;
  email: string | null;
  role: UserRole;
  isFounder: boolean;
  isAdmin: boolean;
}

/**
 * Retorna el contexto de auth actual o null si no hay sesión.
 * No redirige — usar en casos donde el estado no-autenticado es válido
 * (ej. la landing pública lee esto para mostrar CTA distinto).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role ?? 'user') as UserRole;

  return {
    userId: user.id,
    email: user.email ?? null,
    role,
    isFounder: role === 'founder',
    isAdmin: role === 'founder' || role === 'admin',
  };
}

/**
 * Exige sesión founder. Redirige a / si no hay sesión o no es founder.
 * Úsese en layouts de /hub/admin y /admin/*.
 */
export async function requireFounder(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    redirect('/?reason=auth_required');
  }
  if (!ctx.isFounder) {
    redirect('/dashboard?reason=forbidden');
  }
  return ctx;
}

/**
 * Exige sesión autenticada (sin check de role).
 * Útil para rutas /dashboard/* que deben estar detrás de login pero
 * no requieren founder.
 */
export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    redirect('/?reason=auth_required');
  }
  return ctx;
}
