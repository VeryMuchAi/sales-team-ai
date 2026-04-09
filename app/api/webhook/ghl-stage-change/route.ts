import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Stage → Workflow mapping from spec section 3.4
const STAGE_WORKFLOW_MAP: Record<string, string[]> = {
  'Prospect Identificado': ['prospect_intel'],
  'Demo Agendada': ['pre_call_brief'],
  'Demo Realizada': ['call_analyzer'],
  'Propuesta Requerida': ['proposal_generator'],
  'Propuesta Enviada': [],
  'Negociación': [],
  'Cerrado Ganado': ['contract_summary'],
  'Cerrado Perdido': [],
};

interface GhlStageChangePayload {
  source: 'ghl';
  eventType: 'stage_change';
  deal: {
    ghlOpportunityId: string;
    ghlContactId: string;
    currentStage: string;
    previousStage: string;
    pipeline: string;
    value: number;
    contact: {
      name: string;
      email: string;
      phone: string;
      company: string;
    };
    assignedUserId: string;
  };
  triggerWorkflows: string[];
  timestamp: string;
}

// In-memory dedup store: `opportunityId:stage:window` → timestamp
// Window is 5-minute bucket (floor to 5-min interval)
const dedupCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

function getDedupeKey(opportunityId: string, stage: string, timestamp: string): string {
  const ts = new Date(timestamp).getTime();
  const windowBucket = Math.floor(ts / DEDUP_WINDOW_MS);
  return `${opportunityId}:${stage}:${windowBucket}`;
}

// Simple in-process rate limiter: ip → [timestamps]
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  // --- Rate limiting: 60 req/min per IP ---
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests' },
      { status: 429 }
    );
  }

  // --- Auth: X-Api-Key header ---
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = process.env.SALES_AI_WEBHOOK_KEY;

  if (!expectedKey) {
    console.error('[ghl-stage-change] SALES_AI_WEBHOOK_KEY not configured');
    return NextResponse.json({ error: 'server_misconfiguration' }, { status: 500 });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // --- Parse body ---
  let body: GhlStageChangePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { deal, timestamp } = body;

  if (!deal?.ghlOpportunityId || !deal?.currentStage || !timestamp) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'deal.ghlOpportunityId, deal.currentStage, and timestamp are required' },
      { status: 400 }
    );
  }

  // --- Dedup: opportunityId + stage + 5-min window ---
  const dedupKey = getDedupeKey(deal.ghlOpportunityId, deal.currentStage, timestamp);
  if (dedupCache.has(dedupKey)) {
    return NextResponse.json(
      { status: 'duplicate', message: 'Event already processed within dedup window' },
      { status: 200 }
    );
  }
  dedupCache.set(dedupKey, Date.now());

  // Cleanup old dedup keys every 100 entries to avoid unbounded growth
  if (dedupCache.size > 1000) {
    const cutoff = Date.now() - DEDUP_WINDOW_MS;
    for (const [key, ts] of dedupCache.entries()) {
      if (ts < cutoff) dedupCache.delete(key);
    }
  }

  // --- Stage → Workflow lookup ---
  const triggeredWorkflows = STAGE_WORKFLOW_MAP[deal.currentStage];

  if (triggeredWorkflows === undefined) {
    // Stage not in mapping — log and return 400
    console.warn('[ghl-stage-change] Unmapped stage:', deal.currentStage);
    return NextResponse.json(
      { error: 'invalid_stage', message: `Stage "${deal.currentStage}" not mapped to any workflow` },
      { status: 400 }
    );
  }

  // Log event
  console.log('[ghl-stage-change] Received:', {
    opportunityId: deal.ghlOpportunityId,
    stage: deal.currentStage,
    previousStage: deal.previousStage,
    triggeredWorkflows,
  });

  // Generate a workflow run ID for traceability
  const workflowId = `wf_${Date.now()}_${deal.ghlOpportunityId.slice(0, 8)}`;

  // --- Trigger workflows asynchronously (fire and forget) ---
  // Workflows are handled by the respective agent endpoints.
  // We accept immediately and process async to stay within webhook timeout.
  if (triggeredWorkflows.length > 0) {
    triggerWorkflowsAsync(deal, triggeredWorkflows, workflowId).catch((err) => {
      console.error('[ghl-stage-change] Async workflow trigger error:', err);
    });
  }

  return NextResponse.json({
    status: 'accepted',
    workflowId,
    triggeredWorkflows,
  });
}

async function triggerWorkflowsAsync(
  deal: GhlStageChangePayload['deal'],
  workflows: string[],
  workflowId: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sales-intelligence.verymuch.ai';

  for (const workflowType of workflows) {
    try {
      const endpoint = getWorkflowEndpoint(workflowType, baseUrl);
      if (!endpoint) {
        console.warn(`[ghl-stage-change] No endpoint for workflow: ${workflowType}`);
        continue;
      }

      // Build context payload for the agent
      const payload = buildWorkflowPayload(workflowType, deal, workflowId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        console.error(`[ghl-stage-change] Workflow ${workflowType} failed:`, response.status);
      } else {
        console.log(`[ghl-stage-change] Workflow ${workflowType} triggered successfully`);
      }
    } catch (err) {
      console.error(`[ghl-stage-change] Error triggering workflow ${workflowType}:`, err);
    }
  }
}

function getWorkflowEndpoint(workflowType: string, baseUrl: string): string | null {
  const endpointMap: Record<string, string> = {
    prospect_intel: `${baseUrl}/api/agents/prospect-intel`,
    pre_call_brief: `${baseUrl}/api/agents/pre-call-brief`,
    call_analyzer: `${baseUrl}/api/agents/call-analyzer`,
    proposal_generator: `${baseUrl}/api/agents/proposal-generator`,
    contract_summary: `${baseUrl}/api/agents/coordinator`,
  };
  return endpointMap[workflowType] ?? null;
}

function buildWorkflowPayload(
  workflowType: string,
  deal: GhlStageChangePayload['deal'],
  workflowId: string
): Record<string, unknown> {
  const base = {
    company_name: deal.contact.company,
    additional_context: `GHL Stage Change: ${deal.previousStage} → ${deal.currentStage}. Pipeline: ${deal.pipeline}. Deal value: $${deal.value}. Contact: ${deal.contact.name} (${deal.contact.email}). Workflow ID: ${workflowId}`,
    ghl_opportunity_id: deal.ghlOpportunityId,
    ghl_contact_id: deal.ghlContactId,
    contact_name: deal.contact.name,
    contact_email: deal.contact.email,
    contact_title: '',
    source: 'ghl_stage_change',
    workflow_id: workflowId,
  };

  if (workflowType === 'contract_summary') {
    return { ...base, action: 'synthesize' };
  }

  return base;
}
