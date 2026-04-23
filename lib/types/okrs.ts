/**
 * Tipos del OKR Command Center.
 * Corresponden a tablas okrs / key_results / okr_updates.
 */

export type OkrOwner = 'edwin' | 'jorge' | 'shared';

export type OkrCategory =
  | 'revenue'
  | 'partnership'
  | 'pipeline'
  | 'content'
  | 'seo'
  | 'other';

export type OkrStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved';

export type KrMetricType = 'count' | 'currency' | 'percentage' | 'boolean';

export type KrDataSource =
  | 'manual'
  | 'auto_hub'
  | 'auto_stripe'
  | 'auto_supabase_query';

export interface Okr {
  id: string;
  quarter: string;           // 'Q2-2026'
  objective: string;
  owner: OkrOwner;
  category: OkrCategory;
  status: OkrStatus;
  weight: number;            // 1-5
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  okr_id: string;
  description: string;
  metric_type: KrMetricType;
  target_value: number;
  current_value: number;
  unit: string;
  data_source: KrDataSource;
  auto_query: string | null;
  last_updated_at: string;
  updated_by: string | null;
  sort_order: number;
  created_at: string;
}

export interface OkrUpdate {
  id: string;
  key_result_id: string;
  previous_value: number;
  new_value: number;
  note: string | null;
  updated_by: string | null;
  created_at: string;
}

/** Retorno de get_okr_progress(quarter) */
export interface OkrProgressSummary {
  quarter: string;
  total_okrs: number;
  achieved: number;
  on_track: number;
  at_risk: number;
  behind: number;
  weighted_progress: number; // 0..1
}

/** OKR con sus KRs embebidos (forma de render principal) */
export interface OkrWithKrs extends Okr {
  key_results: KeyResult[];
}

/** Meta-config del dashboard: quarter actual + dates */
export interface QuarterConfig {
  id: string;           // 'Q2-2026'
  label: string;        // 'Q2 2026'
  start_date: string;   // '2026-04-01'
  end_date: string;     // '2026-06-30'
}

export const CURRENT_QUARTER: QuarterConfig = {
  id: 'Q2-2026',
  label: 'Q2 2026',
  // Verymuch.ai decidió cortar Q2 el 15 de julio como deadline de certificación.
  // Usamos 30-jun como end_date oficial del trimestre; el countdown visual
  // apunta al 15-jul (se configura en el dashboard).
  start_date: '2026-04-01',
  end_date: '2026-06-30',
};

/** Deadline interno de Partnership (visible en el header). */
export const PARTNERSHIP_DEADLINE = '2026-07-15';

/**
 * Color tokens por status (usados en componentes).
 * No importamos el objeto brand de lib/brand.ts porque la estética de
 * admin vive en light mode y usa paleta del dashboard existente.
 */
export const STATUS_TOKENS: Record<
  OkrStatus,
  { badge: string; bar: string; text: string }
> = {
  on_track: {
    badge: 'bg-[#D6EDD8] text-[#3D7A4A]',
    bar: 'bg-[#5BA66B]',
    text: 'text-[#3D7A4A]',
  },
  achieved: {
    badge: 'bg-[#D6EDD8] text-[#2E5F3A]',
    bar: 'bg-[#3D7A4A]',
    text: 'text-[#2E5F3A]',
  },
  at_risk: {
    badge: 'bg-[#FDE7D0] text-[#C4621A]',
    bar: 'bg-[#F5A05E]',
    text: 'text-[#C4621A]',
  },
  behind: {
    badge: 'bg-[#FDD0D0] text-[#B02222]',
    bar: 'bg-[#E55353]',
    text: 'text-[#B02222]',
  },
};
