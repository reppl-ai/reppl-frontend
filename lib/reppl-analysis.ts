import type { NextApiResponse } from "next";

export type Positioning = "premium" | "mid-range" | "budget";
export type MarginRange = "<20%" | "20-40%" | "40%+";
export type JobStatus = "analyzing" | "scanning" | "deciding" | "complete" | "failed";
export type JobStepStatus = "pending" | "active" | "complete" | "failed";
export type AiDiscoveryScore = "HIGH" | "MEDIUM" | "LOW";

export interface AnalyzeJobInput {
  product_url: string;
  positioning: Positioning | null;
  margin: MarginRange | null;
}

export interface ProductAnalysisResult {
  name: string;
  price: number;
  currency: string;
  category: string;
  description: string;
  has_offer: boolean;
}

export interface CompetitorAnalysisResult {
  name: string;
  price: number;
  has_bundle: boolean;
  headline: string;
  main_offer: string | null;
  url: string;
}

export interface DecisionEngineResult {
  issue: string;
  why: string[];
  direction: string[];
  considered: string[];
}

export interface AnalysisResult {
  product: {
    name: string;
    price: number;
    currency: string;
    category: string;
    description: string;
    has_offer: boolean;
  };
  competitors: Array<{
    name: string;
    price: number;
    has_bundle: boolean;
    headline: string;
  }>;
  issue: string;
  why: string[];
  direction: string[];
  considered: string[];
  ai_discovery: AiDiscoveryScore;
  ai_reason: string[];
  generated_at: string;
  competitor_count: number;
}

export interface JobStep {
  label: string;
  status: JobStepStatus;
}

