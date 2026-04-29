import Image from 'next/image';

/**
 * Logo oficial de Verymuch.ai.
 *
 * Usa los assets oficiales del equipo directamente (no reconstrucción CSS):
 *  - variant "light" → /logo.png        (texto charcoal sobre fondo claro)
 *  - variant "dark"  → /logo-white.png  (texto blanco sobre fondo oscuro)
 *
 * Ambos PNGs son transparentes, listos para poner sobre cualquier fondo.
 */

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'light' | 'dark';

// Aspect ratio de los PNGs oficiales (logo.png: 2000×400 = 5:1
// logo-white.png: 500×100 = 5:1). Mismo ratio en ambos.
const ASPECT_RATIO = 5;

const SIZES: Record<LogoSize, number> = {
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
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
  const height = SIZES[size];
  const width = Math.round(height * ASPECT_RATIO);
  const src = variant === 'dark' ? '/logo-white.png' : '/logo.png';

  return (
    <Image
      src={src}
      alt="Verymuch.Ai"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );
}
