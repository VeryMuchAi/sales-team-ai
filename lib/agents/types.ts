export type SalesStage =
  | 'research'
  | 'brief'
  | 'call_analyzed'
  | 'proposal';

/** Parsed Prospect Intel (subset used by coordinator / UI) */
export interface ProspectIntelScores {
  icp_fit_score?: number;
  timing_score?: number;
  priority?: 'HOT' | 'WARM' | 'COLD';
}

export interface CoordinatorState {
  prospect_name: string | null;
  company: string | null;
  stage: SalesStage;
  accumulated_context: string;
  prospect_intel?: ProspectIntelScores | null;
}

export interface ProspectIntelInput {
  company_name: string;
  linkedin_url?: string;
  linkedin_text?: string;
  website_url?: string;
  website_text?: string;
  contact_name?: string;
  contact_title?: string;
  notes?: string;
  /** Fetched website content from server */
  website_content_preview?: string;
  /** Contexto del equipo comercial (reunión pedida, referido, ARRI, etc.) */
  additional_context?: string;
  /** Si el equipo indica que el prospecto solicitó la reunión/llamada */
  prospect_requested_call_hint?: boolean;
  /** Documento PDF del prospecto (presentación, diagrama, etc.) en base64 */
  document_base64?: string;
}

export interface PreCallBriefInput {
  prospect_intel_json: string;
  company_name: string;
  additional_context?: string;
  /** Documento PDF del prospecto en base64 (para extraer contexto adicional) */
  document_base64?: string;
}

export interface CallAnalyzerInput {
  transcript: string;
  prospect_intel_json: string;
  pre_call_brief: string;
  company_name: string;
  additional_context?: string;
  /** Objeciones, comentarios y aprendizajes del equipo (markdown) */
  sales_interaction_notes?: string;
}

export type ProposalCurrency = 'USD' | 'EUR' | 'MXN' | 'COP';

export interface ProposalGeneratorInput {
  prospect_intel_json: string;
  pre_call_brief: string;
  call_analysis: string;
  company_name: string;
  contact_name?: string;
  language?: 'es' | 'en';
  currency?: ProposalCurrency;
  additional_context?: string;
  /** Objeciones, comentarios y aprendizajes del equipo (markdown) */
  sales_interaction_notes?: string;
  /** Documento PDF del cliente (presentación, diagrama, etc.) en base64 */
  document_base64?: string;
  /** Feedback del equipo para regenerar/mejorar la propuesta */
  improvement_feedback?: string;
}

export interface CoordinatorOrchestratorInput {
  action: 'route' | 'synthesize';
  user_input?: string;
  state_json?: CoordinatorState;
  prospect_intel_json?: string;
  pre_call_brief?: string;
  call_analysis?: string;
  proposal_draft?: string;
  company_name?: string;
  additional_context?: string;
}
