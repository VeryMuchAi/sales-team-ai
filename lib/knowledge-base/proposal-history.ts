/**
 * Proposal-history knowledge module.
 *
 * Reads the "Propuesta (AI Context)" column from the Notion "Transcripciones
 * & Notas de Llamadas" database (via the existing notion client), plus the
 * prospect_call_sessions rows already synced into Supabase, and produces:
 *
 *   - a machine-readable array of prior proposals (for the Padrino agent)
 *   - a compact markdown block suitable to inject into any system prompt
 *
 * Usage from an agent route:
 *
 *   import { getPriorProposalContext } from '@/lib/knowledge-base/proposal-history';
 *   const block = await getPriorProposalContext(supabase, { companyName });
 *   // ...splice block into the system prompt
 *
 * Decision rules implemented here are the same ones documented in the
 * "Knowledge Base — Índice Maestro de Propuestas" Notion page:
 *
 *   1. If a hash exists for this company → treat as follow-up, not first contact.
 *   2. Copy closing-signal label into the prompt verbatim (🔥/⚡/🧊/…).
 *   3. Refuse to re-propose under hash if last update < 30 days AND signal ≥ Media.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { listUpdatedTranscripts, summarizePage, type TranscriptSummary } from '@/lib/integrations/notion';

export interface PriorProposal {
  hash: string;
  company: string;
  status: string | null;
  amountUsd: number | null;
  closingSignal: string | null;
  lastUpdatedAt: string | null;
  aiContext: string;
  link: string | null;
  sourcePageId: string;
  sourcePageUrl: string;
}

export interface ProposalLookupOpts {
  companyName?: string | null;
  dmEmail?: string | null;
  /** How far back to scan the Notion db (days). Defaults to 120. */
  lookbackDays?: number;
}

export interface ProposalContextResult {
  found: boolean;
  proposals: PriorProposal[];
  /** Compact markdown block ready to splice into a system prompt. Empty if none. */
  promptBlock: string;
  /** True if agent should refuse to create a brand-new proposal and instead evolve an existing one. */
  shouldEvolveExisting: boolean;
}

