import { fetchAllCalls } from '@/lib/calls/notion-calls';
import { computeCallStats } from '@/lib/calls/compute-stats';
import {
  insightBoxes,
  pmfCoachContent,
  salesCoachContent,
} from '@/lib/calls/insights-content';
import { KPICards } from '@/components/call-intelligence/KPICards';
import { CategoryChart } from '@/components/call-intelligence/CategoryChart';
import { InternalExternalSplit } from '@/components/call-intelligence/InternalExternalSplit';
import { ProspectPipeline } from '@/components/call-intelligence/ProspectPipeline';
import { TalentPipeline } from '@/components/call-intelligence/TalentPipeline';
import { GeographyGrid } from '@/components/call-intelligence/GeographyGrid';
import { StackedGeoChart } from '@/components/call-intelligence/StackedGeoChart';
import { InsightBoxes } from '@/components/call-intelligence/InsightBoxes';
import { CoachSection } from '@/components/call-intelligence/CoachSection';

// Match the API ISR cadence (15 min). The page calls fetchAllCalls directly
// instead of round-tripping through /api/calls/stats — same data, one less hop.
export const revalidate = 900;

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function CallIntelligencePage() {
  let stats;
  let error: string | null = null;
  try {
    const records = await fetchAllCalls();
    stats = computeCallStats(records);
  } catch (e) {
    error = e instanceof Error ? e.message : 'unknown';
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-[#363536]">
          Call Intelligence
        </h1>
        <div className="rounded-xl border border-[#F3CFA8] bg-[#FDE7D0] p-6 text-sm text-[#8E4710]">
          <p className="font-semibold">No se pudieron cargar las llamadas desde Notion.</p>
          <p className="mt-2">
            Verifica que <code>NOTION_TOKEN</code> y{' '}
            <code>NOTION_CALLS_DB_ID</code> (o{' '}
            <code>NOTION_TRANSCRIPTS_DB_ID</code>) estén configurados y que la
            integración tenga acceso a la base.
          </p>
          {error && (
            <pre className="mt-3 overflow-x-auto rounded bg-white/60 p-3 text-xs">
              {error}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-3xl text-[#363536]"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
          >
            Call Intelligence Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Lectura en vivo de la base de llamadas en Notion · revalida cada 15
            min
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-[#AAD4AE] bg-[#D6EDD8] px-3 py-1 text-xs font-medium text-[#3D7A4A]">
            {stats.totalCalls} llamadas totales
          </span>
          <span className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#6B6B6B]">
            {fmtDate(stats.dateRange.start)} → {fmtDate(stats.dateRange.end)}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#6B6B6B]">
            🔥 {stats.hotLeads} hot · ⚡ {stats.warmLeads} warm
          </span>
        </div>
      </header>

      <KPICards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryChart categories={stats.categories} total={stats.totalCalls} />
        <InternalExternalSplit
          internalCalls={stats.internalCalls}
          externalCalls={stats.externalCalls}
          internalPercentage={stats.internalPercentage}
          externalPercentage={stats.externalPercentage}
        />
      </div>

      <ProspectPipeline rows={stats.prospectPipeline} />

      <div className="grid gap-4 lg:grid-cols-2">
        <GeographyGrid geography={stats.geography} />
        <StackedGeoChart rows={stats.geoByType} />
      </div>

      <TalentPipeline rows={stats.talentPipeline} />

      <InsightBoxes boxes={insightBoxes} />

      <CoachSection
        title="🎯 Sales Coach"
        subtitle="Lectura comercial del pipeline · contenido curado"
        content={salesCoachContent}
        accent="amber"
      />

      <CoachSection
        title="🔬 Product-Market Fit Coach"
        subtitle="Diagnóstico de PMF basado en patrones de las llamadas"
        content={pmfCoachContent}
        accent="mint"
      />
    </div>
  );
}
