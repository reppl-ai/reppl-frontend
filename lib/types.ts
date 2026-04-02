export type ExtractionStatus = "pending" | "completed" | "failed" | "blocked";
export type SignalSeverity = "high" | "medium" | "low";
export type OpportunityUrgency = "immediate" | "this_week" | "next_month";

export interface AnalyzeProductPayload {
  product_url: string;
  founder_email?: string;
  slack_webhook_url?: string;
  timezone: string;
  brief_time: string;
}

export interface AnalyzeProductResponse {
  product_id: string;
  progress_text: string;
}

export interface ProductSummary {
  id: string;
  product_url: string;
  product_name: string | null;
  brand: string | null;
  category: string | null;
  current_price: number | null;
  currency: string;
  founder_email: string | null;
  slack_webhook_url: string | null;
  timezone: string;
  brief_time: string;
  analysis_status: string;
  discovery_status: string;
  last_scanned_at: string | null;
}

export interface OfferItem {
  type: string;
  summary: string;
  value: string | number | null;
  code: string | null;
}

export interface SignalItem {
  id: string;
  competitor_id: string;
  product_id: string;
  competitor_name: string;
  signal_type: string;
  headline: string;
  severity: SignalSeverity;
  old_value: string | null;
  new_value: string | null;
  detail: string;
  opportunity: string | null;
  timestamp: string;
}

export interface BriefSignalItem {
  competitor_name: string;
  signal_type: string;
  headline: string;
  detail: string;
  severity: SignalSeverity;
  old_value: string;
  new_value: string;
  opportunity: string;
}

export interface ThreatItem {
  description: string;
  triggered_by: string;
  urgency: "immediate" | "this_week" | "monitor";
}

export interface OpportunityItem {
  description: string;
  reason: string;
  action: string;
  urgency: OpportunityUrgency;
}

export interface DailyBrief {
  id: string;
  product_id: string;
  brief_date: string;
  signals: BriefSignalItem[];
  patterns: string[];
  threats: ThreatItem[];
  opportunities: OpportunityItem[];
  analyst_summary: string;
  daily_recommendation: string;
  generated_at: string;
  email_sent: boolean;
  email_sent_at: string | null;
  slack_sent: boolean;
  slack_sent_at: string | null;
}

export interface CompetitorItem {
  id: string;
  competitor_name: string;
  domain: string;
  product_name: string | null;
  current_price: number | null;
  original_price: number | null;
  currency: string | null;
  in_stock: boolean | null;
  active_offers: OfferItem[];
  subscription_discount: { summary?: string; value?: string | number | null } | null;
  shipping_threshold: number | null;
  last_updated: string | null;
  extraction_status: ExtractionStatus | string;
  highlight_signal_headline: string | null;
  highlight_signal_severity: SignalSeverity | null;
}

export interface SuggestionItem {
  id: string;
  product_id: string;
  headline: string;
  suggestion_text: string;
  confidence: "high" | "medium" | "low";
  category: string;
  based_on_signals: string[];
  urgency: OpportunityUrgency;
  created_at: string;
}

export interface IntegrationStatus {
  founder_email: string | null;
  email_active: boolean;
  slack_connected: boolean;
  slack_label: string;
}

export interface PipelineStep {
  label: string;
  status: "pending" | "active" | "complete" | "failed";
}

export interface DashboardStats {
  competitors_tracked: number;
  signals_today: number;
  suggestions_count: number;
}

export interface DashboardResponse {
  product: ProductSummary;
  stats: DashboardStats;
  brief: DailyBrief | null;
  integrations: IntegrationStatus;
  progress_text: string;
  is_processing: boolean;
  pipeline_steps: PipelineStep[];
  competitors: CompetitorItem[];
  signals: SignalItem[];
  suggestions: SuggestionItem[];
}

export interface PaginatedResponse<T> {
  page: number;
  page_size: number;
  total: number;
  items: T[];
}
