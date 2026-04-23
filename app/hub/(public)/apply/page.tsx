/**
 * Form de aplicación al programa Claude Certified Architect.
 * Shell en Fase 1 — el form completo con validación Zod + submit a
 * /api/hub/apply se construye en Fase 2.
 */
export default function HubApplyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-4 font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-white">
        Aplicar al programa
      </h1>
      <p className="mb-8 text-[#DDEAEE]/70">
        El formulario de aplicación se habilita en Fase 2.
      </p>
      <div className="rounded-xl border border-[#DDEAEE]/10 bg-[#141414] p-6 text-sm text-[#DDEAEE]/60">
        Placeholder — Fase 2 incluye: datos personales, stack, disponibilidad,
        resumen libre, validación, evaluación automática con Claude y email de
        confirmación.
      </div>
    </main>
  );
}
