import type {
  AnalyzeProductPayload,
  AnalyzeProductResponse,
  DailyBrief,
  DashboardResponse,
  IntegrationStatus,
  OfferItem,
  PaginatedResponse,
  PipelineStep,
  ProductSummary,
  SignalItem,
  SuggestionItem,
} from "./types";

const DEMO_PRODUCT_ID = "demo-product";
const DEMO_KEY = "reppl-demo-state";

interface DemoState {
  started_at: number;
  last_scan_at: number;
  founder_email: string;
  slack_webhook_url: string | null;
  product_url: string;
  timezone: string;
  brief_time: string;
}

export async function analyzeProductMock(payload: AnalyzeProductPayload): Promise<AnalyzeProductResponse> {
  const state: DemoState = {
    started_at: Date.now(),
    last_scan_at: Date.now(),
    founder_email: payload.founder_email || "founder@brand.com",
    slack_webhook_url: payload.slack_webhook_url || null,
    product_url: payload.product_url,
    timezone: payload.timezone,
    brief_time: payload.brief_time,
  };
  writeState(state);
  return { product_id: DEMO_PRODUCT_ID, progress_text: "MISSION INITIATED" };
}

export async function getDashboardMock(productId: string): Promise<DashboardResponse> {
  const state = ensureState(productId);
  const phase = getPhase(state);
  const product = buildProduct(state, phase);
  const brief = phase === "complete" ? buildBrief(product.id) : null;
  const signals = phase === "complete" ? buildSignals() : [];
  const suggestions = phase === "complete" ? buildSuggestions() : [];
  return {
    product,
    stats: {
      competitors_tracked: 5,
      signals_today: signals.length,
      suggestions_count: suggestions.length,
    },
    brief,
    integrations: {
      founder_email: state.founder_email,
      email_active: true,
      slack_connected: Boolean(state.slack_webhook_url),
      slack_label: state.slack_webhook_url ? "[CONNECTED]" : "[ADD SLACK >>>]",
    },
    progress_text: progressText(phase),
    is_processing: phase !== "complete",
    pipeline_steps: buildPipelineSteps(phase),
    competitors: buildCompetitors(phase),
    signals,
    suggestions,
  };
}

export async function getBriefMock(productId: string): Promise<DailyBrief | null> {
  const state = ensureState(productId);
  return getPhase(state) === "complete" ? buildBrief(productId) : null;
}

export async function getSignalsMock(
  productId: string,
  limit: number,
  page: number
): Promise<PaginatedResponse<SignalItem>> {
  ensureState(productId);
  const signals = buildSignals();
  const start = (page - 1) * limit;
  return {
    page,
    page_size: limit,
    total: signals.length,
    items: signals.slice(start, start + limit),
  };
}

export async function getSuggestionsMock(productId: string): Promise<PaginatedResponse<SuggestionItem>> {
  ensureState(productId);
  const suggestions = buildSuggestions();
  return {
    page: 1,
    page_size: suggestions.length,
    total: suggestions.length,
    items: suggestions,
  };
}

export async function scanNowMock(productId: string): Promise<DashboardResponse> {
  const state = ensureState(productId);
  state.last_scan_at = Date.now();
  writeState(state);
  return getDashboardMock(productId);
}

export async function getIntegrationStatusMock(productId: string): Promise<IntegrationStatus> {
  const state = ensureState(productId);
  return {
    founder_email: state.founder_email,
    email_active: true,
    slack_connected: Boolean(state.slack_webhook_url),
    slack_label: state.slack_webhook_url ? "[CONNECTED]" : "[ADD SLACK >>>]",
  };
}

export async function connectSlackWebhookMock(productId: string, webhookUrl: string): Promise<IntegrationStatus> {
  const state = ensureState(productId);
  state.slack_webhook_url = webhookUrl;
  writeState(state);
  return getIntegrationStatusMock(productId);
}

