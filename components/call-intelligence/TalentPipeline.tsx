import { ExternalLink } from 'lucide-react';
import type { TalentPipelineRow } from '@/lib/calls/types';
import { BrandCard } from './BrandCard';
import { StatusBadge } from './StatusBadge';

interface TalentPipelineProps {
  rows: TalentPipelineRow[];
}

export function TalentPipeline({ rows }: TalentPipelineProps) {
  return (
    <BrandCard className="p-6">
      <div className="mb-4">
        <h2
          className="text-lg text-[#363536]"
          style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700 }}
        >
          Pipeline de Talento
        </h2>
        <p className="text-xs text-[#6B6B6B]">
          {rows.length} candidatos en conversación
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#E5E5E5] p-6 text-center text-sm text-[#6B6B6B]">
          Sin candidatos registrados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                <th className="py-2 pr-4">Candidato</th>
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Especialidad</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-0 text-right">Notion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.name + r.lastEditedAt}
                  className="border-b border-[#F0EFED] last:border-b-0 hover:bg-[#FAF9F7]"
                >
                  <td className="py-3 pr-4 font-medium text-[#363536]">
                    {r.name}
                  </td>
                  <td className="py-3 pr-4 text-[#6B6B6B]">
                    {r.country || '—'}
                  </td>
                  <td className="py-3 pr-4 max-w-[400px] text-xs text-[#6B6B6B]">
                    <span className="line-clamp-2">{r.specialty || '—'}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={r.status} />
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
