/**
 * Logo oficial de Verymuch.ai construido inline (no PNG).
 *
 * Por qué inline:
 *  - Se adapta a cualquier fondo (light/dark) sin necesidad de múltiples assets.
 *  - Escala perfecto sin artefactos (sin raster).
 *  - Usa la tipografía Plus Jakarta Sans ExtraBold ya cargada globalmente.
 *  - Respeta el gradiente oficial de marca (mint → ice → amber, horizontal).
 *
 * Fidelidad con el Manual de Marca v1.0 (Marzo 2026):
 *  - Wordmark "Verymuch." en Plus Jakarta Sans ExtraBold con el punto final
 *    como parte del logotype.
 *  - Box "Ai" con gradiente BRAND (mint #AAD4AE → ice #DDEAEE → amber #F5A05E).
 *  - Texto "Ai" en charcoal #363536 (negro sobre gradiente claro).
 */

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'light' | 'dark';

const SIZES: Record<
  LogoSize,
  {
    text: string;
    box: string;
    gap: string;
    rounded: string;
    aiPad: string;
  }
> = {
  sm: {
    text: 'text-base',
    box: 'text-[0.8rem]',
    aiPad: 'px-1.5 py-[1px]',
    gap: 'gap-1',
    rounded: 'rounded-md',
  },
  md: {
    text: 'text-xl',
    box: 'text-base',
    aiPad: 'px-2 py-0.5',
    gap: 'gap-1.5',
    rounded: 'rounded-lg',
  },
  lg: {
    text: 'text-3xl',
    box: 'text-2xl',
    aiPad: 'px-2.5 py-1',
    gap: 'gap-2',
    rounded: 'rounded-xl',
  },
  xl: {
    text: 'text-5xl',
    box: 'text-4xl',
    aiPad: 'px-3.5 py-1.5',
    gap: 'gap-2.5',
    rounded: 'rounded-2xl',
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
        className={`font-[family-name:var(--font-jakarta)] font-extrabold text-[#363536] bg-[linear-gradient(90deg,#AAD4AE_0%,#DDEAEE_50%,#F5A05E_100%)] ${s.box} ${s.aiPad} ${s.rounded}`}
      >
        Ai
      </span>
    </span>
  );
}