function normalizeCompany(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\b(s\.?a\.?|s\.?a\.?s|s\.?r\.?l|inc|llc|ltd|gmbh|corp|co)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPriorProposal(s: TranscriptSummary): PriorProposal | null {
  const pr = s.proposal;
  if (!pr.aiContext && !pr.hash) return null;
  return {
    hash: pr.hash ?? `UNSET-${s.pageId.slice(0, 8)}`,
    company: s.company ?? s.title,
    status: s.estado,
    amountUsd: pr.amountUsd,
    closingSignal: pr.closingSignal,
    lastUpdatedAt: pr.lastUpdatedAt,
    aiContext: pr.aiContext ?? '',
    link: pr.link,
    sourcePageId: s.pageId,
    sourcePageUrl: s.url,
  };
}

/**
 * Pull prior proposals that match the given company name (or any overlapping
 * token). Read-only; relies on the Notion REST client already configured in
 * `lib/integrations/notion.ts`.
 */
export async function getPriorProposalsFromNotion(
  opts: ProposalLookupOpts
): Promise<PriorProposal[]> {
  const days = opts.lookbackDays ?? 120;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pages = await listUpdatedTranscripts(since, 100);

  const target = opts.companyName ? normalizeCompany(opts.companyName) : null;

  const matches: PriorProposal[] = [];
  for (const page of pages) {
    const summary = summarizePage(page);
    const candidate = toPriorProposal(summary);
    if (!candidate) continue;

    if (target) {
      const c = normalizeCompany(candidate.company);
      if (c !== target && !c.includes(target) && !target.includes(c)) continue;
    }
    matches.push(candidate);
  }
  return matches;
}

/**
 * Read any locally-cached sessions from Supabase (prospect_call_sessions)
 * whose stored analysis already contains a proposal context block. This is a
 * fallback when Notion is unreachable.
 */
export async function getPriorProposalsFromSupabase(
  supabase: SupabaseClient,
  companyName: string
): Promise<PriorProposal[]> {
  const { data } = await supabase
    .from('prospect_call_sessions')
    .select('prospect_id, label, analysis, notion_page_id, created_at, prospects!inner(company_name)')
    .ilike('prospects.company_name', `%${companyName}%`)
    .order('created_at', { ascending: false })
    .limit(5);
  if (!data) return [];
  return data
    .filter((r: { analysis: string | null }) => r.analysis?.includes('Propuesta (AI Context)'))
    .map((r) => {
      const r2 = r as unknown as {
        label: string;
        analysis: string;
        notion_page_id: string | null;
        prospects: { company_name: string };
      };
      return {
        hash: extractField(r2.analysis, 'HASH') ?? `CACHED-${r2.notion_page_id?.slice(0, 8) ?? 'x'}`,
        company: r2.prospects.company_name,
        status: extractField(r2.analysis, 'STATUS'),
        amountUsd: toNumber(extractField(r2.analysis, 'MONTO_USD')),
        closingSignal: extractField(r2.analysis, 'SEÑALES_CIERRE'),
        lastUpdatedAt: extractField(r2.analysis, 'FECHA_ENVIO'),
        aiContext: extractParagraph(r2.analysis, 'Propuesta (AI Context)'),
        link: null,
        sourcePageId: r2.notion_page_id ?? '',
        sourcePageUrl: '',
      } satisfies PriorProposal;
    });
}

function extractField(text: string, key: string): string | null {
  const m = new RegExp(`${key}\\s*:\\s*([^|\\n]+)`, 'i').exec(text);
  return m ? m[1].trim() : null;
}
function extractParagraph(text: string, headerLabel: string): string {
  const idx = text.indexOf(headerLabel);
  if (idx < 0) return '';
  return text.slice(idx).split('\n_Sincronizado')[0].trim();
}
function toNumber(s: string | null): number | null {
  if (!s) return null;
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function signalIsHotOrWarm(signal: string | null): boolean {
  if (!signal) return false;
  return /🔥|Alta|⚡|Media/i.test(signal);
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

export function formatPromptBlock(proposals: PriorProposal[]): string {
  if (proposals.length === 0) return '';
  const lines: string[] = [];
  lines.push('## Historial de Propuestas (Verymuch Knowledge Base)');
  lines.push(
    '> Estas propuestas YA fueron enviadas a este cliente. NO recrear desde cero. Evolucionar, actualizar o hacer seguimiento.',
  );
  for (const p of proposals) {
    lines.push('');
    lines.push(`### ${p.hash} — ${p.company}`);
    if (p.status) lines.push(`- Estado: ${p.status}`);
    if (p.amountUsd) lines.push(`- Monto: $${p.amountUsd.toLocaleString()} USD`);
    if (p.closingSignal) lines.push(`- Señal de cierre: ${p.closingSignal}`);
    if (p.lastUpdatedAt) lines.push(`- Última act.: ${p.lastUpdatedAt}`);
    if (p.link) lines.push(`- Link: ${p.link}`);
    if (p.aiContext) lines.push(`- Contexto AI:\n  ${p.aiContext.replace(/\n/g, '\n  ')}`);
  }
  return lines.join('\n');
}

/**
 * Main entry point used by agent routes. Always resilient: if Notion fails,
 * falls back to whatever we have in Supabase.
 */
export async function getPriorProposalContext(
  supabase: SupabaseClient,
  opts: ProposalLookupOpts,
): Promise<ProposalContextResult> {
  let proposals: PriorProposal[] = [];
  try {
    proposals = await getPriorProposalsFromNotion(opts);
  } catch (err) {
    console.warn('[proposal-history] Notion lookup failed, falling back to Supabase', err);
  }
  if (proposals.length === 0 && opts.companyName) {
    proposals = await getPriorProposalsFromSupabase(supabase, opts.companyName);
  }

  const shouldEvolve = proposals.some((p) => {
    const age = daysSince(p.lastUpdatedAt);
    return signalIsHotOrWarm(p.closingSignal) && age !== null && age < 30;
  });

  return {
    found: proposals.length > 0,
    proposals,
    promptBlock: formatPromptBlock(proposals),
    shouldEvolveExisting: shouldEvolve,
  };
}
