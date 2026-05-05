import { Phone, CalendarDays, Users, Building2 } from 'lucide-react';
import type { CallStats } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';

interface KPICardsProps {
  stats: CallStats;
}

interface CardSpec {
  label: string;
  value: number | string;
  unit?: string;
  Icon: typeof Phone;
  iconBg: string;
  iconColor: string;
}

export function KPICards({ stats }: KPICardsProps) {
  const cards: CardSpec[] = [
    {
      label: 'Total Llamadas',
      value: stats.totalCalls,
      Icon: Phone,
      iconBg: 'bg-[#DDEAEE]',
      iconColor: 'text-[#4A8FA8]',
    },
    {
      label: 'Llamadas / Semana',
      value: stats.callsPerWeek,
      unit: `en ${stats.totalWeeks} sem.`,
      Icon: CalendarDays,
      iconBg: 'bg-[#D6EDD8]',
      iconColor: 'text-[#5BA66B]',
    },
    {
      label: 'Prospectos Contactados',
      value: stats.totalProspects,
      Icon: Users,
      iconBg: 'bg-[#FDE7D0]',
      iconColor: 'text-[#C4621A]',
    },
    {
      label: 'Empresas Únicas',
      value: stats.uniqueCompanies,
      Icon: Building2,
      iconBg: 'bg-[#F0EFED]',
      iconColor: 'text-[#363536]',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <BrandCard key={c.label} className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#6B6B6B]">{c.label}</p>
            <div className={`rounded-lg p-2 ${c.iconBg}`}>
              <c.Icon className={`h-4 w-4 ${c.iconColor}`} />
            </div>
          </div>
          <p
            className="mt-3 text-[40px] leading-none text-[#363536]"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
          >
            {c.value}
          </p>
          {c.unit && (
            <p className="mt-2 text-xs text-[#6B6B6B]">{c.unit}</p>
          )}
        </BrandCard>
      ))}
    </div>
  );
}
