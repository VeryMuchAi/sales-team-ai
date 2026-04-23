import Link from 'next/link';

/**
 * Landing pública del Hub. Placeholder en Fase 1 — la landing completa
 * (hero, beneficios, rubric, testimonios, FAQ) se construye en Fase 2.
 */
export default function HubLandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="rounded-full border border-[#AAD4AE]/30 bg-[#141414] px-4 py-1 text-xs uppercase tracking-widest text-[#AAD4AE]">
        Verymuch.ai Hub
      </div>

      <h1 className="font-[family-name:var(--font-jakarta)] text-5xl font-extrabold leading-tight text-white md:text-6xl">
        Talento Claude Certificado.
        <br />
        <span className="text-[#AAD4AE]">Proyectos reales.</span>
      </h1>

      <p className="max-w-2xl text-lg text-[#DDEAEE]/80">
        Aplica al programa Claude Certified Architect bajo Verymuch.ai.
        Certifícate en ≤60 días. Trabaja en clientes gestionados con pago por hitos.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/hub/apply"
          className="rounded-lg bg-[#AAD4AE] px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
        >
          Aplicar al programa
        </Link>
        <a
          href="#como-funciona"
          className="rounded-lg border border-[#DDEAEE]/20 px-6 py-3 text-sm font-semibold text-[#DDEAEE] transition hover:border-[#DDEAEE]/40"
        >
          Cómo funciona
        </a>
      </div>

      <p className="mt-8 text-xs text-[#DDEAEE]/40">
        Fase 1 · shell inicial — la landing completa llega en Fase 2.
      </p>
    </main>
  );
}