export interface AnalysisJob {
  job_id: string;
  input: AnalyzeJobInput;
  status: JobStatus;
  current_step: string;
  steps: JobStep[];
  result: AnalysisResult | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface NormalizedAnalysisPayload {
  product: ProductAnalysisResult;
  competitors: CompetitorAnalysisResult[];
  context: {
    positioning: Positioning | null;
    margin: MarginRange | null;
    competitor_count: number;
  };
}

const STEP_LABELS = [
  "Identifying your product",
  "Scanning competitor market",
  "Running decision engine",
  "Checking AI discoverability",
] as const;

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const TINYFISH_API_URL = process.env.TINYFISH_API_URL;
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1/chat/completions";

declare global {
  var __repplJobStore: Map<string, AnalysisJob> | undefined;
}

const jobStore = global.__repplJobStore ?? new Map<string, AnalysisJob>();
if (!global.__repplJobStore) {
  global.__repplJobStore = jobStore;
}

export function createAnalysisJob(input: AnalyzeJobInput): AnalysisJob {
  const timestamp = new Date().toISOString();
  const job: AnalysisJob = {
    job_id: createJobId(),
    input,
    status: "analyzing",
    current_step: STEP_LABELS[0],
    steps: STEP_LABELS.map((label, index) => ({
      label,
      status: index === 0 ? "active" : "pending",
    })),
    result: null,
    error_message: null,
    created_at: timestamp,
    updated_at: timestamp,
    completed_at: null,
  };

  jobStore.set(job.job_id, job);
  return job;
}

export function getAnalysisJob(jobId: string | undefined | null): AnalysisJob | null {
  if (!jobId) return null;
  return jobStore.get(jobId) ?? null;
}

export function sendNoStore(res: NextApiResponse): void {
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

export async function startAnalysisJob(jobId: string): Promise<void> {
  const job = getAnalysisJob(jobId);
  if (!job || job.completed_at || job.result || job.error_message) return;

  try {
    await setStep(jobId, 0, "analyzing");
    const product = await analyzeProductPage(job.input.product_url);
    await settle();

    await setStep(jobId, 1, "scanning");
    const competitorUrls = await discoverCompetitorUrls(product, job.input.product_url);
    const competitors = (await Promise.all(competitorUrls.map((url) => scanCompetitor(url, product.category)))).filter(
      isDefined
    );
    await settle();

    const normalizedData: NormalizedAnalysisPayload = {
      product,
      competitors,
      context: {
        positioning: job.input.positioning,
        margin: job.input.margin,
        competitor_count: competitors.length,
      },
    };

    await setStep(jobId, 2, "deciding");
    const decision = await runDecisionEngine(normalizedData);
    await settle();

    await setStep(jobId, 3, "deciding");
    const ai = await runAiDiscoverability(normalizedData);

    completeJob(jobId, {
      product,
      competitors: competitors.map((competitor) => ({
        name: competitor.name,
        price: competitor.price,
        has_bundle: competitor.has_bundle,
        headline: competitor.headline,
      })),
      issue: decision.issue,
      why: decision.why,
      direction: decision.direction,
      considered: decision.considered,
      ai_discovery: ai.ai_discovery,
      ai_reason: ai.ai_reason,
      generated_at: new Date().toISOString(),
      competitor_count: competitors.length,
    });
  } catch (error) {
    failJob(jobId, toPublicErrorMessage(error));
  }
}

function createJobId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `job_${Math.random().toString(36).slice(2, 10)}`;
}

async function setStep(jobId: string, index: number, status: Exclude<JobStatus, "complete" | "failed">): Promise<void> {
  const job = getAnalysisJob(jobId);
  if (!job) return;

  job.status = status;
  job.current_step = STEP_LABELS[index];
  job.steps = job.steps.map((step, stepIndex) => {
    if (stepIndex < index) return { ...step, status: "complete" };
    if (stepIndex === index) return { ...step, status: "active" };
    return { ...step, status: "pending" };
  });
  job.updated_at = new Date().toISOString();
  jobStore.set(jobId, job);
}

function completeJob(jobId: string, result: AnalysisResult): void {
  const job = getAnalysisJob(jobId);
  if (!job) return;

  const timestamp = new Date().toISOString();
  job.status = "complete";
  job.current_step = STEP_LABELS[STEP_LABELS.length - 1];
  job.steps = job.steps.map((step) => ({ ...step, status: "complete" }));
  job.result = result;
  job.error_message = null;
  job.updated_at = timestamp;
  job.completed_at = timestamp;
  jobStore.set(jobId, job);
}

function failJob(jobId: string, message: string): void {
  const job = getAnalysisJob(jobId);
  if (!job) return;

  const timestamp = new Date().toISOString();
  const failedIndex = job.steps.findIndex((step) => step.status === "active");
  job.status = "failed";
  job.error_message = message;
  job.updated_at = timestamp;
  job.completed_at = timestamp;
  job.steps = job.steps.map((step, index) => {
    if (index === failedIndex) return { ...step, status: "failed" };
    return step;
  });
  jobStore.set(jobId, job);
}

async function analyzeProductPage(productUrl: string): Promise<ProductAnalysisResult> {
  const parsed = parseProductUrl(productUrl);
  if (!looksLikeProductUrl(parsed)) {
    throw new FriendlyError("We couldn't analyze this URL. Make sure it's a direct product page.");
  }

  if (TINYFISH_API_URL && TINYFISH_API_KEY) {
    try {
      const response = await runTinyFishPrompt<ProductExtractionPayload>({
        url: productUrl,
        goal: `Visit this ecommerce product page.
Close any cookie banner.
Wait for full load.

Extract:
- product_name: full title
- price: number only, no symbol
- currency: 3-letter code
- description: main product description
- has_offer: true if any bundle/discount visible
- category: product type

Return JSON only. No explanation.
{
  "product_name": "string",
  "price": 0.00,
  "currency": "USD",
  "description": "string",
  "has_offer": false,
  "category": "string"
}`,
      });

      return {
        name: response.product_name,
        price: normalizePrice(response.price, productUrl),
        currency: normalizeCurrency(response.currency, productUrl),
        description: response.description || buildMockDescription(parsed),
        has_offer: Boolean(response.has_offer),
        category: normalizeCategory(response.category, parsed),
      };
    } catch {
      throw new FriendlyError("Our agents couldn't access this page");
    }
  }

  const title = productTitleFromUrl(parsed);
  const category = inferCategory(parsed);

  return {
    name: title,
    price: mockedPrice(title),
    currency: inferCurrency(parsed.hostname),
    category,
    description: buildMockDescription(parsed),
    has_offer: hashBoolean(`${parsed.hostname}${parsed.pathname}`, 0.42),
  };
}

async function discoverCompetitorUrls(product: ProductAnalysisResult, productUrl: string): Promise<string[]> {
  const parsed = parseProductUrl(productUrl);
  const brand = hostnameBrand(parsed.hostname);

  if (TINYFISH_API_URL && TINYFISH_API_KEY) {
    try {
      const query = `${brand} ${product.category} alternatives`;
      const response = await runTinyFishPrompt<{ urls: string[] }>({
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        goal: `Extract top 3 competitor product page URLs.
D2C brands only. No marketplaces.
Return JSON: {"urls": ["url1", "url2", "url3"]}`,
      });

      const urls = Array.isArray(response.urls) ? response.urls.filter(isValidHttpUrl).slice(0, 3) : [];
      if (urls.length >= 2) return urls;
    } catch {
      // Fall through to deterministic discovery.
    }
  }

  return mockCompetitorUrls(brand, product.category, parsed.hostname);
}

async function scanCompetitor(url: string, category: string): Promise<CompetitorAnalysisResult | null> {
  if (TINYFISH_API_URL && TINYFISH_API_KEY) {
    try {
      const response = await runTinyFishPrompt<CompetitorExtractionPayload>({
        url,
        goal: `Visit this ecommerce product page.
Close any cookie banner first.

Extract:
- name: brand or product name
- price: number only
- has_bundle: true if bundle offer exists
- headline: main value proposition shown
- main_offer: primary promotional offer or null

Return JSON only.
{
  "name": "string",
  "price": 0.00,
  "has_bundle": false,
  "headline": "string",
  "main_offer": "string or null"
}`,
      });

      return {
        name: response.name || hostnameBrand(new URL(url).hostname),
        price: normalizePrice(response.price, url),
        has_bundle: Boolean(response.has_bundle),
        headline: response.headline || fallbackHeadline(category),
        main_offer: response.main_offer ?? null,
        url,
      };
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(url);
    const base = hostnameBrand(parsed.hostname);
    const priceSeed = mockedPrice(`${base}-${category}`);
    return {
      name: `${base} ${category}`.trim(),
      price: priceSeed,
      has_bundle: hashBoolean(url, 0.5),
      headline: mockHeadline(base, category),
      main_offer: hashBoolean(`${url}-offer`, 0.45) ? "Starter bundle" : null,
      url,
    };
  } catch {
    return null;
  }
}

async function runDecisionEngine(payload: NormalizedAnalysisPayload): Promise<DecisionEngineResult> {
  if (GROQ_API_KEY) {
    const systemPrompt = `You are a senior e-commerce growth strategist specializing in D2C brands.

You receive product data, competitor comparison, and business context.

Your job: identify the SINGLE most important issue affecting this product right now.

Rules:
- One issue only. Not a list of problems.
- Be specific. Reference actual data points.
- Respect the margin range - never suggest heavy discounts to <20% margin brands
- Respect the positioning - never suggest discounting a premium brand
- No generic advice like "improve marketing"
- Sound like a senior strategist, not a chatbot
- Return ONLY valid JSON. Zero explanation outside JSON.`;

    const userPrompt = `PRODUCT DATA:
${JSON.stringify(payload)}

Return JSON:
{
  "issue": "one bold sentence, max 12 words",
  "why": [
    "specific reason 1",
    "specific reason 2",
    "specific reason 3"
  ],
  "direction": [
    "specific action 1",
    "specific action 2",
    "specific action 3"
  ],
  "considered": [
    "option we ruled out: heavy discount",
    "option we ruled out: shipping giveaway",
    "option we selected: bundle structure"
  ]
}`;

    const liveResult = await runGroqJson<DecisionEngineResult>(systemPrompt, userPrompt, 1000, true);
    return normalizeDecisionEngineResult(liveResult, payload);
  }

  return heuristicDecision(payload);
}

async function runAiDiscoverability(
  payload: NormalizedAnalysisPayload
): Promise<{ ai_discovery: AiDiscoveryScore; ai_reason: string[] }> {
  if (GROQ_API_KEY) {
    const systemPrompt = `You are an AI shopping assistant evaluator.

You assess whether products would be recommended by AI shopping tools like ChatGPT, Perplexity, and Google AI Shopping when customers ask "what's the best [category] product?".

Factors that affect AI discoverability:
- Clear, specific value proposition
- Structured product information
- Distinctive positioning
- Strong social proof signals
- Clear use case targeting
- Competitive pricing vs alternatives

Be critical and realistic.
Return ONLY valid JSON.`;

    const userPrompt = `PRODUCT DATA:
${JSON.stringify(payload)}

Return JSON:
{
  "ai_discovery": "HIGH|MEDIUM|LOW",
  "ai_reason": [
    "specific reason 1",
    "specific reason 2"
  ]
}`;

    return runGroqJson<{ ai_discovery: AiDiscoveryScore; ai_reason: string[] }>(systemPrompt, userPrompt, 500, false);
  }

  return heuristicAiDiscoverability(payload);
}

async function runTinyFishPrompt<T>(payload: { url: string; goal: string }): Promise<T> {
  const response = await fetch(TINYFISH_API_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TINYFISH_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("TinyFish request failed");
  }

  const raw = await response.text();
  return parseJsonResponse<T>(raw);
}

async function runGroqJson<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  retryOnInvalidJson: boolean
): Promise<T> {
  try {
    return await callGroq<T>(systemPrompt, userPrompt, maxTokens);
  } catch (error) {
    if (!retryOnInvalidJson || !isJsonParseError(error)) {
      throw new FriendlyError("Intelligence engine error");
    }
  }

  try {
    return await callGroq<T>(systemPrompt, userPrompt, maxTokens);
  } catch {
    throw new FriendlyError("Analysis failed. Please try again.");
  }
}

async function callGroq<T>(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<T> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Groq request failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty content");
  }

