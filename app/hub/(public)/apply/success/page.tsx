import Link from 'next/link';
import { CheckCircle2, Mail, Clock } from 'lucide-react';
import { HubNav } from '@/components/hub/HubNav';

export default async function HubApplySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const shortId = id ? id.slice(0, 8).toUpperCase() : null;

  return (
    <>
      <HubNav />
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-[#AAD4AE]/10 blur-3xl" />
        </div>

        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#AAD4AE]/30 bg-[#AAD4AE]/10">
          <CheckCircle2 className="h-10 w-10 text-[#AAD4AE]" strokeWidth={1.5} />
        </div>

        <div className="relative space-y-4">
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Aplicación recibida
          </h1>
          <p className="mx-auto max-w-lg text-lg text-[#DDEAEE]/70">
            Gracias por aplicar al Claude Certified Architect program.
            La estamos revisando.
          </p>
        </div>

        {shortId && (
          <div className="relative rounded-xl border border-white/10 bg-[#141414] px-5 py-3 font-mono text-sm text-[#AAD4AE]">
            ID · {shortId}
          </div>
        )}

        <div className="relative grid w-full gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#141414] p-5 text-left">
            <Mail className="mb-3 h-5 w-5 text-[#AAD4AE]" />
            <h3 className="font-[family-name:var(--font-jakarta)] text-sm font-bold text-white">
              Revisa tu email
            </h3>
            <p className="mt-1 text-xs text-[#DDEAEE]/60">
              Te enviaremos un correo de confirmación en los próximos minutos.
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#141414] p-5 text-left">
            <Clock className="mb-3 h-5 w-5 text-[#F5A05E]" />
            <h3 className="font-[family-name:var(--font-jakarta)] text-sm font-bold text-white">
              Respuesta en 5 días hábiles
            </h3>
            <p className="mt-1 text-xs text-[#DDEAEE]/60">
              Si hay fit, te contactaremos para agendar una call de 30 minutos.
            </p>
          </div>
        </div>

        <Link
          href="/hub"
          className="relative rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
        >
          Volver al Hub
        </Link>
      </main>
    </>
  );
}
