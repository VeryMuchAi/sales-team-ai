import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HubNav } from '@/components/hub/HubNav';
import { ApplicationForm } from '@/components/hub/ApplicationForm';

export default function HubApplyPage() {
  return (
    <>
      <HubNav />
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/hub"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#DDEAEE]/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Hub
        </Link>

        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#AAD4AE]/30 bg-[#AAD4AE]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#AAD4AE]">
            Aplicación
          </div>
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Cuéntanos quién eres
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#DDEAEE]/60">
            5 minutos. Respuesta en máximo 5 días hábiles. Si hay fit, arrancamos.
          </p>
        </div>

        <ApplicationForm />
      </main>
    </>
  );
}
