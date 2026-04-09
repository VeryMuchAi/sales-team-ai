import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 15-minute revalidation cache
export const revalidate = 900;

const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL ?? 'http://127.0.0.1:3100';
const PAPERCLIP_COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID;
const PAPERCLIP_API_KEY = process.env.PAPERCLIP_DASHBOARD_API_KEY;

// Q2 2026 goal ID — sourced from Paperclip project config
const Q2_GOAL_ID = process.env.PAPERCLIP_Q2_GOAL_ID ?? '75eff205-131b-4ed2-afb3-9c2a5fab5653';

/**
 * GET /api/paperclip/goals
 *
 * Returns Q2 goals progress by fetching issues linked to the Q2 goal and
 * computing done/total counts per goal.
 *
 * Query params:
 *   - goalId: override the default Q2 goal ID
 */
export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl;
  const goalId = searchParams.get('goalId') ?? Q2_GOAL_ID;

  try {
    // Fetch all issues for this goal across all statuses
    const params = new URLSearchParams({ goalId });
    const upstreamUrl = `${PAPERCLIP_API_URL}/api/companies/${PAPERCLIP_COMPANY_ID}/issues?${params.toString()}`;

    const res = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${PAPERCLIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[paperclip/goals] Upstream error:', res.status, text);
      return NextResponse.json(
        { error: 'upstream_error', message: `Paperclip returned ${res.status}` },
        { status: res.status }
      );
    }

    const issues: Array<{
      id: string;
      identifier: string;
      title: string;
      status: string;
      priority: string;
      assigneeAgentId: string | null;
    }> = await res.json();

    // Compute progress summary
    const total = issues.length;
    const done = issues.filter((i) => i.status === 'done').length;
    const inProgress = issues.filter((i) => i.status === 'in_progress').length;
    const blocked = issues.filter((i) => i.status === 'blocked').length;
    const todo = issues.filter((i) => i.status === 'todo' || i.status === 'backlog').length;
    const cancelled = issues.filter((i) => i.status === 'cancelled').length;

    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

    return NextResponse.json(
      {
        goalId,
        summary: {
          total,
          done,
          inProgress,
          blocked,
          todo,
          cancelled,
          progressPct,
        },
        issues,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.error('[paperclip/goals] Fetch error:', err);
    return NextResponse.json(
      { error: 'fetch_error', message: 'Could not reach Paperclip API' },
      { status: 502 }
    );
  }
}