  return parseJsonResponse<T>(content);
}

function heuristicDecision(payload: NormalizedAnalysisPayload): DecisionEngineResult {
  const product = payload.product;
  const competitorCount = payload.competitors.length;
  const bundleCount = payload.competitors.filter((competitor) => competitor.has_bundle).length;
  const avgCompetitorPrice =
    competitorCount > 0
      ? payload.competitors.reduce((sum, competitor) => sum + competitor.price, 0) / competitorCount
      : product.price;

  if (!product.has_offer && bundleCount >= 2) {
    return {
      issue: "YOUR OFFER IS INVISIBLE NEXT TO COMPETITORS",
      why: [
        `${bundleCount} of ${competitorCount} competitors are framing value through bundles.`,
        `Your page shows a single-item offer while the market is selling multi-unit value.`,
        `That makes your price look exposed even when your list price is competitive.`,
      ],
      direction: [
        "Launch a starter bundle that lifts perceived value without cutting core price.",
        "Rewrite the PDP headline to explain why the bundle exists and who it is for.",
        "Keep the single SKU live, but make the bundle the first decision on page.",
      ],
      considered: [
        "Heavy discount ruled out: it would compress margin too early.",
        "Free shipping giveaway ruled out: it lowers clarity more than it lifts value.",
        "Bundle structure selected: it changes comparison without training shoppers to wait.",
      ],
    };
  }

  if (
    avgCompetitorPrice < product.price * 0.92 &&
    payload.context.positioning !== "premium" &&
    payload.context.margin !== "<20%"
  ) {
    return {
      issue: "YOUR PRICE POSITION IS EASY TO UNDERCUT",
      why: [
        `Average competitor price is ${product.currency} ${avgCompetitorPrice.toFixed(2)} versus your ${product.currency} ${product.price.toFixed(2)}.`,
        "Your current page does not add enough offer structure to justify the gap.",
        "That leaves value-seeking shoppers with a cleaner reason to leave the PDP.",
      ],
      direction: [
        "Tighten price architecture with an entry offer instead of broad markdowns.",
        "Use a small-format bundle or starter pack to create a better first comparison.",
        "Add above-the-fold proof that explains why your price earns the premium.",
      ],
      considered: [
        "Permanent price drop ruled out: it weakens future recovery.",
        "Premium repositioning ruled out: the page is not doing enough brand work yet.",
        "Entry offer selected: it narrows the comparison without resetting full price.",
      ],
    };
  }

  return {
    issue: "YOUR PRODUCT STORY IS TOO GENERIC TO WIN FAST",
    why: [
      "Competitor headlines are making sharper claims than your current product framing.",
      "Your description reads like a standard category page instead of a decisive use-case pitch.",
      "That weakens both conversion pressure and recommendation potential in AI shopping flows.",
    ],
    direction: [
      "Rewrite the hero copy around one explicit use case and buyer problem.",
      "Make the first three PDP bullets structured, specific, and comparison-friendly.",
      "Support the claim with one proof element above the fold before secondary details.",
    ],
    considered: [
      "Visual redesign ruled out: this is a message problem first.",
      "Traffic increase ruled out: more clicks into the same page will not fix clarity.",
      "Positioning rewrite selected: it changes both conversion and discoverability fastest.",
    ],
  };
}

