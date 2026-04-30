/**
 * Notion fetcher for the Call Intelligence dashboard.
 *
 * Talks to the same internal integration as lib/integrations/notion.ts but
 * targets the full calls/transcripts database (no Categoría filter — we need
 * ALL records to compute the dashboard splits).
 */

import { type NotionTranscriptPage, summarizePage, type TranscriptSummary } from '@/lib/integrations/notion';

const NOTION_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const DEFAULT_DB_ID = '7118d3d2-3f33-4dd7-983c-f3dde54c83d6';

export class NotionCallsError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'NotionCallsError';
  }
}

function getToken(): string {
  const t = process.env.NOTION_TOKEN;
  if (!t) throw new Error('NOTION_TOKEN not configured');
  return t;
}

export function getCallsDbId(): string {
  return process.env.NOTION_CALLS_DB_ID || process.env.NOTION_TRANSCRIPTS_DB_ID || DEFAULT_DB_ID;
}

interface QueryResponse {
  results: NotionTranscriptPage[];
  has_more: boolean;
  next_cursor: string | null;
}

/**
 * Fetch every page in the calls database, sorted by Fecha descending.
 * Pagination is exhaustive (loops until has_more=false) because the dashboard
 * is computed across the full history.
 */
export async function fetchAllCalls(): Promise<TranscriptSummary[]> {
  const dbId = getCallsDbId();
  const all: NotionTranscriptPage[] = [];
  let cursor: string | null = null;
  let safety = 0;

  do {
    const body: Record<string, unknown> = {
      page_size: 100,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`${NOTION_BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new NotionCallsError(res.status, `Notion ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as QueryResponse;
    all.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;

    if (++safety > 50) {
      throw new NotionCallsError(500, 'Pagination safety limit hit (>5,000 records)');
    }
  } while (cursor);

  return all.map(summarizePage);
}
