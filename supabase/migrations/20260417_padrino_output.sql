-- Padrino (agent 5) — hardened Godfather-style proposal output persisted per prospect.
-- JSON columns so we can query the structured offer (ROI, garantía, CTA) without
-- re-running the agent, and a hash index so we can detect evolutions (V2, V3...)
-- coming from the same company.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS padrino_output jsonb,
  ADD COLUMN IF NOT EXISTS padrino_hash text,
  ADD COLUMN IF NOT EXISTS padrino_generated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_prospects_padrino_hash
  ON public.prospects(padrino_hash)
  WHERE padrino_hash IS NOT NULL;

COMMENT ON COLUMN public.prospects.padrino_output IS
  'Structured JSON output from the Padrino agent (oferta, ROI, garantía, CTA, margen_interno, narrative_markdown). Generated on-demand from the 7-slide proposal draft.';
COMMENT ON COLUMN public.prospects.padrino_hash IS
  'Canonical hash CLIENTE-YYYYQX-PRODUCTO-MONTO-VX identifying the proposal version.';
COMMENT ON COLUMN public.prospects.padrino_generated_at IS
  'Timestamp the Padrino agent last hardened this prospect''s proposal.';
