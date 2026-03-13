import { cn } from '@/lib/utils';

export function LeadScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-[#6B6B6B]">--</span>;

  const style =
    score >= 80
      ? 'bg-[#D6EDD8] text-[#3D7A4A]'
      : score >= 60
        ? 'bg-[#FDE7D0] text-[#C4621A]'
        : score >= 40
          ? 'bg-[#DDEAEE] text-[#4A8FA8]'
          : 'bg-[#F0EFED] text-[#6B6B6B]';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', style)}>
      {score}
    </span>
  );
}
