import Link from 'next/link';
import { VerymuchLogo } from '@/components/brand/VerymuchLogo';

/**
 * Nav del Hub público. Night mode · brand system Verymuch.ai v2.
 * Logo blanco a la izquierda, CTA gradient wash a la derecha.
 * JetBrains Mono en la etiqueta "Hub".
 */
export function HubNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2A2A28] bg-[#151514]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/hub" className="flex items-center gap-3">
          <VerymuchLogo variant="dark" size="md" />
          <span className="hidden rounded-full border border-[#2A2A28] px-2.5 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[9px] font-medium uppercase tracking-[0.14em] text-[#9A958A] sm:inline">
            Hub
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="#como-funciona"
            className="hidden text-sm font-medium text-[#9A958A] transition hover:text-[#F0EEE8] md:inline"
          >
            Cómo funciona
          </a>
          <a
            href="#faq"
            className="hidden text-sm font-medium text-[#9A958A] transition hover:text-[#F0EEE8] md:inline"
          >
            FAQ
          </a>
          <Link
            href="/hub/apply"
            className="rounded-[10px] border border-white/[0.14] bg-[linear-gradient(90deg,rgba(172,237,235,0.12)_0%,rgba(188,218,199,0.12)_35%,rgba(215,204,160,0.12)_65%,rgba(218,184,130,0.12)_100%)] px-5 py-2 text-sm font-semibold text-[#F0EEE8] transition-all duration-200 hover:bg-[linear-gradient(90deg,#ACEDEB_0%,#BCDAC7_35%,#D7CCA0_65%,#DAB882_100%)] hover:text-[#151514]"
          >
            Aplicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
