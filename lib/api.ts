import type {
  AnalyzeProductPayload,
  AnalyzeProductResponse,
  DailyBrief,
  DashboardResponse,
  IntegrationStatus,
  PaginatedResponse,
  SignalItem,
  SuggestionItem,
} from "./types";
import type { RepplCompany, RepplWorkspaceState } from "./reppl/types";
import {
  analyzeProductMock,
  connectSlackWebhookMock,
  getBriefMock,
  getDashboardMock,
  getIntegrationStatusMock,
  getSignalsMock,
  getSuggestionsMock,
  scanNowMock,
} from "./mockApi";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_ORIGIN = RAW_API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "").replace(/\/api$/, "");
const API_V1_BASE_URL = `${API_ORIGIN}/api/v1`;
const FORCE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: unknown;
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function persistAuth(data: TokenResponse): TokenResponse {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("token", data.access_token);
    window.localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

async function parseError(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  const raw = await response.text();
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw);
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item: { msg?: string }) => item?.msg ?? "Invalid input").join("; ");
    }
    return data.message ?? fallback;
  } catch {
    return raw;
  }
}

async function request<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  const { auth = true, headers, ...rest } = init ?? {};
  const response = await fetch(`${API_V1_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(auth ? authHeaders() : {}), ...headers },
    cache: "no-store",
    credentials: "include",
    ...rest,
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function refreshAccessToken(): Promise<TokenResponse> {
  const response = await fetch(`${API_V1_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
    }
    throw new ApiError(await parseError(response), response.status);
  }
  return persistAuth((await response.json()) as TokenResponse);
}

async function authedRequest<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (error) {
    if (init?.auth === false || !(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
    await refreshAccessToken();
    return request<T>(path, init);
  }
}

function shouldFallbackToMock(error: unknown): boolean {
  if (FORCE_MOCK_API) return true;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("failed to fetch") || message.includes("fetch failed") || message.includes("networkerror");
}

async function resolveRequest<T>(liveCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  if (FORCE_MOCK_API) {
    return mockCall();
  }
  try {
    return await liveCall();
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      return mockCall();
    }
    throw error;
  }
}

export function analyzeProduct(payload: AnalyzeProductPayload): Promise<AnalyzeProductResponse> {
  return resolveRequest(
    () =>
      authedRequest<AnalyzeProductResponse>("/analyze-product", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    () => analyzeProductMock(payload)
  );
}

export function getDashboard(productId: string): Promise<DashboardResponse> {
  return resolveRequest(
    () => authedRequest<DashboardResponse>(`/products/${productId}/dashboard`),
    () => getDashboardMock(productId)
  );
}

export function getBrief(productId: string): Promise<DailyBrief | null> {
  return resolveRequest(
    () => authedRequest<DailyBrief | null>(`/brief?product_id=${encodeURIComponent(productId)}`),
    () => getBriefMock(productId)
  );
}

export function getSignals(productId: string, limit: number, page = 1): Promise<PaginatedResponse<SignalItem>> {
  return resolveRequest(
    () =>
      authedRequest<PaginatedResponse<SignalItem>>(
        `/signals?product_id=${encodeURIComponent(productId)}&limit=${limit}&page=${page}`
      ),
    () => getSignalsMock(productId, limit, page)
  );
}

export function getSuggestions(productId: string): Promise<PaginatedResponse<SuggestionItem>> {
  return resolveRequest(
    () => authedRequest<PaginatedResponse<SuggestionItem>>(`/suggestions?product_id=${encodeURIComponent(productId)}`),
    () => getSuggestionsMock(productId)
  );
}

export function scanNow(productId: string): Promise<DashboardResponse> {
  return resolveRequest(
    () =>
      authedRequest<DashboardResponse>(`/products/${productId}/scan-now`, {
        method: "POST",
      }),
    () => scanNowMock(productId)
  );
}

export function getIntegrationStatus(productId: string): Promise<IntegrationStatus> {
  return resolveRequest(
    () => authedRequest<IntegrationStatus>(`/integrations/status?product_id=${encodeURIComponent(productId)}`),
    () => getIntegrationStatusMock(productId)
  );
}

export function connectSlackWebhook(productId: string, webhookUrl: string): Promise<IntegrationStatus> {
  return resolveRequest(
    () =>
      authedRequest<IntegrationStatus>("/integrations/slack/connect", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, webhook_url: webhookUrl }),
      }),
    () => connectSlackWebhookMock(productId, webhookUrl)
  );
}

export function signup(payload: {
  email: string;
  password: string;
  name: string;
  brand_name: string;
  timezone: string;
  brief_time: string;
}) {
  return request<TokenResponse>("/auth/signup", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  }).then(persistAuth);
}

export function login(payload: { email: string; password: string }) {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  }).then(persistAuth);
}

export function joinWaitlist(payload: {
  email: string;
  companyName: string;
  businessArea: string;
  companySize: string;
  website?: string;
}) {
  return request<{ id: string; success: boolean; message: string }>("/waitlist", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function listCompanies(): Promise<RepplCompany[]> {
  return authedRequest<RepplCompany[]>("/companies");
}

export function createCompany(payload: Omit<RepplCompany, "id" | "lastAnalysisAt" | "createdAt">): Promise<RepplCompany> {
  return authedRequest<RepplCompany>("/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCompany(companyId: string): Promise<RepplCompany> {
  return authedRequest<RepplCompany>(`/companies/${companyId}/card`);
}

export async function patchCompany(companyId: string, payload: Partial<RepplCompany>): Promise<RepplCompany> {
  await authedRequest<unknown>(`/companies/${companyId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return getCompany(companyId);
}

export function loadCompanyWorkspace(companyId: string): Promise<RepplWorkspaceState> {
  return authedRequest<RepplWorkspaceState>(`/companies/${companyId}/workspace`);
}

export function saveCompanyWorkspace(companyId: string, state: RepplWorkspaceState): Promise<RepplWorkspaceState> {
  return authedRequest<RepplWorkspaceState>(`/companies/${companyId}/workspace`, {
    method: "PUT",
    body: JSON.stringify(state),
  });
}
