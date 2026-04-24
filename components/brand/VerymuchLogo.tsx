import Image from 'next/image';

/**
 * Logo oficial de Verymuch.ai.
 *
 * Usa el asset oficial de `/public/logo.png` directamente vía next/image.
 * Reemplaza la implementación previa CSS-inline para garantizar fidelidad
 * 100% con el manual de marca.
 *
 * Aspect ratio del asset: 140 × 36 = ~3.89:1
 *
 * Variante `dark`: el logo oficial tiene texto charcoal que no contrasta
 * sobre fondos oscuros. Lo envolvemos en un badge con fondo cream
 * (#FAF9F7, color oficial de marca) para mantener legibilidad sin alterar
 * el logo en sí.
 */

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'light' | 'dark';

const ASPECT_RATIO = 140 / 36;

const SIZES: Record<
  LogoSize,
  { height: number; darkPad: string; darkRounded: string }
> = {
  sm: { height: 22, darkPad: 'px-2 py-1', darkRounded: 'rounded-md' },
  md: { height: 28, darkPad: 'px-2.5 py-1.5', darkRounded: 'rounded-lg' },
  lg: { height: 42, darkPad: 'px-3 py-2', darkRounded: 'rounded-xl' },
  xl: { height: 56, darkPad: 'px-4 py-2.5', darkRounded: 'rounded-2xl' },
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
  const { height, darkPad, darkRounded } = SIZES[size];
  const width = Math.round(height * ASPECT_RATIO);

  const img = (
    <Image
      src="/logo.png"
      alt="Verymuch.Ai"
      width={width}
      height={height}
      className="object-contain"
      priority
    />
  );

  if (variant === 'dark') {
    return (
      <span
        className={`inline-flex items-center bg-[#FAF9F7] ${darkPad} ${darkRounded} ${className}`}
      >
        {img}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`}>{img}</span>
  );
}
