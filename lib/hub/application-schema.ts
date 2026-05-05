import { z } from 'zod';

/**
 * Schema compartido entre el form cliente (/hub/apply) y el endpoint
 * (/api/hub/apply). Single source of truth — si cambia un campo, cambia
 * en ambos lados automáticamente.
 */

export const LANGUAGES = ['ES', 'EN', 'PT', 'FR', 'DE', 'IT'] as const;

export const STACK_OPTIONS = [
  'Claude API',
  'MCP',
  'Claude Code',
  'Anthropic SDK',
  'OpenAI API',
  'N8N',
  'Python',
  'TypeScript',
  'Next.js',
  'Supabase',
  'Postgres',
  'AWS',
  'GCP',
  'Vercel',
  'Docker',
  'LangChain',
  'LlamaIndex',
  'Vector DBs',
] as const;

export const REFERRAL_SOURCES = [
  { value: 'linkedin_edwin', label: 'LinkedIn de Edwin Moreno' },
  { value: 'linkedin_jorge', label: 'LinkedIn de Jorge' },
  { value: 'anthropic', label: 'Anthropic / Academy' },
  { value: 'referral', label: 'Un conocido me refirió' },
  { value: 'search', label: 'Búsqueda en Google' },
  { value: 'other', label: 'Otro' },
] as const;

export const COUNTRIES = [
  'España',
  'México',
  'Colombia',
  'Argentina',
  'Chile',
  'Perú',
  'Uruguay',
  'Ecuador',
  'Venezuela',
  'Costa Rica',
  'Guatemala',
  'Panamá',
  'República Dominicana',
  'Estados Unidos',
  'Brasil',
  'Portugal',
  'Otro',
] as const;

export const applicationSchema = z.object({
  // Identidad
  full_name: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  linkedin_url: z
    .string()
    .trim()
    .url('URL inválida')
    .refine(
      (v) => /linkedin\.com/i.test(v),
      'Debe ser un link de LinkedIn'
    ),
  country: z.string().min(2, 'Selecciona un país'),
  city: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60),

  // Skills
  languages: z.array(z.string()).min(1, 'Selecciona al menos un idioma'),
  stack: z.array(z.string()).min(1, 'Selecciona al menos una tecnología'),
  years_with_llms: z
    .number()
    .min(0, 'Mínimo 0')
    .max(30, 'Máximo 30')
    .nullable(),
  claude_experience: z.enum(['yes', 'no', 'learning'], {
    message: 'Selecciona una opción',
  }),
  portfolio_url: z
    .string()
    .trim()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),

  // Disponibilidad económica
  weekly_hours_min: z.number().min(0).max(80).nullable(),
  weekly_hours_max: z.number().min(0).max(80).nullable(),
  hourly_rate_min_usd: z.number().min(0).nullable(),
  hourly_rate_max_usd: z.number().min(0).nullable(),

  // Libre
  summary: z
    .string()
    .trim()
    .min(50, 'Mínimo 50 caracteres — cuéntanos algo real')
    .max(500, 'Máximo 500 caracteres'),
  referral_source: z.string().min(1, 'Selecciona cómo nos conociste'),
  referral_details: z.string().trim().max(200).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Valores iniciales del form (evita undefined warnings en React). */
export const emptyApplication: ApplicationInput = {
  full_name: '',
  email: '',
  linkedin_url: '',
  country: '',
  city: '',
  languages: [],
  stack: [],
  years_with_llms: null,
  claude_experience: 'no',
  portfolio_url: '',
  weekly_hours_min: null,
  weekly_hours_max: null,
  hourly_rate_min_usd: null,
  hourly_rate_max_usd: null,
  summary: '',
  referral_source: '',
  referral_details: '',
};
