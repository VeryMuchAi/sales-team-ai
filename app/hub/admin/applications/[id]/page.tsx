export default async function HubApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#363536]">
          Aplicación <span className="font-mono text-lg text-[#6B6B6B]">#{id.slice(0, 8)}</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Detalle y acciones</p>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-sm text-[#6B6B6B] shadow-sm">
        Shell Fase 1 — Fase 3 incluye: datos completos del candidato, score
        breakdown de Claude, razonamiento del evaluador, botones approve /
        request_info / reject, timeline de cambios de status.
      </div>
    </div>
  );
}
