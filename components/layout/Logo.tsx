import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Verymuch.Ai"
      width={140}
      height={36}
      className={`h-8 w-auto object-contain bg-transparent ${className ?? ''}`}
      style={{ background: 'transparent' }}
      priority
    />
  );
}
