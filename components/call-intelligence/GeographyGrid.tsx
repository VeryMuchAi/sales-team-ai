import type { GeographySlice } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';

interface GeographyGridProps {
  geography: GeographySlice[];
}

export function GeographyGrid({ geography }: GeographyGridProps) {
  return (
    <BrandCard className="p-6">
      <div className="mb-4">
        <h2
          className="text-lg text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
        >
          Distribución Geográfica
        </h2>
        <p className="text-xs text-[#6B6B6B]">
          Todas las llamadas, agrupadas por país / región
        </p>
      </div>
      {geography.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">Sin datos geográficos.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {geography.map((g) => (
            <div
              key={g.country}
              className="rounded-lg border border-[#E5E5E5] bg-[#FAF9F7] p-4"
            >
              <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                {g.country}
              </p>
              <p
                className="mt-1 text-2xl text-[#363536]"
                style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
              >
                {g.count}
              </p>
              <p className="text-xs text-[#9A9A9A]">{g.percentage}% del total</p>
            </div>
          ))}
        </div>
      )}
    </BrandCard>
  );
}