function heuristicAiDiscoverability(payload: NormalizedAnalysisPayload): {
  ai_discovery: AiDiscoveryScore;
  ai_reason: string[];
} {
  const product = payload.product;
  const competitorCount = payload.competitors.length;
  const bundleCount = payload.competitors.filter((competitor) => competitor.has_bundle).length;
  const descriptionLength = product.description.trim().length;

  if (descriptionLength > 90 && product.has_offer && bundleCount <= 1) {
    return {
      ai_discovery: "HIGH",
      ai_reason: [
        "Your product page has enough structure for AI tools to understand the use case quickly.",
        "The offer is visible without looking like a commodity markdown next to alternatives.",
      ],
    };
  }

  if (descriptionLength > 60 || competitorCount >= 2) {
    return {
      ai_discovery: "MEDIUM",
      ai_reason: [
        "AI tools can identify the category, but the use case is not yet distinct enough to rank confidently.",
        "Competitor offer framing is stronger, so recommendation engines may default to clearer alternatives.",
      ],
    };
  }

  return {
    ai_discovery: "LOW",
    ai_reason: [
      "AI tools cannot find a sharp enough reason to recommend this product over nearby alternatives.",
      "Your page lacks structured differentiation, which weakens machine-readable recommendation signals.",
    ],
  };
}

