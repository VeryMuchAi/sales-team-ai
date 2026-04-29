/**
 * Onboarding self-service: el candidato aceptado firma Acuerdo + NDA usando
 * un token JWT único. Shell en Fase 1 — flow completo en Fase 3.
 */
export default async function HubOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-4 font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-white">
        Onboarding Verymuch.ai
      </h1>
      <p className="mb-6 text-[#DDEAEE]/70">
        Shell Fase 1 · token recibido:{' '}
        <code className="rounded bg-[#1a1a1a] px-2 py-0.5 font-mono text-xs text-[#AAD4AE]">
          {token.slice(0, 12)}…
        </code>
      </p>
      <div className="rounded-xl border border-[#DDEAEE]/10 bg-[#1a1a1a] p-6 text-sm text-[#DDEAEE]/60">
        Fase 3 incluirá: verificación del token, firma del Acuerdo de Talento
        Certificado, firma del NDA, confirmación de email asignado y activación
        del perfil.
      </div>
    </main>
  );
}
