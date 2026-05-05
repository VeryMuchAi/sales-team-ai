import type { CoachContent } from '@/lib/calls/insights-content';
import { BrandCard } from './BrandCard';

interface CoachSectionProps {
  title: string;
  subtitle?: string;
  content: CoachContent;
  /** Tints the alert/signal/recommendation panels — different per coach. */
  accent: 'amber' | 'mint';
}

const ACCENT = {
  amber: {
    panel: 'bg-[#FDE7D0] border-[#F3CFA8] text-[#8E4710]',
    metric: 'text-[#C4621A]',
  },
  mint: {
    panel: 'bg-[#D6EDD8] border-[#AAD4AE] text-[#1F4D2A]',
    metric: 'text-[#3D7A4A]',
  },
} as const;

export function CoachSection({ title, subtitle, content, accent }: CoachSectionProps) {
  const a = ACCENT[accent];
  const heroPanel = content.alert ?? content.signal;
  const closingPanel = content.recommendation ?? content.verdict;

  return (
    <BrandCard className="p-6">
      <div className="mb-5">
        <h2
          className="text-xl text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#6B6B6B]">{subtitle}</p>
        )}
      </div>

      {heroPanel && (
        <div className={`mb-5 rounded-lg border p-4 ${a.panel}`}>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
          >
            {heroPanel.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{heroPanel.body}</p>
        </div>
      )}

      {content.metrics.length > 0 && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          {content.metrics.map((m) => (
            <div
              key={m.value + m.unit}
              className="rounded-lg border border-[#E5E5E5] bg-[#FAF9F7] p-4"
            >
              <p className="flex items-baseline gap-2">
                <span
                  className={`text-3xl ${a.metric}`}
                  style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
                >
                  {m.value}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                  {m.unit}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                {m.insight}
              </p>
            </div>
          ))}
        </div>
      )}

      {content.cards.length > 0 && (
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          {content.cards.map((c) => (
            <div
              key={c.label}
              className="rounded-lg border border-[#E5E5E5] bg-white p-4"
            >
              <p
                className="text-sm text-[#363536]"
                style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
              >
                {c.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {closingPanel && (
        <div className={`rounded-lg border p-4 ${a.panel}`}>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
          >
            {closingPanel.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{closingPanel.body}</p>
        </div>
      )}
    </BrandCard>
  );
}
