import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 15-minute revalidation cache
export const revalidate = 900;

const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL ?? 'http://127.0.0.1:3100';
const PAPERCLIP_COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID;
const PAPERCLIP_API_KEY = process.env.PAPERCLIP_DASHBOARD_API_KEY;

/**
 * GET /api/paperclip/dashboard
 *
 * Proxy to Paperclip company dashboard endpoint.
 * Returns a snapshot: issue counts by status, agent summary, recent activity, goal progress.
 * Cached for 15 minutes.
 */
export async function GET() {
  if (!PAPERCLIP_API_KEY) {
    return NextResponse.json(
      { error: 'server_misconfiguration', message: 'PAPERCLIP_DASHBOARD_API_KEY not configured' },
      { status: 500 }
    );
  }

  if (!PAPERCLIP_COMPANY_ID) {
    return NextResponse.json(
      { error: 'server_misconfiguration', message: 'PAPERCLIP_COMPANY_ID not configured' },
      { status: 500 }
    );
  }

  const upstreamUrl = `${PAPERCLIP_API_URL}/api/companies/${PAPERCLIP_COMPANY_ID}/dashboard`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${PAPERCLIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[paperclip/dashboard] Upstream error:', res.status, text);
      return NextResponse.json(
        { error: 'upstream_error', message: `Paperclip returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('[paperclip/dashboard] Fetch error:', err);
    return NextResponse.json(
      { error: 'fetch_error', message: 'Could not reach Paperclip API' },
      { status: 502 }
    );
  }
}
