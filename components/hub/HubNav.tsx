import Link from 'next/link';
import { VerymuchLogo } from '@/components/brand/VerymuchLogo';

/**
 * Nav del Hub público. Minimal, dark. Logo oficial a la izquierda, CTA a la derecha.
 * No incluye login — esa puerta está en /dashboard.
 */
export function HubNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/hub" className="flex items-center gap-3">
          <VerymuchLogo variant="dark" size="md" />
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#DDEAEE]/60 sm:inline">
            Hub
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="#como-funciona"
            className="hidden text-sm text-[#DDEAEE]/70 transition hover:text-white md:inline"
          >
            Cómo funciona
          </a>
          <a
            href="#faq"
            className="hidden text-sm text-[#DDEAEE]/70 transition hover:text-white md:inline"
          >
            FAQ
          </a>
          <Link
            href="/hub/apply"
            className="rounded-full bg-[#AAD4AE] px-5 py-2 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
          >
            Aplicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
