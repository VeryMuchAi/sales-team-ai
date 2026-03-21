'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS: { id: string; label: string }[] = [
  { id: 'research', label: 'Research' },
  { id: 'brief', label: 'Pre-Call Brief' },
  { id: 'call_analyzed', label: 'Call Analysis' },
  { id: 'proposal', label: 'Propuesta' },
];

/** How many pipeline steps are fully completed (0–4). */
export function completedStepCount(stage: string | null | undefined): number {
  switch (stage) {
    case 'research':
      return 0;
    case 'brief':
      return 2;
    case 'call_analyzed':
      return 3;
    case 'proposal':
      return 4;
    default:
      return 0;
  }
}

export function StageStepper({ stage }: { stage: string | null | undefined }) {
  const done = completedStepCount(stage);

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
        Pipeline del prospecto
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < done;
          const isActive = idx === done && done < STEPS.length;
          const isPending = idx > done;

          return (
            <div key={step.id} className="flex items-center gap-2 sm:min-w-0 sm:flex-1">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isDone && 'bg-[#5BA66B] text-white',
                  isActive && 'bg-[#AAD4AE] text-[#363536] ring-2 ring-[#AAD4AE]/50',
                  isPending && 'bg-[#F0EFED] text-[#6B6B6B]'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium sm:text-sm',
                  isActive && 'text-[#363536]',
                  isDone && 'text-[#5BA66B]',
                  isPending && 'text-[#6B6B6B]'
                )}
              >
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 hidden h-0.5 w-6 shrink-0 sm:block md:w-10',
                    idx < done ? 'bg-[#AAD4AE]' : 'bg-[#E5E5E5]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[#6B6B6B]">
        Etapa guardada:{' '}
        <span className="font-semibold text-[#363536]">{stage ?? '—'}</span>
      </p>
    </div>
  );
}

export function defaultTabForStage(stage: string | null | undefined): string {
  switch (stage) {
    case 'proposal':
      return 'proposal';
    case 'call_analyzed':
      return 'call';
    case 'brief':
      return 'brief';
    case 'research':
    default:
      return 'intel';
  }
}
