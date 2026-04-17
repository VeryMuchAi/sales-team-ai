/**
 * Minimal Notion API client for the transcriptions sync.
 *
 * Uses the public Notion REST API directly (no SDK dep). Auth is an
 * internal integration token — Edwin must create one at
 * https://www.notion.so/my-integrations and share the
 * "Transcripciones & Notas de Llamadas" database with it.
 *
 * Env vars:
 *   NOTION_TOKEN               — secret_xxx (internal integration token)
 *   NOTION_TRANSCRIPTS_DB_ID   — 01ca3131-e6c2-4371-8e37-6232f97a64b2
 */

const NOTION_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export class NotionApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'NotionApiError';
  }
}

function getToken(): string {
  const t = process.env.NOTION_TOKEN;
  if (!t) throw new Error('NOTION_TOKEN not configured');
  return t;
}

export function getTranscriptsDbId(): string {
  const id = process.env.NOTION_TRANSCRIPTS_DB_ID;
  if (!id) throw new Error('NOTION_TRANSCRIPTS_DB_ID not configured');
  return id;
}

async function notionFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new NotionApiError(res.status, `Notion ${res.status}: ${body.slice(0, 500)}`, body);
  }
  return (await res.json()) as T;
}

// ----- Types (partial — only what we use) -----

export interface NotionRichText {
  plain_text: string;
}

interface NotionSelect {
  name: string;
}

interface NotionDate {
  start: string;
  end?: string | null;
}

interface NotionNumber {
  number: number | null;
}

interface NotionUrl {
  url: string | null;
}

interface NotionPageProperties {
  Nombre?: { title: NotionRichText[] };
  'Empresa / Org'?: { rich_text: NotionRichText[] };
  'Interlocutor Principal'?: { rich_text: NotionRichText[] };
  'Dolor / Contexto Principal'?: { rich_text: NotionRichText[] };
  'Próximos Pasos'?: { rich_text: NotionRichText[] };
  Fecha?: { date: NotionDate | null };
  Categoría?: { select: NotionSelect | null };
  Estado?: { select: NotionSelect | null };
  Fuente?: { select: NotionSelect | null };
  'País / Región'?: { select: NotionSelect | null };
  // --- AI-ready proposal context columns (added 2026-04-16) ---
  'Propuesta (AI Context)'?: { rich_text: NotionRichText[] };
  'Link Propuesta'?: NotionUrl;
  'Monto Propuesta USD'?: NotionNumber;
  'Señales de Cierre'?: { select: NotionSelect | null };
  'Última Act. Propuesta'?: { date: NotionDate | null };
  'Hash Propuesta'?: { rich_text: NotionRichText[] };
}

export interface NotionTranscriptPage {
  id: string;
  url: string;
  last_edited_time: string;
  created_time: string;
  properties: NotionPageProperties;
}

interface QueryResponse {
  results: NotionTranscriptPage[];
  has_more: boolean;
  next_cursor: string | null;
}

// ----- Helpers -----

function richText(r?: { rich_text?: NotionRichText[] } | null): string {
  return (r?.rich_text ?? []).map((p) => p.plain_text).join('').trim();
}
function titleText(r?: { title?: NotionRichText[] } | null): string {
  return (r?.title ?? []).map((p) => p.plain_text).join('').trim();
}
function selectName(r?: { select: NotionSelect | null } | null): string | null {
  return r?.select?.name ?? null;
}

export interface ProposalContext {
  aiContext: string | null;
  link: string | null;
  amountUsd: number | null;
  closingSignal: string | null;
  lastUpdatedAt: string | null;
  hash: string | null;
}

export interface TranscriptSummary {
  pageId: string;
  url: string;
  lastEditedAt: string;
  title: string;
  company: string | null;
  interlocutor: string | null;
  pain: string | null;
  nextSteps: string | null;
  fecha: string | null;
  categoria: string | null;
  estado: string | null;
  fuente: string | null;
  region: string | null;
  proposal: ProposalContext;
}

export function summarizePage(page: NotionTranscriptPage): TranscriptSummary {
  const p = page.properties;
  const proposal: ProposalContext = {
    aiContext: richText(p['Propuesta (AI Context)']) || null,
    link: p['Link Propuesta']?.url ?? null,
    amountUsd: p['Monto Propuesta USD']?.number ?? null,
    closingSignal: selectName(p['Señales de Cierre']),
    lastUpdatedAt: p['Última Act. Propuesta']?.date?.start ?? null,
    hash: richText(p['Hash Propuesta']) || null,
  };
  return {
    pageId: page.id,
    url: page.url,
    lastEditedAt: page.last_edited_time,
    title: titleText(p.Nombre),
    company: richText(p['Empresa / Org']) || null,
    interlocutor: richText(p['Interlocutor Principal']) || null,
    pain: richText(p['Dolor / Contexto Principal']) || null,
    nextSteps: richText(p['Próximos Pasos']) || null,
    fecha: p.Fecha?.date?.start ?? null,
    categoria: selectName(p.Categoría),
    estado: selectName(p.Estado),
    fuente: selectName(p.Fuente),
    region: selectName(p['País / Región']),
    proposal,
  };
}

// ----- Queries -----

/**
 * Query the transcriptions database for pages edited after `since`.
 * Filters to Categoría = "Prospecto" so we don't sync internal/partner calls.
 */
export async function listUpdatedTranscripts(
  since: Date,
  limit = 50
): Promise<NotionTranscriptPage[]> {
  const dbId = getTranscriptsDbId();
  const all: NotionTranscriptPage[] = [];
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = {
      page_size: Math.min(limit - all.length, 100),
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
      filter: {
        and: [
          {
            timestamp: 'last_edited_time',
            last_edited_time: { on_or_after: since.toISOString() },
          },
          {
            property: 'Categoría',
            select: { equals: 'Prospecto' },
          },
        ],
      },
    };
    if (cursor) body.start_cursor = cursor;

    const res: QueryResponse = await notionFetch<QueryResponse>(
      `/databases/${dbId}/query`,
      { method: 'POST', body: JSON.stringify(body) }
    );
    all.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor && all.length < limit);

  return all;
}

/**
 * Fetch the full markdown-ish plaintext of a Notion page by walking its
 * block children. Returns a best-effort string to store as `transcript`.
 */
export async function getPagePlainText(pageId: string, maxBlocks = 400): Promise<string> {
  interface BlockChild {
    id: string;
    type: string;
    has_children: boolean;
    [key: string]: unknown;
  }
  interface BlocksResponse {
    results: BlockChild[];
    has_more: boolean;
    next_cursor: string | null;
  }

  const lines: string[] = [];
  let cursor: string | null = null;
  let count = 0;

  do {
    const qs = new URLSearchParams({ page_size: '100' });
    if (cursor) qs.set('start_cursor', cursor);
    const res: BlocksResponse = await notionFetch<BlocksResponse>(
      `/blocks/${pageId}/children?${qs.toString()}`
    );
    for (const block of res.results) {
      if (count++ >= maxBlocks) break;
      const b = block as unknown as Record<string, { rich_text?: NotionRichText[] }>;
      const payload = b[block.type];
      const rt = payload?.rich_text;
      if (rt && Array.isArray(rt) && rt.length > 0) {
        lines.push(rt.map((p) => p.plain_text).join(''));
      }
    }
    cursor = res.has_more && count < maxBlocks ? res.next_cursor : null;
  } while (cursor);

  return lines.join('\n').trim();
}
