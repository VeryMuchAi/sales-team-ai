/**
 * Lee texto de un archivo de transcripción en el cliente (UTF-8).
 * Recomendado: .txt, .md, .csv, .srt, .vtt (export desde Otter, Zoom, etc.).
 * Word (.doc/.docx): exporta a .txt o pega el texto. PDF no soportado.
 */
export async function readTranscriptFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const mime = file.type;

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    throw new Error('PDF no soportado. Copia el texto o exporta a .txt.');
  }

  if (
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  ) {
    throw new Error(
      'Word no se lee aquí directamente. Guarda como .txt/.md o copia y pega la transcripción.'
    );
  }

  const text = (await file.text()).trim();
  if (!text) {
    throw new Error('El archivo está vacío');
  }
  return text;
}
