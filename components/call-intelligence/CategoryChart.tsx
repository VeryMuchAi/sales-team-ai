import type { CategorySlice, DisplayCategory } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';

interface CategoryChartProps {
  categories: CategorySlice[];
  total: number;
}

const CATEGORY_COLORS: Record<DisplayCategory, string> = {
  Prospecto: '#AAD4AE',
  Talento: '#DDEAEE',
  Socio: '#F5A05E',
  Diego: '#EAEEF1',
  Interna: '#C9C8C6',
  Proveedor: '#E5C7AB',
  Consejo: '#C7DDC6',
  'Sin categoría': '#E5E5E5',
};

export function CategoryChart({ categories, total }: CategoryChartProps) {
  const max = Math.max(...categories.map((c) => c.count), 1);
  return (
    <BrandCard className="p-6">
      <div className="mb-4">
        <h2
          className="text-lg text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
        >
          Distribución por Categoría
        </h2>
        <p className="text-xs text-[#6B6B6B]">
          {total} llamadas totales · ordenadas por volumen
        </p>
      </div>
      <div className="space-y-3">
        {categories.map((c) => {
          const widthPct = (c.count / max) * 100;
          const color = CATEGORY_COLORS[c.name] || '#E5E5E5';
          return (
            <div key={c.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[#363536]">{c.name}</span>
                <span className="text-[#6B6B6B]">
                  {c.count}{' '}
                  <span className="text-xs">({c.percentage}%)</span>
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#F0EFED]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </BrandCard>
  );
}
