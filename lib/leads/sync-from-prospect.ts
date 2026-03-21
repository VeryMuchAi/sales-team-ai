import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProspectIntelResult } from '@/lib/agents/prospect-intel';
import type { LeadStatus } from '@/lib/types';

export function mapPriorityToLeadStatus(priority: string | null | undefined): LeadStatus {
  switch (priority) {
    case 'HOT':
      return 'qualified';
    case 'WARM':
      return 'new';
    case 'COLD':
      return 'unqualified';
    default:
      return 'new';
  }
}

function getProfileString(obj: Record<string, unknown> | undefined, key: string): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const v = obj[key];
  if (v === undefined || v === null) return null;
  return String(v);
}

/**
 * After Prospect Intel + Pre-Call Brief completes, upsert a lead linked to the prospect.
 */
export async function upsertLeadFromProspectIntel(
  supabase: SupabaseClient,
  input: {
    userId: string;
    prospectId: string;
    companyName: string;
    websiteUrl?: string | null;
    linkedinUrl?: string | null;
    intel: ProspectIntelResult | null;
    intelRaw: string;
  }
): Promise<{ leadId: string; created: boolean } | { error: string }> {
  let intel = input.intel;
  if (!intel) {
    try {
      const m = input.intelRaw.match(/\{[\s\S]*\}/);
      if (m) intel = JSON.parse(m[0]) as ProspectIntelResult;
    } catch {
      intel = null;
    }
  }

  const companyName = input.companyName.trim();
  const pp = intel?.prospect_profile as Record<string, unknown> | undefined;
  const cp = intel?.company_profile as Record<string, unknown> | undefined;

  const contactName = getProfileString(pp, 'name') ?? getProfileString(pp, 'nombre');
  const contactTitle = getProfileString(pp, 'role') ?? getProfileString(pp, 'cargo');
  const sector = getProfileString(cp, 'sector');
  const estimatedEmployees = getProfileString(cp, 'estimated_employees');
  const productsServices = getProfileString(cp, 'products_services');
  const icpFit = intel?.icp_fit_score ?? null;
  const aiScore =
    icpFit != null ? Math.min(100, Math.max(0, Math.round(Number(icpFit) * 10))) : null;

  const priority = intel?.priority ?? null;
  const status = mapPriorityToLeadStatus(priority);

  const ai_score_reasons = intel
    ? {
        icp_justification: intel.icp_justification,
        priority: intel.priority,
        likely_pains: intel.likely_pains,
        red_flags: intel.red_flags,
        buyer_persona_match: intel.buyer_persona_match,
      }
    : { parse_note: 'Prospect intel JSON unavailable' };

  const notes =
    typeof intel?.evidence_notes === 'string'
      ? intel.evidence_notes
      : intel?.evidence_notes != null
        ? JSON.stringify(intel.evidence_notes)
        : null;

  const { data: existing, error: findErr } = await supabase
    .from('leads')
    .select('id')
    .eq('prospect_id', input.prospectId)
    .maybeSingle();

  if (findErr) {
    console.error('upsertLead find error:', findErr);
    return { error: findErr.message };
  }

  const payloadBase = {
    company_name: companyName,
    company_website: input.websiteUrl ?? null,
    company_industry: sector,
    company_size: estimatedEmployees,
    company_description: productsServices,
    contact_name: contactName,
    contact_title: contactTitle,
    contact_linkedin: input.linkedinUrl ?? null,
    ai_score: aiScore,
    ai_score_reasons,
    status,
    source: 'ai_generated' as const,
    notes,
    prospect_id: input.prospectId,
  };

  if (existing?.id) {
    // No tocar user_id: conservar al creador original del lead
    const { error: upErr } = await supabase.from('leads').update(payloadBase).eq('id', existing.id);
    if (upErr) {
      console.error('upsertLead update error:', upErr);
      return { error: upErr.message };
    }
    return { leadId: existing.id, created: false };
  }

  const { data: inserted, error: insErr } = await supabase
    .from('leads')
    .insert({
      ...payloadBase,
      user_id: input.userId,
    })
    .select('id')
    .single();

  if (insErr || !inserted) {
    console.error('upsertLead insert error:', insErr);
    return { error: insErr?.message ?? 'insert failed' };
  }

  return { leadId: inserted.id, created: true };
}
