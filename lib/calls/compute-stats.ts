/**
 * Pure functions that turn an array of TranscriptSummary into a CallStats
 * snapshot for the Call Intelligence dashboard. No I/O — easy to unit test.
 */

import type { TranscriptSummary } from '@/lib/integrations/notion';
import type {
  CallStats,
  CategorySlice,
  DisplayCategory,
  GeographySlice,
  GeoStackedRow,
  PipelineStatusSlice,
  ProspectPipelineRow,
  SignalLevel,
  TalentPipelineRow,
} from './types';

const DIEGO_RE = /diego/i;
const HOT_RE = /🔥|fuego|hot|alta/i;
const WARM_RE = /⚡|tibio|warm|media/i;

function normCompany(s: string | null | undefined): string {
  return (s || '').trim().toLowerCase();
}

/** Collapses a list of summaries that share the same company into a single
 * pipeline row, keeping the most recently edited fields.
 */
function rollupProspect(rows: TranscriptSummary[]): ProspectPipelineRow {
  // rows already sorted desc by lastEditedAt at the caller level.
  const latest = rows[0];
  const company =
    rows.find((r) => r.company)?.company || latest.title || 'Sin empresa';
  const contact =
    rows.find((r) => r.interlocutor)?.interlocutor || 'Sin contacto';
  const status = rows.find((r) => r.estado)?.estado ?? null;
  const pain = rows.find((r) => r.pain)?.pain ?? null;
  const country = rows.find((r) => r.region)?.region ?? null;
  const signal = rows.find((r) => r.proposal.closingSignal)?.proposal.closingSignal ?? null;
  const proposalAmount =
    rows.find((r) => r.proposal.amountUsd != null)?.proposal.amountUsd ?? null;

  return {
    company,
    contact,
    sessions: rows.length,
    status,
    pain,
    country,
    signal,
    signalLevel: classifySignal(signal),
    proposalAmount,
    lastEditedAt: latest.lastEditedAt,
    notionUrl: latest.url,
  };
}

function classifySignal(s: string | null): SignalLevel {
  if (!s) return 'none';
  if (HOT_RE.test(s)) return 'hot';
  if (WARM_RE.test(s)) return 'warm';
  return 'none';
}

function isDiego(s: TranscriptSummary): boolean {
  return DIEGO_RE.test(s.interlocutor || '') || DIEGO_RE.test(s.title || '');
}

function displayCategory(s: TranscriptSummary): DisplayCategory {
  if (isDiego(s)) return 'Diego';
  const c = (s.categoria || '').trim();
  switch (c) {
    case 'Prospecto':
    case 'Talento':
    case 'Socio':
    case 'Interna':
    case 'Proveedor':
    case 'Consejo':
      return c;
    default:
      return 'Sin categoría';
  }
}

function isInternalCategory(c: DisplayCategory): boolean {
  return c === 'Socio' || c === 'Interna' || c === 'Diego' || c === 'Consejo';
}

const SIGNAL_RANK: Record<SignalLevel, number> = { hot: 0, warm: 1, none: 2 };

function pct(num: number, total: number): number {
  if (!total) return 0;
  return Math.round((num / total) * 1000) / 10; // 1 decimal place
}

