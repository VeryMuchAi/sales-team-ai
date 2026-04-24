/**
 * Logo oficial de Verymuch.ai construido inline (no PNG).
 *
 * Wordmark "Verymuch." en Plus Jakarta Sans ExtraBold + box "Ai" con
 * gradiente BRAND oficial del manual (mint #AAD4AE → ice #DDEAEE → amber
 * #F5A05E).
 *
 * El texto "Verymuch." adapta color según `variant`:
 *  - dark  → blanco (sobre fondos oscuros tipo #0A0A0A)
 *  - light → charcoal #363536 (sobre fondos claros)
 *
 * El box "Ai" mantiene siempre el mismo gradiente (los colores del gradiente
 * funcionan sobre ambos backgrounds).
 */

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'light' | 'dark';

const SIZES: Record<
  LogoSize,
  {
    text: string;
    box: string;
    pad: string;
    gap: string;
    rounded: string;
  }
> = {
  sm: {
    text: 'text-base',
    box: 'text-xs',
    pad: 'px-1.5 py-0.5',
    gap: 'gap-1',
    rounded: 'rounded-md',
  },
  md: {
    text: 'text-xl',
    box: 'text-sm',
    pad: 'px-2 py-1',
    gap: 'gap-1.5',
    rounded: 'rounded-md',
  },
  lg: {
    text: 'text-3xl',
    box: 'text-xl',
    pad: 'px-2.5 py-1',
    gap: 'gap-2',
    rounded: 'rounded-lg',
  },
  xl: {
    text: 'text-5xl',
    box: 'text-3xl',
    pad: 'px-3 py-1.5',
    gap: 'gap-2.5',
    rounded: 'rounded-lg',
  },
};

export function VerymuchLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}) {
  const s = SIZES[size];
  const wordmarkColor =
    variant === 'dark' ? 'text-white' : 'text-[#363536]';

  return (
    <span
      aria-label="Verymuch.Ai"
      className={`inline-flex items-center leading-none ${s.gap} ${className}`}
    >
      <span
        className={`font-[family-name:var(--font-jakarta)] font-extrabold tracking-tight ${s.text} ${wordmarkColor}`}
      >
        Verymuch.
      </span>
      <span
        className={`font-[family-name:var(--font-jakarta)] font-extrabold text-[#1a1a1a] bg-[linear-gradient(90deg,#AAD4AE_0%,#DDEAEE_50%,#F5A05E_100%)] ${s.box} ${s.pad} ${s.rounded}`}
      >
        Ai
      </span>
    </span>
  );
}
