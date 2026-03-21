import type { Lead, LeadCreatorProfile } from '@/lib/types';

/** Perfil embebido desde Supabase `profiles(...)` */
export type CreatorProfile = LeadCreatorProfile | null;

export function embeddedProfile(
  profiles: Lead['profiles']
): LeadCreatorProfile | null {
  if (!profiles) return null;
  return Array.isArray(profiles) ? profiles[0] ?? null : profiles;
}

/**
 * Etiqueta corta para UI: nombre completo, o parte local del email.
 */
export function creatorDisplayName(profile: CreatorProfile | undefined): string {
  if (!profile) return '—';
  const name = profile.full_name?.trim();
  if (name) return name;
  const email = profile.email?.trim();
  if (email) {
    const local = email.split('@')[0];
    return local || email;
  }
  return '—';
}

/** Texto "Creado por …" para badges */
export function createdByLabel(profile: CreatorProfile | undefined): string {
  const who = creatorDisplayName(profile);
  if (who === '—') return 'Creado por —';
  return `Creado por ${who}`;
}
