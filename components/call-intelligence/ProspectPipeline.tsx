import { ExternalLink } from 'lucide-react';
import type { ProspectPipelineRow } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';
import { StatusBadge } from './StatusBadge';

interface ProspectPipelineProps {
  rows: ProspectPipelineRow[];
}

function signalIcon(level: ProspectPipelineRow['signalLevel']): string {
  if (level === 'hot') return '🔥';
  if (level === 'warm') return '⚡';
  return '·';
}

function formatAmount(amount: number | null): string {
  if (amount == null) return '—';
  return `$${amount.toLocaleString('en-US')}`;
}

export function ProspectPipeline({ rows }: ProspectPipelineProps) {
  return (
    <BrandCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className="text-lg text-[#363536]"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
          >
            Pipeline de Prospectos
          </h2>
          <p className="text-xs text-[#6B6B6B]">
            {rows.length} empresas · ordenadas por señal de cierre
          </p>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#E5E5E5] p-6 text-center text-sm text-[#6B6B6B]">
          Aún no hay llamadas con categoría Prospecto.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                <th className="py-2 pr-4">Empresa</th>
                <th className="py-2 pr-4">Contacto</th>
                <th className="py-2 pr-4 text-center">Sesiones</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Señal</th>
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Propuesta</th>
                <th className="py-2 pr-2">Dolor / Contexto</th>
                <th className="py-2 pr-0 text-right">Notion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.company + r.lastEditedAt}
                  className="border-b border-[#F0EFED] last:border-b-0 hover:bg-[#FAF9F7]"
                >
                  <td className="py-3 pr-4 font-medium text-[#363536]">
                    {r.company}
                  </td>
                  <td className="py-3 pr-4 text-[#6B6B6B]">{r.contact}</td>
                  <td className="py-3 pr-4 text-center text-[#363536]">
                    {r.sessions}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-base" title={r.signal || 'Sin señal'}>
                      {signalIcon(r.signalLevel)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#6B6B6B]">
                    {r.country || '—'}
                  </td>
                  <td className="py-3 pr-4 text-[#363536]">
                    {formatAmount(r.proposalAmount)}
                  </td>
                  <td className="py-3 pr-2 max-w-[280px] text-xs text-[#6B6B6B]">
                    <span className="line-clamp-2">{r.pain || '—'}</span>
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={r.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#4A8FA8] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BrandCard>
  );
}
