/**
 * Tipos compartidos del Verymuch.ai Hub.
 * Corresponden 1:1 con las tablas en supabase/migrations/20260422_hub_and_okrs.sql.
 */

export type ClaudeExperience = 'yes' | 'no' | 'learning';

export type ApplicationRecommendation =
  | 'auto_advance'
  | 'human_review'
  | 'polite_reject';

export type ApplicationStatus =
  | 'pending_review'
  | 'ready_for_interview'
  | 'human_review'
  | 'polite_rejected'
  | 'accepted_pending_setup'
  | 'active_in_certification'
  | 'certification_in_progress'
  | 'certified'
  | 'available_for_projects'
  | 'engaged_with_client'
  | 'inactive'
  | 'withdrawn';

export type ExamResult = 'pass' | 'fail' | 'not_taken';

export type EmailTier = 'workspace' | 'zoho_lite' | 'external';

export type LegalDocumentType = 'talent_agreement' | 'nda' | 'amendment';

/** Breakdown estructurado devuelto por el evaluador de Claude. */
export interface ScoreBreakdown {
  claude_mcp_experience: number;    // 0-30
  technical_stack: number;           // 0-20
  bilingual: number;                 // 0-15
  communication_clarity: number;     // 0-15
  portfolio_quality: number;         // 0-10
  icp_alignment: number;             // 0-10
  notes: string;
  red_flags: string[];
}

export interface HubApplication {
  id: string;

  full_name: string;
  email: string;
  linkedin_url: string;
  country: string;
  city: string;

  languages: string[];
  stack: string[];
  years_with_llms: number | null;
  claude_experience: ClaudeExperience;
  portfolio_url: string | null;

  weekly_hours_min: number | null;
  weekly_hours_max: number | null;
  hourly_rate_min_usd: number | null;
  hourly_rate_max_usd: number | null;

  summary: string;
  referral_source: string;
  referral_details: string | null;

  score: number | null;
  score_breakdown: ScoreBreakdown | null;
  recommendation: ApplicationRecommendation | null;
  evaluated_at: string | null;
  evaluated_by_model: string | null;

  status: ApplicationStatus;
  admin_notes: string | null;
  source_ip: string | null;
  user_agent: string | null;

  created_at: string;
  updated_at: string;
}

export interface TalentProfile {
  id: string;
  application_id: string;

  assigned_email: string | null;
  email_tier: EmailTier | null;

  is_core_team: boolean;
  is_strategic_partner: boolean;

  onboarding_token: string | null;
  onboarding_token_expires_at: string | null;
  onboarding_completed_at: string | null;

  exam_scheduled_at: string | null;
  exam_result: ExamResult;
  exam_score: number | null;
  exam_date: string | null;
  credential_storage_path: string | null;

  assigned_projects: string[];
  internal_notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface TalentCertification {
  id: string;
  talent_profile_id: string;
  course_slug: string;
  course_name: string;
  completed: boolean;
  completed_at: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface LegalDocumentRecord {
  id: string;
  talent_profile_id: string;
  document_type: LegalDocumentType;
  version: string;
  effective_date: string;
  storage_path: string;
  checksum: string;
  signed_at: string;
  signed_name: string;
  signed_ip: string;
  signed_user_agent: string | null;
  created_at: string;
}

/** Retorno de get_hub_metrics() */
export interface HubMetrics {
  total: number;
  pending_review: number;
  ready_for_interview: number;
  human_review: number;
  accepted_pending_setup: number;
  active_in_certification: number;
  certification_in_progress: number;
  certified: number;
  available: number;
  engaged: number;
}

/** 13 cursos del Claude Certified Architect (Anthropic Academy). */
export const CCA_COURSES = [
  { slug: 'intro-claude', name: 'Introduction to Claude' },
  { slug: 'prompt-engineering', name: 'Prompt Engineering' },
  { slug: 'tool-use', name: 'Tool Use Fundamentals' },
  { slug: 'agents-basics', name: 'Agents Basics' },
  { slug: 'mcp-fundamentals', name: 'MCP Fundamentals' },
  { slug: 'mcp-advanced', name: 'MCP Advanced Patterns' },
  { slug: 'claude-code', name: 'Claude Code in Depth' },
  { slug: 'multi-agent', name: 'Multi-Agent Orchestration' },
  { slug: 'evals', name: 'Evals and Observability' },
  { slug: 'production', name: 'Productionizing Claude Apps' },
  { slug: 'safety', name: 'Safety and Guardrails' },
  { slug: 'enterprise', name: 'Enterprise Integration' },
  { slug: 'capstone', name: 'Capstone Project' },
] as const satisfies ReadonlyArray<{ slug: string; name: string }>;

export type CCACourseSlug = (typeof CCA_COURSES)[number]['slug'];
