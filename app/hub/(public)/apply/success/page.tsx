import Link from 'next/link';

export default function HubApplySuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#AAD4AE]/10 text-3xl">
        ✓
      </div>
      <h1 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-white">
        Aplicación recibida
      </h1>
      <p className="text-[#DDEAEE]/70">
        Gracias por aplicar al Claude Certified Architect program. Te responderemos
        en máximo 5 días hábiles.
      </p>
      <Link
        href="/hub"
        className="rounded-lg border border-[#DDEAEE]/20 px-6 py-3 text-sm font-semibold text-[#DDEAEE] transition hover:border-[#DDEAEE]/40"
      >
        Volver al Hub
      </Link>
    </main>
  );
}
