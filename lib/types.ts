export interface ICP {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  industry: string[];
  company_size_min: number | null;
  company_size_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  job_titles: string[];
  locations: string[];
  technologies: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
export type LeadSource = 'ai_generated' | 'manual' | 'imported';

export interface Lead {
  id: string;
  user_id: string;
  icp_id: string | null;
  company_name: string;
  company_website: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_revenue: string | null;
  company_location: string | null;
  company_description: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_linkedin: string | null;
  ai_score: number | null;
  ai_score_reasons: ScoreReason[] | null;
  status: LeadStatus;
  source: LeadSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreReason {
  factor: string;
  score: number;
  explanation: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}
