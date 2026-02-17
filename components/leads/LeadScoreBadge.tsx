import { cn } from '@/lib/utils';

export function LeadScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">--</span>;

  const color =
    score >= 80
      ? 'bg-green-500/20 text-green-400'
      : score >= 60
        ? 'bg-yellow-500/20 text-yellow-400'
        : score >= 40
          ? 'bg-orange-500/20 text-orange-400'
          : 'bg-red-500/20 text-red-400';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', color)}>
      {score}
    </span>
  );
}
