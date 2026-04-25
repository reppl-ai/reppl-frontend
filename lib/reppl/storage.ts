import type {
  RepplCompany,
  RepplModuleId,
  RepplWorkspaceState,
} from "./types";
import { DEFAULT_EDGES, DEFAULT_NODE_POSITIONS } from "./layout";

const COMPANIES_KEY = "reppl_companies";
const WORKSPACE_KEY = "reppl_workspace_";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadCompanies(): RepplCompany[] {
  if (typeof window === "undefined") return [];
  return safeParse<RepplCompany[]>(localStorage.getItem(COMPANIES_KEY), []);
}

export function saveCompanies(list: RepplCompany[]): void {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(list));
}

export function addCompany(company: RepplCompany): void {
  const list = loadCompanies();
  saveCompanies([...list, company]);
}

export function updateCompany(id: string, patch: Partial<RepplCompany>): void {
  const list = loadCompanies().map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCompanies(list);
}

export function getCompany(id: string): RepplCompany | undefined {
  return loadCompanies().find((c) => c.id === id);
}

const defaultWorkspace = (): RepplWorkspaceState => ({
  positions: { ...DEFAULT_NODE_POSITIONS },
  connections: [...DEFAULT_EDGES],
  expanded: {
    decision: false,
    competitors: false,
    marketSignals: false,
    aiSearch: false,
    signal: false,
    actionable: false,
  },
});

export function loadWorkspace(companyId: string): RepplWorkspaceState {
  const key = WORKSPACE_KEY + companyId;
  if (typeof window === "undefined") return defaultWorkspace();
  const raw = localStorage.getItem(key);
  const parsed = safeParse<RepplWorkspaceState | null>(raw, null);
  if (!parsed) return defaultWorkspace();
  return {
    ...defaultWorkspace(),
    ...parsed,
    positions: { ...DEFAULT_NODE_POSITIONS, ...parsed.positions },
    connections: parsed.connections?.length ? parsed.connections : [...DEFAULT_EDGES],
  };
}

export function saveWorkspace(companyId: string, state: RepplWorkspaceState): void {
  localStorage.setItem(WORKSPACE_KEY + companyId, JSON.stringify(state));
}

export function resetWorkspaceLayout(companyId: string): RepplWorkspaceState {
  const s = defaultWorkspace();
  saveWorkspace(companyId, s);
  return s;
}

export function allModuleIds(): RepplModuleId[] {
  return ["decision", "competitors", "marketSignals", "aiSearch", "signal", "actionable"];
}
