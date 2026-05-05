import type { GeoStackedRow } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';

interface StackedGeoChartProps {
  rows: GeoStackedRow[];
}

const SERIES = [
  { key: 'prospects' as const, label: 'Prospectos', color: '#AAD4AE' },
  { key: 'talent' as const, label: 'Talento', color: '#DDEAEE' },
  { key: 'diego' as const, label: 'Diego', color: '#F5A05E' },
];

export function StackedGeoChart({ rows }: StackedGeoChartProps) {
  const max = Math.max(...rows.map((r) => r.total), 1);
  return (
    <BrandCard className="p-6">
      <div className="mb-4">
        <h2
          className="text-lg text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
        >
          Llamadas por País — Solo Leads, Talento y Diego
        </h2>
        <p className="text-xs text-[#6B6B6B]">
          Distribución de tiempo externo + tiempo con Diego
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">Sin datos.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const widthPct = (r.total / max) * 100;
            return (
              <div key={r.country}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#363536]">{r.country}</span>
                  <span className="text-[#6B6B6B]">{r.total}</span>
                </div>
                <div
                  className="flex h-3 overflow-hidden rounded-full bg-[#F0EFED]"
                  style={{ width: `${widthPct}%`, minWidth: '4px' }}
                >
                  {SERIES.map((s) => {
                    const segment = (r[s.key] / r.total) * 100;
                    if (!r[s.key]) return null;
                    return (
                      <div
                        key={s.key}
                        style={{
                          width: `${segment}%`,
                          backgroundColor: s.color,
                        }}
                        title={`${s.label}: ${r[s.key]}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BrandCard>
  );
}
