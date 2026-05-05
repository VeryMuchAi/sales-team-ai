import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string | null;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Discovery: 'bg-[#DDEAEE] text-[#3A6F87] border-[#C0DBE3]',
  'Propuesta Enviada': 'bg-[#FDE7D0] text-[#B36420] border-[#F3CFA8]',
  'En Negociación': 'bg-[#FBC893] text-[#8E4710] border-[#F3A05E]',
  'Activo / En Progreso': 'bg-[#D6EDD8] text-[#3D7A4A] border-[#AAD4AE]',
  'Cerrado Ganado': 'bg-[#AAD4AE] text-[#1F4D2A] border-[#5BA66B]',
  'Cerrado Perdido': 'bg-[#FAD3D3] text-[#8E2A2A] border-[#E85D5D]',
  Interna: 'bg-[#F0EFED] text-[#6B6B6B] border-[#E0DFDD]',
};

const FALLBACK = 'bg-[#F0EFED] text-[#6B6B6B] border-[#E0DFDD]';

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
          FALLBACK,
          className,
        )}
      >
        Sin estado
      </span>
    );
  }
  const style = STATUS_STYLES[status] || FALLBACK;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}
