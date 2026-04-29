export default async function OkrHistoricalPage({
  params,
}: {
  params: Promise<{ quarter: string }>;
}) {
  const { quarter } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#363536]">
          OKRs · <span className="font-mono">{quarter}</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Vista histórica del trimestre</p>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-sm text-[#6B6B6B] shadow-sm">
        Shell Fase 1 — Fase 4 incluye: snapshot final del quarter, evolución
        semanal de KRs, lecciones aprendidas.
      </div>
    </div>
  );
}
