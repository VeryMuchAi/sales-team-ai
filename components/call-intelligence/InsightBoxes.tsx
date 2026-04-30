import type { InsightBox as InsightBoxType } from '@/lib/calls/insights-content';
import { BrandCard } from './BrandCard';

const TAG_STYLES: Record<string, string> = {
  Eficiencia: 'bg-[#DDEAEE] text-[#3A6F87]',
  Pipeline: 'bg-[#D6EDD8] text-[#3D7A4A]',
  Conversión: 'bg-[#FDE7D0] text-[#B36420]',
  Diego: 'bg-[#F0EFED] text-[#363536]',
  Talento: 'bg-[#EAEEF1] text-[#4A8FA8]',
  Geografía: 'bg-[#FBE8D5] text-[#8E4710]',
  Ownership: 'bg-[#FAD3D3] text-[#8E2A2A]',
};

const FALLBACK_TAG = 'bg-[#F0EFED] text-[#363536]';

interface InsightBoxesProps {
  boxes: InsightBoxType[];
}

export function InsightBoxes({ boxes }: InsightBoxesProps) {
  return (
    <div>
      <div className="mb-4">
        <h2
          className="text-lg text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
        >
          Insights Clave para Socios
        </h2>
        <p className="text-xs text-[#6B6B6B]">
          Lectura rápida del estado del pipeline · contenido curado
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boxes.map((b) => (
          <BrandCard key={b.title} className="p-5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                TAG_STYLES[b.tag] || FALLBACK_TAG
              }`}
            >
              {b.tag}
            </span>
            <h3
              className="mt-3 text-base leading-snug text-[#363536]"
              style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
            >
              {b.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
              {b.body}
            </p>
          </BrandCard>
        ))}
      </div>
    </div>
  );
}
