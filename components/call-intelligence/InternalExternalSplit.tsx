import { Building, Globe2 } from 'lucide-react';
import { BrandCard } from './BrandCard';

interface InternalExternalSplitProps {
  internalCalls: number;
  externalCalls: number;
  internalPercentage: number;
  externalPercentage: number;
}

export function InternalExternalSplit({
  internalCalls,
  externalCalls,
  internalPercentage,
  externalPercentage,
}: InternalExternalSplitProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <BrandCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B6B6B]">Tiempo Interno</p>
            <p className="mt-0.5 text-xs text-[#9A9A9A]">
              Socio · Interna · Diego · Consejo
            </p>
          </div>
          <div className="rounded-lg bg-[#DDEAEE] p-2">
            <Building className="h-4 w-4 text-[#4A8FA8]" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <p
            className="text-[40px] leading-none text-[#363536]"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
          >
            {internalPercentage}%
          </p>
          <p className="text-sm text-[#6B6B6B]">{internalCalls} llamadas</p>
        </div>
      </BrandCard>

      <BrandCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B6B6B]">Tiempo Externo</p>
            <p className="mt-0.5 text-xs text-[#9A9A9A]">
              Prospecto · Talento · Proveedor
            </p>
          </div>
          <div className="rounded-lg bg-[#FDE7D0] p-2">
            <Globe2 className="h-4 w-4 text-[#C4621A]" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <p
            className="text-[40px] leading-none text-[#363536]"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800 }}
          >
            {externalPercentage}%
          </p>
          <p className="text-sm text-[#6B6B6B]">{externalCalls} llamadas</p>
        </div>
      </BrandCard>
    </div>
  );
}