function buildProduct(state: DemoState, phase: DemoPhase): ProductSummary {
  return {
    id: DEMO_PRODUCT_ID,
    product_url: state.product_url,
    product_name: "BEARD OIL",
    brand: "BEARDO",
    category: "GROOMING",
    current_price: 42,
    currency: "USD",
    founder_email: state.founder_email,
    slack_webhook_url: state.slack_webhook_url,
    timezone: state.timezone,
    brief_time: state.brief_time,
    analysis_status: phase === "analysis" ? "pending" : "completed",
    discovery_status: phase === "analysis" || phase === "discovery" ? "pending" : "completed",
    last_scanned_at: phase === "complete" ? new Date(state.last_scan_at).toISOString() : null,
  };
}

function buildBrief(productId: string): DailyBrief {
  return {
    id: "brief-1",
    product_id: productId,
    brief_date: new Date().toISOString(),
    signals: [
      {
        competitor_name: "THE MAN COMPANY",
        signal_type: "bundle_introduced",
        headline: "BUNDLE PUSH EXPANDS",
        detail: "The Man Company launched a 3-pack at USD 96 versus USD 42 for a single bottle.",
        severity: "high",
        old_value: "none",
        new_value: "3-pack bundle",
        opportunity: "Launch a tighter 2-pack test before discounting singles.",
      },
      {
        competitor_name: "USTRAA",
        signal_type: "price_drop",
        headline: "PRICE CUT LANDED",
        detail: "Ustraa dropped beard oil from USD 42 to USD 36 overnight.",
        severity: "medium",
        old_value: "USD 42",
        new_value: "USD 36",
        opportunity: "Hold price and defend with bundle value instead of margin cuts.",
      },
    ],
    patterns: [
      "Bundle-led value framing is increasing across premium beard care brands.",
      "Brands are leaning on offer mechanics before making broad permanent price changes.",
    ],
    threats: [
      {
        description: "Aggressive bundle framing could reset shopper expectations on pack value.",
        triggered_by: "THE MAN COMPANY",
        urgency: "this_week",
      },
    ],
    opportunities: [
      {
        description: "Competitors are training shoppers to compare bundle economics.",
        reason: "The Man Company and Bombay Shaving are both pushing multi-unit value.",
        action: "Launch a founder-led 2-pack bundle test with a higher AOV target this week.",
        urgency: "immediate",
      },
      {
        description: "Price cuts are appearing, but not yet market-wide.",
        reason: "Only one direct competitor reduced price while others shifted to offers.",
        action: "Defend price by pairing the hero SKU with a limited bundle instead of discounting the single.",
        urgency: "this_week",
      },
    ],
    analyst_summary:
      "Bundle mechanics are moving faster than headline price cuts in beard care right now. One competitor lowered price, but the bigger pattern is pack-based value framing.",
    daily_recommendation:
      "Launch a 2-pack bundle before cutting your single-unit price. The Man Company is pushing multi-unit value and Ustraa already moved from USD 42 to USD 36, so your fastest defensive move is to increase perceived value without training your market to wait for discounts.",
    generated_at: new Date().toISOString(),
    email_sent: true,
    email_sent_at: new Date().toISOString(),
    slack_sent: false,
    slack_sent_at: null,
  };
}

