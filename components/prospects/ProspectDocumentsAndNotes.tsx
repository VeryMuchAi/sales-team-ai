'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2, Download, FileText, Presentation, Paperclip, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { readTranscriptFromFile } from '@/lib/utils/read-transcript-file';

export type ProspectDocKind = 'transcript' | 'presentation' | 'other';

export interface ProspectDocumentRow {
  id: string;
  kind: ProspectDocKind;
  title: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  extracted_text: string | null;
  created_at: string;
}

function kindLabel(k: ProspectDocKind): string {
  switch (k) {
    case 'transcript':
      return 'Transcripción';
    case 'presentation':
      return 'Presentación';
    default:
      return 'Otro';
  }
}

function kindIcon(k: ProspectDocKind) {
  switch (k) {
    case 'transcript':
      return <FileText className="h-4 w-4 shrink-0 text-[#5BA66B]" />;
    case 'presentation':
      return <Presentation className="h-4 w-4 shrink-0 text-[#C4621A]" />;
    default:
      return <Paperclip className="h-4 w-4 shrink-0 text-[#6B6B6B]" />;
  }
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function safeStorageSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
}

interface ProspectDocumentsAndNotesProps {
  prospectId: string;
  initialObjections: string | null;
  initialComments: string | null;
  initialLearnings: string | null;
  onNotesSaved?: () => void;
  /** Carga el texto en la pestaña Call Analysis */
  onUseTranscriptForAnalysis?: (text: string) => void;
}