function normalizeDecisionEngineResult(
  value: DecisionEngineResult,
  payload: NormalizedAnalysisPayload
): DecisionEngineResult {
  const issue = sanitizeSentence(value.issue, "YOUR OFFER IS INVISIBLE NEXT TO COMPETITORS").toUpperCase();
  const why = takeFilled(value.why, 3, buildFallbackWhy(payload));
  const direction = takeFilled(value.direction, 3, buildFallbackDirection(payload));
  const considered = takeFilled(
    value.considered,
    3,
    heuristicDecision(payload).considered
  );

  return { issue, why, direction, considered };
}

function buildFallbackWhy(payload: NormalizedAnalysisPayload): string[] {
  return heuristicDecision(payload).why;
}

function buildFallbackDirection(payload: NormalizedAnalysisPayload): string[] {
  return heuristicDecision(payload).direction;
}

function parseJsonResponse<T>(value: string): T {
  const extracted = extractJsonBlock(value);
  try {
    return JSON.parse(extracted) as T;
  } catch (error) {
    throw new JsonParseError(error instanceof Error ? error.message : "Invalid JSON");
  }
}

function extractJsonBlock(value: string): string {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new JsonParseError("No JSON object found");
  }
  return value.slice(start, end + 1);
}

function isJsonParseError(error: unknown): boolean {
  return error instanceof JsonParseError;
}

function parseProductUrl(productUrl: string): URL {
  try {
    return new URL(productUrl);
  } catch {
    throw new FriendlyError("We couldn't analyze this URL. Make sure it's a direct product page.");
  }
}

function looksLikeProductUrl(url: URL): boolean {
  const segments = url.pathname.split("/").filter(Boolean);
  return segments.length >= 1 && segments.some((segment) => segment.length > 2);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function inferCategory(url: URL): string {
  const value = `${url.hostname}${url.pathname}`.toLowerCase();
  const matches: Array<[string, string]> = [
    ["beard", "Beard Oil"],
    ["serum", "Face Serum"],
    ["protein", "Protein Powder"],
    ["coffee", "Coffee"],
    ["supplement", "Supplements"],
    ["shampoo", "Shampoo"],
    ["cleanser", "Cleanser"],
    ["moisturizer", "Moisturizer"],
    ["shoe", "Shoes"],
    ["wallet", "Wallet"],
    ["perfume", "Perfume"],
    ["fragrance", "Perfume"],
    ["mat", "Yoga Mat"],
  ];

  for (const [needle, category] of matches) {
    if (value.includes(needle)) return category;
  }

  return "Hero Product";
}

function normalizeCategory(category: string | undefined, url: URL): string {
  const cleaned = category?.trim();
  return cleaned && cleaned.length > 2 ? cleaned : inferCategory(url);
}

function productTitleFromUrl(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean);
  const raw = segments[segments.length - 1] ?? url.hostname;
  return titleCase(raw.replace(/[-_]+/g, " "));
}

