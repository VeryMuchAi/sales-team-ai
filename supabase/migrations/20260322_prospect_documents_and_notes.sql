-- Prospectos: documentos (transcripciones, presentaciones, otros) + notas de seguimiento
-- Ejecutar en Supabase SQL Editor. Requiere políticas RLS de equipo ya aplicadas en prospects.

-- ---------------------------------------------------------------------------
-- Columnas de seguimiento comercial en prospects
-- ---------------------------------------------------------------------------
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS prospect_objections text;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS prospect_comments text;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS prospect_learnings text;

-- ---------------------------------------------------------------------------
-- Tabla: archivos ligados al prospecto (Storage + metadatos)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospect_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('transcript', 'presentation', 'other')),
  title text,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  file_size integer,
  extracted_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prospect_documents_prospect_id ON public.prospect_documents(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_documents_user_id ON public.prospect_documents(user_id);

ALTER TABLE public.prospect_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prospect_documents_select_team" ON public.prospect_documents;
DROP POLICY IF EXISTS "prospect_documents_insert_creator" ON public.prospect_documents;
DROP POLICY IF EXISTS "prospect_documents_update_team" ON public.prospect_documents;
DROP POLICY IF EXISTS "prospect_documents_delete_team" ON public.prospect_documents;

CREATE POLICY "prospect_documents_select_team"
  ON public.prospect_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "prospect_documents_insert_creator"
  ON public.prospect_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prospect_documents_update_team"
  ON public.prospect_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prospect_documents_delete_team"
  ON public.prospect_documents FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para archivos del prospecto
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('prospect-documents', 'prospect-documents', false, 52428800)
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "prospect_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "prospect_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "prospect_docs_update" ON storage.objects;
DROP POLICY IF EXISTS "prospect_docs_delete" ON storage.objects;

CREATE POLICY "prospect_docs_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'prospect-documents');

CREATE POLICY "prospect_docs_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'prospect-documents');

CREATE POLICY "prospect_docs_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'prospect-documents');

CREATE POLICY "prospect_docs_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'prospect-documents');