export function ProspectDocumentsAndNotes({
  prospectId,
  initialObjections,
  initialComments,
  initialLearnings,
  onNotesSaved,
  onUseTranscriptForAnalysis,
}: ProspectDocumentsAndNotesProps) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<ProspectDocumentRow[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadKind, setUploadKind] = useState<ProspectDocKind>('transcript');
  const [uploading, setUploading] = useState(false);

  const [objections, setObjections] = useState(initialObjections ?? '');
  const [comments, setComments] = useState(initialComments ?? '');
  const [learnings, setLearnings] = useState(initialLearnings ?? '');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setObjections(initialObjections ?? '');
    setComments(initialComments ?? '');
    setLearnings(initialLearnings ?? '');
  }, [initialObjections, initialComments, initialLearnings]);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    const { data, error } = await supabase
      .from('prospect_documents')
      .select(
        'id, kind, title, file_name, storage_path, mime_type, file_size, extracted_text, created_at'
      )
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('No se pudieron cargar los documentos (¿migración aplicada?)');
      setDocs([]);
    } else {
      setDocs((data ?? []) as ProspectDocumentRow[]);
    }
    setLoadingDocs(false);
  }, [prospectId, supabase]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function uploadFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Archivo demasiado grande (máx. 50 MB)');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Sesión requerida');
      return;
    }

    const path = `${prospectId}/${user.id}/${Date.now()}-${safeStorageSegment(file.name)}`;
    const { error: upErr } = await supabase.storage.from('prospect-documents').upload(path, file, {
      upsert: false,
    });
    if (upErr) {
      console.error(upErr);
      toast.error(upErr.message || 'Error al subir el archivo');
      return;
    }

    let extracted: string | null = null;
    if (uploadKind === 'transcript') {
      try {
        extracted = await readTranscriptFromFile(file);
      } catch {
        extracted = null;
      }
    } else if (uploadKind === 'other' && (file.type.startsWith('text/') || file.name.match(/\.(txt|md|csv|srt|vtt)$/i))) {
      try {
        extracted = await readTranscriptFromFile(file);
      } catch {
        extracted = null;
      }
    }

    const { error: insErr } = await supabase.from('prospect_documents').insert({
      prospect_id: prospectId,
      user_id: user.id,
      kind: uploadKind,
      title: null,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      file_size: file.size,
      extracted_text: extracted,
    });

    if (insErr) {
      console.error(insErr);
      await supabase.storage.from('prospect-documents').remove([path]);
      toast.error(insErr.message || 'Error al guardar el registro');
      return;
    }

    toast.success(`Subido: ${file.name}`);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    e.target.value = '';
    if (!list?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        await uploadFile(file);
      }
      await loadDocuments();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: ProspectDocumentRow) {
    const ok = window.confirm(`¿Eliminar "${doc.file_name}"?`);
    if (!ok) return;

    const { error: stErr } = await supabase.storage.from('prospect-documents').remove([doc.storage_path]);
    if (stErr) console.warn(stErr);

    const { error } = await supabase.from('prospect_documents').delete().eq('id', doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Documento eliminado');
    await loadDocuments();
  }

  async function handleDownload(doc: ProspectDocumentRow) {
    const { data, error } = await supabase.storage
      .from('prospect-documents')
      .createSignedUrl(doc.storage_path, 3600);
    if (error || !data?.signedUrl) {
      toast.error('No se pudo generar el enlace de descarga');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  function handleUseInAnalysis(doc: ProspectDocumentRow) {
    const text = doc.extracted_text?.trim();
    if (!text) {
      toast.warning('No hay texto extraído para este archivo. Descárgalo o usa un .txt/.md para transcripciones.');
      return;
    }
    onUseTranscriptForAnalysis?.(text);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          prospect_objections: objections.trim() || null,
          prospect_comments: comments.trim() || null,
          prospect_learnings: learnings.trim() || null,
        })
        .eq('id', prospectId);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Notas guardadas');
      onNotesSaved?.();
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <CardTitle className="text-base text-[#363536]">Objeciones, comentarios y aprendizajes</CardTitle>
          <CardDescription>
            Lo que vayas registrando al interactuar con el cliente se incluye automáticamente en el análisis de
            llamada y en la generación de propuesta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#363536]">Objeciones</Label>
            <Textarea
              value={objections}
              onChange={(e) => setObjections(e.target.value)}
              placeholder="Ej. precio vs competidor, falta de presupuesto, timing…"
              rows={4}
              className="border-[#E5E5E5] text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#363536]">Comentarios / contexto comercial</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Reuniones previas, stakeholders, referidos, matices del deal…"
              rows={4}
              className="border-[#E5E5E5] text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#363536]">Aprendizajes</Label>
            <Textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Qué está funcionando, qué evitar, próximos pasos humanos…"
              rows={4}
              className="border-[#E5E5E5] text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]"
          >
            {savingNotes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar notas'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <CardTitle className="text-base text-[#363536]">Biblioteca de archivos</CardTitle>
          <CardDescription>
            Transcripciones, presentaciones (PDF, PPT…) y otros documentos. Puedes subir varios a la vez. Para
            transcripciones en texto plano (.txt, .md, .srt…) guardamos el texto para reutilizarlo en el análisis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-2 sm:min-w-[200px]">
              <Label className="text-[#363536]">Tipo de archivo</Label>
              <Select value={uploadKind} onValueChange={(v) => setUploadKind(v as ProspectDocKind)}>
                <SelectTrigger className="border-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transcript">Transcripción de llamada</SelectItem>
                  <SelectItem value="presentation">Presentación / deck</SelectItem>
                  <SelectItem value="other">Otro documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                multiple
                onChange={handleFileChange}
                accept=".txt,.text,.md,.csv,.srt,.vtt,.pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              />
              <Button
                type="button"
                variant="outline"
                className="border-[#E5E5E5] text-[#363536]"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo…
                  </>
                ) : (
                  <>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Subir archivos
                  </>
                )}
              </Button>
            </div>
          </div>

          {loadingDocs ? (
            <p className="text-sm text-[#6B6B6B]">Cargando documentos…</p>
          ) : docs.length === 0 ? (
            <p className="text-sm text-[#6B6B6B]">Aún no hay archivos para este prospecto.</p>
          ) : (
            <ul className="divide-y divide-[#E5E5E5] rounded-xl border border-[#E5E5E5] bg-[#FAF9F7]">
              {docs.map((doc) => (
                <li key={doc.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    {kindIcon(doc.kind)}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#363536]">{doc.file_name}</p>
                      <p className="text-xs text-[#6B6B6B]">
                        {kindLabel(doc.kind)}
                        {doc.file_size != null && ` · ${(doc.file_size / 1024).toFixed(1)} KB`}
                        {doc.created_at &&
                          ` · ${new Date(doc.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.extracted_text && onUseTranscriptForAnalysis && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#E5E5E5] text-[#363536]"
                        onClick={() => handleUseInAnalysis(doc)}
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Usar en análisis
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#E5E5E5]"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Descargar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#E5E5E5] text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