function hostnameBrand(hostname: string): string {
  const stripped = hostname.replace(/^www\./, "").split(".");
  return titleCase(stripped[0] ?? "Brand");
}

function buildMockDescription(url: URL): string {
  const brand = hostnameBrand(url.hostname);
  const product = productTitleFromUrl(url);
  return `${brand} positions ${product} as a direct-to-consumer hero product with a focused category promise.`;
}

function inferCurrency(hostname: string): string {
  if (hostname.endsWith(".in")) return "INR";
  if (hostname.endsWith(".co.uk") || hostname.endsWith(".uk")) return "GBP";
  if (hostname.endsWith(".eu")) return "EUR";
  return "USD";
}

function normalizeCurrency(currency: string | undefined, fallbackUrl: string): string {
  const cleaned = currency?.trim().toUpperCase();
  if (cleaned && cleaned.length === 3) return cleaned;
  return inferCurrency(parseProductUrl(fallbackUrl).hostname);
}

function normalizePrice(value: number | string | undefined, seed: string): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return roundPrice(value);
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) return roundPrice(numeric);
  }
  return mockedPrice(seed);
}

function roundPrice(value: number): number {
  return Number(value.toFixed(2));
}

function mockedPrice(seed: string): number {
  const value = hashNumber(seed);
  return roundPrice(24 + value * 96);
}

function hashNumber(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

function hashBoolean(seed: string, threshold: number): boolean {
  return hashNumber(seed) > threshold;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function mockCompetitorUrls(brand: string, category: string, hostname: string): string[] {
  const pool = [
    "northstargoods.com",
    "stridemarket.com",
    "fieldlab.co",
    "properformulas.com",
    "rivetandco.com",
    "brightpathsupply.com",
    "districtdaily.com",
  ].filter((value) => value !== hostname.replace(/^www\./, ""));
  const slug = slugify(category || brand || "product");

  return pool.slice(0, 3).map((domain) => `https://${domain}/products/${slug}`);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fallbackHeadline(category: string): string {
  return `${category.toUpperCase()} FOR DAILY USE`;
}

function mockHeadline(brand: string, category: string): string {
  const variants = [
    `${brand.toUpperCase()} BUILDS A CLEARER ${category.toUpperCase()} OFFER`,
    `${brand.toUpperCase()} LEADS WITH A STRONGER ${category.toUpperCase()} VALUE HOOK`,
    `${brand.toUpperCase()} MAKES THE FIRST DECISION EASIER`,
  ];

  return variants[Math.floor(hashNumber(`${brand}-${category}`) * variants.length)] ?? variants[0];
}

function sanitizeSentence(value: string | undefined, fallback: string): string {
  const cleaned = value?.trim();
  return cleaned && cleaned.length >= 6 ? cleaned : fallback;
}

function takeFilled(values: string[] | undefined, count: number, fallback: string[]): string[] {
  const cleaned =
    values?.map((value) => value.trim()).filter((value) => value.length > 0).slice(0, count) ?? [];

  if (cleaned.length === count) return cleaned;
  return [...cleaned, ...fallback.slice(cleaned.length, count)];
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function toPublicErrorMessage(error: unknown): string {
  if (error instanceof FriendlyError) return error.message;
  return "Intelligence engine error";
}

async function settle(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
}

class FriendlyError extends Error {}

class JsonParseError extends Error {}

interface ProductExtractionPayload {
  product_name: string;
  price: number;
  currency: string;
  description: string;
  has_offer: boolean;
  category: string;
}

interface CompetitorExtractionPayload {
  name: string;
  price: number;
  has_bundle: boolean;
  headline: string;
  main_offer: string | null;
}
