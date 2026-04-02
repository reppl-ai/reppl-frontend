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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const FORCE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
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
      request<AnalyzeProductResponse>("/analyze-product", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    () => analyzeProductMock(payload)
  );
}

export function getDashboard(productId: string): Promise<DashboardResponse> {
  return resolveRequest(
    () => request<DashboardResponse>(`/products/${productId}/dashboard`),
    () => getDashboardMock(productId)
  );
}

export function getBrief(productId: string): Promise<DailyBrief | null> {
  return resolveRequest(
    () => request<DailyBrief | null>(`/brief?product_id=${encodeURIComponent(productId)}`),
    () => getBriefMock(productId)
  );
}

export function getSignals(productId: string, limit: number, page = 1): Promise<PaginatedResponse<SignalItem>> {
  return resolveRequest(
    () =>
      request<PaginatedResponse<SignalItem>>(
        `/signals?product_id=${encodeURIComponent(productId)}&limit=${limit}&page=${page}`
      ),
    () => getSignalsMock(productId, limit, page)
  );
}

export function getSuggestions(productId: string): Promise<PaginatedResponse<SuggestionItem>> {
  return resolveRequest(
    () => request<PaginatedResponse<SuggestionItem>>(`/suggestions?product_id=${encodeURIComponent(productId)}`),
    () => getSuggestionsMock(productId)
  );
}

export function scanNow(productId: string): Promise<DashboardResponse> {
  return resolveRequest(
    () =>
      request<DashboardResponse>(`/products/${productId}/scan-now`, {
        method: "POST",
      }),
    () => scanNowMock(productId)
  );
}

export function getIntegrationStatus(productId: string): Promise<IntegrationStatus> {
  return resolveRequest(
    () => request<IntegrationStatus>(`/integrations/status?product_id=${encodeURIComponent(productId)}`),
    () => getIntegrationStatusMock(productId)
  );
}

export function connectSlackWebhook(productId: string, webhookUrl: string): Promise<IntegrationStatus> {
  return resolveRequest(
    () =>
      request<IntegrationStatus>("/integrations/slack/connect", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, webhook_url: webhookUrl }),
      }),
    () => connectSlackWebhookMock(productId, webhookUrl)
  );
}
