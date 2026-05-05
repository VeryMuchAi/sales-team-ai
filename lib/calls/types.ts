/**
 * Call Intelligence types — shape of the data flowing from Notion → API → UI.
 *
 * The Notion DB used here is the "Transcripciones & Notas de Llamadas" base
 * (id env: NOTION_CALLS_DB_ID, default 7118d3d2-3f33-4dd7-983c-f3dde54c83d6).
 */

export type DisplayCategory =
  | 'Prospecto'
  | 'Talento'
  | 'Socio'
  | 'Diego'
  | 'Interna'
  | 'Proveedor'
  | 'Consejo'
  | 'Sin categoría';

export type SignalLevel = 'hot' | 'warm' | 'none';

export interface CategorySlice {
  name: DisplayCategory;
  count: number;
  percentage: number;
}

export interface ProspectPipelineRow {
  company: string;
  contact: string;
  sessions: number;
  status: string | null;
  pain: string | null;
  country: string | null;
  signal: string | null;
  signalLevel: SignalLevel;
  proposalAmount: number | null;
  lastEditedAt: string;
  notionUrl: string;
}

export interface TalentPipelineRow {
  name: string;
  country: string | null;
  specialty: string | null;
  status: string | null;
  lastEditedAt: string;
  notionUrl: string;
}

export interface GeographySlice {
  country: string;
  count: number;
  percentage: number;
}

export interface GeoStackedRow {
  country: string;
  prospects: number;
  talent: number;
  diego: number;
  total: number;
}

export interface PipelineStatusSlice {
  status: string;
  count: number;
}

export interface CallStats {
  totalCalls: number;
  callsPerWeek: number;
  totalProspects: number;
  uniqueCompanies: number;

  dateRange: { start: string | null; end: string | null };
  totalWeeks: number;

  categories: CategorySlice[];

  internalCalls: number;
  externalCalls: number;
  internalPercentage: number;
  externalPercentage: number;

  prospectPipeline: ProspectPipelineRow[];
  talentPipeline: TalentPipelineRow[];

  geography: GeographySlice[];
  geoByType: GeoStackedRow[];

  pipelineByStatus: PipelineStatusSlice[];

  hotLeads: number;
  warmLeads: number;

  generatedAt: string;
}