function buildCompetitors(phase: DemoPhase) {
  const baseTime = new Date().toISOString();
  return [
    buildCompetitor("c1", "THE MAN COMPANY", "themancompany.com", phase === "analysis" ? "pending" : "completed", {
      price: 42,
      original: null,
      offers: [{ type: "bundle", summary: "BUY 3 SAVE 12", value: null, code: null }],
      stock: true,
      shipping: 30,
      highlight: phase === "complete" ? "BUNDLE PUSH EXPANDS" : null,
      severity: phase === "complete" ? "high" : null,
      updatedAt: baseTime,
    }),
    buildCompetitor("c2", "USTRAA", "ustraa.com", phase === "analysis" || phase === "discovery" ? "pending" : "completed", {
      price: 36,
      original: 42,
      offers: [],
      stock: true,
      shipping: 25,
      highlight: phase === "complete" ? "PRICE CUT LANDED" : null,
      severity: phase === "complete" ? "medium" : null,
      updatedAt: baseTime,
    }),
    buildCompetitor("c3", "BOMBAY SHAVING", "bombayshavingcompany.com", phase === "analysis" || phase === "discovery" ? "pending" : "completed", {
      price: 39,
      original: null,
      offers: [{ type: "subscription", summary: "SAVE 15% MONTHLY", value: null, code: null }],
      stock: true,
      shipping: 35,
      highlight: null,
      severity: null,
      updatedAt: baseTime,
    }),
    buildCompetitor("c4", "BEARDO CARE", "beardocare.com", phase === "complete" ? "completed" : "pending", {
      price: 44,
      original: null,
      offers: [],
      stock: false,
      shipping: 40,
      highlight: null,
      severity: null,
      updatedAt: baseTime,
    }),
    buildCompetitor("c5", "URBAN GROOM", "urbangroom.com", phase === "complete" ? "completed" : "pending", {
      price: 41,
      original: 46,
      offers: [{ type: "coupon_code", summary: "SAVE10 AT CHECKOUT", value: "SAVE10", code: "SAVE10" }],
      stock: true,
      shipping: 50,
      highlight: null,
      severity: null,
      updatedAt: baseTime,
    }),
  ];
}

function buildCompetitor(
  id: string,
  name: string,
  domain: string,
  extractionStatus: string,
  values: {
    price: number | null;
    original: number | null;
    offers: OfferItem[];
    stock: boolean;
    shipping: number | null;
    highlight: string | null;
    severity: "high" | "medium" | "low" | null;
    updatedAt: string;
  }
) {
  return {
    id,
    competitor_name: name,
    domain,
    product_name: extractionStatus === "completed" ? "PREMIUM BEARD OIL" : null,
    current_price: extractionStatus === "completed" ? values.price : null,
    original_price: extractionStatus === "completed" ? values.original : null,
    currency: "USD",
    in_stock: extractionStatus === "completed" ? values.stock : null,
    active_offers: extractionStatus === "completed" ? values.offers : [],
    subscription_discount:
      extractionStatus === "completed" && values.offers.some((offer) => offer.type === "subscription")
        ? { summary: "SAVE 15% MONTHLY", value: null }
        : null,
    shipping_threshold: extractionStatus === "completed" ? values.shipping : null,
    last_updated: extractionStatus === "completed" ? values.updatedAt : null,
    extraction_status: extractionStatus,
    highlight_signal_headline: values.highlight,
    highlight_signal_severity: values.severity,
  };
}

function buildSignals(): SignalItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: "s1",
      competitor_id: "c1",
      product_id: DEMO_PRODUCT_ID,
      competitor_name: "THE MAN COMPANY",
      signal_type: "bundle_introduced",
      headline: "BUNDLE PUSH EXPANDS",
      severity: "high",
      old_value: "NONE",
      new_value: "BUY 3 SAVE 12",
      detail: "The Man Company introduced a three-unit beard oil bundle at a lower per-unit price.",
      opportunity: "Lead with a tighter bundle instead of a broad discount.",
      timestamp: now,
    },
    {
      id: "s2",
      competitor_id: "c2",
      product_id: DEMO_PRODUCT_ID,
      competitor_name: "USTRAA",
      signal_type: "price_drop",
      headline: "PRICE CUT LANDED",
      severity: "medium",
      old_value: "USD 42",
      new_value: "USD 36",
      detail: "Ustraa reduced hero beard oil pricing by roughly 14 percent.",
      opportunity: "Protect margin with value framing before reacting on price.",
      timestamp: now,
    },
    {
      id: "s3",
      competitor_id: "c4",
      product_id: DEMO_PRODUCT_ID,
      competitor_name: "BEARDO CARE",
      signal_type: "out_of_stock",
      headline: "STOCK PRESSURE SHOWS",
      severity: "low",
      old_value: "IN STOCK",
      new_value: "OUT OF STOCK",
      detail: "One competitor is currently out of stock on its hero SKU.",
      opportunity: "Capture demand with fast-ship messaging while stock is constrained.",
      timestamp: now,
    },
  ];
}

