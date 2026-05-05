import { cn } from '@/lib/utils';

interface BrandCardProps {
  children: React.ReactNode;
  className?: string;
  /** When true, renders the 2px brand-gradient border across the top of the card. */
  gradientTop?: boolean;
}

/**
 * The visual container that defines the Call Intelligence look:
 * white card with a soft gradient bar across the top (mint → ice → amber).
 */
export function BrandCard({ children, className, gradientTop = true }: BrandCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm',
        className,
      )}
    >
      {gradientTop && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] opacity-70"
          style={{
            background:
              'linear-gradient(135deg, #A6DA8E 0%, #C4E2B8 35%, #E0D8C4 65%, #F3A05E 100%)',
          }}
        />
      )}
      {children}
    </div>
  );
}
