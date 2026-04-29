/**
 * Next.js middleware entry point.
 * Delega toda la lógica a proxy.ts (hub rewrite + auth Supabase).
 */
export { proxy as default, config } from './proxy';