function buildSuggestions(): SuggestionItem[] {
  return [
    {
      id: "sg1",
      product_id: DEMO_PRODUCT_ID,
      headline: "TEST A 2-PACK BEFORE CUTTING PRICE",
      suggestion_text:
        "Bundle pressure is rising faster than permanent price cuts. Use a 2-pack test to raise perceived value while protecting single-SKU margin.",
      confidence: "high",
      category: "bundling",
      based_on_signals: ["s1", "s2"],
      urgency: "immediate",
      created_at: new Date().toISOString(),
    },
    {
      id: "sg2",
      product_id: DEMO_PRODUCT_ID,
      headline: "PUSH FAST-SHIP CREATIVE THIS WEEK",
      suggestion_text:
        "A competitor went out of stock. Use faster-delivery and reliability messaging while shoppers are re-evaluating alternatives.",
      confidence: "medium",
      category: "inventory",
      based_on_signals: ["s3"],
      urgency: "this_week",
      created_at: new Date().toISOString(),
    },
  ];
}

function buildPipelineSteps(phase: DemoPhase): PipelineStep[] {
  if (phase === "analysis") {
    return [
      { label: "Identifying your product", status: "active" },
      { label: "Discovering competitors", status: "pending" },
      { label: "Scanning competitor 1", status: "pending" },
      { label: "Scanning competitor 2", status: "pending" },
      { label: "Scanning competitor 3", status: "pending" },
      { label: "Generating intelligence brief", status: "pending" },
    ];
  }
  if (phase === "discovery") {
    return [
      { label: "Identifying your product", status: "complete" },
      { label: "Discovering competitors", status: "active" },
      { label: "Scanning competitor 1", status: "pending" },
      { label: "Scanning competitor 2", status: "pending" },
      { label: "Scanning competitor 3", status: "pending" },
      { label: "Generating intelligence brief", status: "pending" },
    ];
  }
  if (phase === "scanning") {
    return [
      { label: "Identifying your product", status: "complete" },
      { label: "Discovering competitors", status: "complete" },
      { label: "Scanning competitor 1", status: "active" },
      { label: "Scanning competitor 2", status: "active" },
      { label: "Scanning competitor 3", status: "pending" },
      { label: "Generating intelligence brief", status: "pending" },
    ];
  }
  return [
    { label: "Identifying your product", status: "complete" },
    { label: "Discovering competitors", status: "complete" },
    { label: "Scanning competitor 1", status: "complete" },
    { label: "Scanning competitor 2", status: "complete" },
    { label: "Scanning competitor 3", status: "complete" },
    { label: "Generating intelligence brief", status: "complete" },
  ];
}

function progressText(phase: DemoPhase): string {
  if (phase === "analysis") return "Identifying your product...";
  if (phase === "discovery") return "Discovering competitors...";
  if (phase === "scanning") return "Scanning competitor stores...";
  return "Transmission received.";
}

type DemoPhase = "analysis" | "discovery" | "scanning" | "complete";

function getPhase(state: DemoState): DemoPhase {
  const elapsed = Math.floor((Date.now() - state.last_scan_at) / 1000);
  if (elapsed < 3) return "analysis";
  if (elapsed < 6) return "discovery";
  if (elapsed < 10) return "scanning";
  return "complete";
}

function ensureState(productId: string): DemoState {
  if (productId !== DEMO_PRODUCT_ID) {
    throw new Error("DEMO PRODUCT NOT FOUND");
  }
  const state = readState();
  if (state) return state;
  const seeded: DemoState = {
    started_at: Date.now() - 120000,
    last_scan_at: Date.now() - 12000,
    founder_email: "founder@beardo.com",
    slack_webhook_url: null,
    product_url: "https://beardo.in/products/beard-oil",
    timezone: "America/New_York",
    brief_time: "09:00",
  };
  writeState(seeded);
  return seeded;
}

function readState(): DemoState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
}

function writeState(state: DemoState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(state));
}
