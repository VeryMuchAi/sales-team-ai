export default async function HubTalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#363536]">
          Talento <span className="font-mono text-lg text-[#6B6B6B]">#{id.slice(0, 8)}</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Certificación y proyectos</p>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-sm text-[#6B6B6B] shadow-sm">
        Shell Fase 1 — Fase 3 incluye: datos confirmados post-onboarding,
        email asignado, PDFs firmados (Acuerdo + NDA), checklist de los 13
        cursos CCA con timestamps, status del examen, credencial subida,
        proyectos asignados, notas internas.
      </div>
    </div>
  );
}
