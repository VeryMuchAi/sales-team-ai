import { NextResponse } from 'next/server';
import { fetchAllCalls, NotionCallsError } from '@/lib/calls/notion-calls';
import { computeCallStats } from '@/lib/calls/compute-stats';

export const runtime = 'nodejs';
// 15-minute ISR — same cadence as Paperclip dashboard endpoints.
export const revalidate = 900;

/**
 * GET /api/calls/stats
 *
 * Fetches every page from the Notion calls DB, derives KPIs and pipeline
 * snapshots, and returns the CallStats JSON. Cached 15 min.
 *
 * Both the dashboard page and external consumers (n8n, scripts) can read this.
 */
export async function GET() {
  try {
    const records = await fetchAllCalls();
    const stats = computeCallStats(records);
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    if (err instanceof NotionCallsError) {
      console.error('[calls/stats] Notion error:', err.status, err.message);
      return NextResponse.json(
        { error: 'notion_error', message: err.message },
        { status: err.status === 401 ? 401 : 502 },
      );
    }
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[calls/stats] Error:', msg);
    return NextResponse.json(
      { error: 'server_error', message: msg },
      { status: 500 },
    );
  }
}