export function computeCallStats(records: TranscriptSummary[]): CallStats {
  const total = records.length;

  // ---- Date range ----
  const datedRecords = records
    .map((r) => r.fecha)
    .filter((d): d is string => !!d)
    .sort();
  const start = datedRecords[0] ?? null;
  const end = datedRecords[datedRecords.length - 1] ?? null;
  const totalWeeks =
    start && end
      ? Math.max(
          1,
          Math.round(
            (new Date(end).getTime() - new Date(start).getTime()) /
              (7 * 24 * 60 * 60 * 1000),
          ),
        )
      : 1;
  const callsPerWeek = total ? Math.round((total / totalWeeks) * 10) / 10 : 0;

  // ---- Categories ----
  const categoryCounts = new Map<DisplayCategory, number>();
  const tagged = records.map((r) => ({ rec: r, cat: displayCategory(r) }));
  for (const { cat } of tagged) {
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }
  const categories: CategorySlice[] = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count, percentage: pct(count, total) }))
    .sort((a, b) => b.count - a.count);

  // ---- Internal / External ----
  const internalCalls = tagged.filter((t) => isInternalCategory(t.cat)).length;
  const externalCalls = total - internalCalls;

  // ---- Prospect pipeline (group by company) ----
  const prospectRecords = tagged
    .filter((t) => t.cat === 'Prospecto')
    .map((t) => t.rec)
    .sort((a, b) => (a.lastEditedAt < b.lastEditedAt ? 1 : -1));

  const byCompany = new Map<string, TranscriptSummary[]>();
  for (const r of prospectRecords) {
    const key = normCompany(r.company) || normCompany(r.title);
    if (!key) continue;
    const arr = byCompany.get(key) || [];
    arr.push(r);
    byCompany.set(key, arr);
  }

  const prospectPipeline: ProspectPipelineRow[] = Array.from(byCompany.values())
    .map(rollupProspect)
    .sort((a, b) => {
      const r = SIGNAL_RANK[a.signalLevel] - SIGNAL_RANK[b.signalLevel];
      if (r !== 0) return r;
      return a.lastEditedAt < b.lastEditedAt ? 1 : -1;
    });

  const totalProspects = prospectRecords.length;
  const uniqueCompanies = byCompany.size;
  const hotLeads = prospectPipeline.filter((p) => p.signalLevel === 'hot').length;
  const warmLeads = prospectPipeline.filter((p) => p.signalLevel === 'warm').length;

  // ---- Talent pipeline (group by interlocutor) ----
  const talentRecords = tagged
    .filter((t) => t.cat === 'Talento')
    .map((t) => t.rec)
    .sort((a, b) => (a.lastEditedAt < b.lastEditedAt ? 1 : -1));

  const byTalent = new Map<string, TranscriptSummary[]>();
  for (const r of talentRecords) {
    const key = (r.interlocutor || r.title).trim().toLowerCase();
    if (!key) continue;
    const arr = byTalent.get(key) || [];
    arr.push(r);
    byTalent.set(key, arr);
  }
  const talentPipeline: TalentPipelineRow[] = Array.from(byTalent.values()).map(
    (rows) => {
      const latest = rows[0];
      return {
        name: latest.interlocutor || latest.title || 'Sin nombre',
        country: rows.find((r) => r.region)?.region ?? null,
        specialty: rows.find((r) => r.pain)?.pain ?? null,
        status: rows.find((r) => r.estado)?.estado ?? null,
        lastEditedAt: latest.lastEditedAt,
        notionUrl: latest.url,
      };
    },
  );

  // ---- Geography (all calls) ----
  const geoCounts = new Map<string, number>();
  for (const r of records) {
    const c = (r.region || 'Sin región').trim();
    geoCounts.set(c, (geoCounts.get(c) || 0) + 1);
  }
  const geography: GeographySlice[] = Array.from(geoCounts.entries())
    .map(([country, count]) => ({ country, count, percentage: pct(count, total) }))
    .sort((a, b) => b.count - a.count);

  // ---- Geography stacked (prospects + talent + diego only) ----
  const stack = new Map<string, GeoStackedRow>();
  for (const { rec, cat } of tagged) {
    if (cat !== 'Prospecto' && cat !== 'Talento' && cat !== 'Diego') continue;
    const country = (rec.region || 'Sin región').trim();
    const row =
      stack.get(country) || {
        country,
        prospects: 0,
        talent: 0,
        diego: 0,
        total: 0,
      };
    if (cat === 'Prospecto') row.prospects++;
    else if (cat === 'Talento') row.talent++;
    else row.diego++;
    row.total++;
    stack.set(country, row);
  }
  const geoByType: GeoStackedRow[] = Array.from(stack.values()).sort(
    (a, b) => b.total - a.total,
  );

  // ---- Pipeline by status (one entry per company, latest status) ----
  const statusCounts = new Map<string, number>();
  for (const p of prospectPipeline) {
    const key = p.status || 'Sin estado';
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
  }
  const pipelineByStatus: PipelineStatusSlice[] = Array.from(
    statusCounts.entries(),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCalls: total,
    callsPerWeek,
    totalProspects,
    uniqueCompanies,
    dateRange: { start, end },
    totalWeeks,
    categories,
    internalCalls,
    externalCalls,
    internalPercentage: pct(internalCalls, total),
    externalPercentage: pct(externalCalls, total),
    prospectPipeline,
    talentPipeline,
    geography,
    geoByType,
    pipelineByStatus,
    hotLeads,
    warmLeads,
    generatedAt: new Date().toISOString(),
  };
}
