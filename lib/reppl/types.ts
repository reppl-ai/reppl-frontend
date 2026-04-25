export type RepplModuleId = "decision" | "competitors" | "marketSignals" | "aiSearch" | "signal" | "actionable";

export const REPPL_SECTORS = [
  "D2C",
  "E-commerce",
  "CPG",
  "Supplements",
  "Skincare",
  "Grooming",
  "Pet Food",
  "Other",
] as const;

export type RepplSector = (typeof REPPL_SECTORS)[number];

export const REPPL_TAG_OPTIONS = ["SUPPLEMENTS", "SKINCARE", "GROOMING"] as const;
export type RepplTag = (typeof REPPL_TAG_OPTIONS)[number];

export interface RepplCompany {
  id: string;
  name: string;
  website: string;
  sector: RepplSector;
  tags: RepplTag[];
  description: string;
  lastAnalysisAt: string | null;
  createdAt: string;
}

export interface RepplNodePosition {
  x: number;
  y: number;
}

export type RepplEdge = [RepplModuleId, RepplModuleId];

export interface RepplWorkspaceState {
  positions: Record<RepplModuleId, RepplNodePosition>;
  connections: RepplEdge[];
  expanded: Partial<Record<RepplModuleId, boolean>>;
}

export interface RepplAnalysisMock {
  primaryIssue: string;
  why: [string, string, string];
  direction: [string, string, string];
  optionsConsidered: { text: string; selected: boolean }[];
  discoverability: "HIGH" | "MEDIUM" | "LOW";
  aiReason: [string, string];
}

export interface RepplCompetitorMock {
  id: string;
  name: string;
  url: string;
  price: string;
  offers: string;
  lastScanHours: number;
}

export interface RepplProductOverlayState {
  open: boolean;
  competitorId: string | null;
}
