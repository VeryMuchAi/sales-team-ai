import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 15-minute revalidation cache
export const revalidate = 900;

const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL ?? 'http://127.0.0.1:3100';
const PAPERCLIP_COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID;
const PAPERCLIP_API_KEY = process.env.PAPERCLIP_DASHBOARD_API_KEY;

interface PaperclipAgent {
  id: string;
  name: string;
  role: string;
  title: string | null;
  status: string;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  pausedAt: string | null;
  lastHeartbeatAt: string | null;
  adapterType: string;
}

interface AgentWithUtilization extends PaperclipAgent {
  utilizationPct: number;
}

/**
 * GET /api/paperclip/agents
 *
 * Returns agents list with utilization (spentMonthlyCents / budgetMonthlyCents).
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

  const upstreamUrl = `${PAPERCLIP_API_URL}/api/companies/${PAPERCLIP_COMPANY_ID}/agents`;

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
      console.error('[paperclip/agents] Upstream error:', res.status, text);
      return NextResponse.json(
        { error: 'upstream_error', message: `Paperclip returned ${res.status}` },
        { status: res.status }
      );
    }

    const agents: PaperclipAgent[] = await res.json();

    // Enrich with utilization percentage
    const enriched: AgentWithUtilization[] = agents.map((agent) => ({
      ...agent,
      utilizationPct:
        agent.budgetMonthlyCents > 0
          ? Math.round((agent.spentMonthlyCents / agent.budgetMonthlyCents) * 100)
          : 0,
    }));

    return NextResponse.json(enriched, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('[paperclip/agents] Fetch error:', err);
    return NextResponse.json(
      { error: 'fetch_error', message: 'Could not reach Paperclip API' },
      { status: 502 }
    );
  }
}
