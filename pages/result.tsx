import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useTypewriter } from "../hooks/useTypewriter";

interface ResultPayload {
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
  ai_discovery: "HIGH" | "MEDIUM" | "LOW";
  ai_reason: string[];
  generated_at: string;
  competitor_count: number;
}

export default function ResultPage() {
  const router = useRouter();
  const jobId = useMemo(() => {
    const value = router.query.id;
    return typeof value === "string" ? value : null;
  }, [router.query.id]);
  const [data, setData] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const activeJobId = jobId;

    let active = true;

    async function loadResult() {
      try {
        const response = await fetch(`/api/analyze/result?job_id=${encodeURIComponent(activeJobId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as ResultPayload | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : "Unable to load report.");
        }
        if (active) {
          setData(payload as ResultPayload);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load report.");
        }
      }
    }

    void loadResult();

    return () => {
      active = false;
    };
  }, [jobId]);

  const typedIssue = useTypewriter(data?.issue ?? "", data?.generated_at ?? "result", 20, Boolean(data?.issue), 400);
  const considered = useMemo(() => splitConsidered(data?.considered ?? []), [data?.considered]);
  const timestamp = data ? formatTimestamp(data.generated_at) : null;
  const aiAssessment = aiLabel(data?.ai_discovery);

  return (
    <>
      <Head>
        <title>REPPL // MARKET READ</title>
        <meta content="REPPL decision report for D2C founders." name="description" />
      </Head>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <header className="border-b border-[var(--ink)] bg-white/50 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 text-[11px] uppercase md:px-6">
            <div>REPPL market read</div>
            <div className="hidden flex-1 justify-center text-center text-[var(--ink-muted)] md:flex">
              {data ? `${data.product.name.toUpperCase()} // QUICK CONTEXT` : "ASSEMBLING REPORT"}
            </div>
            <div>{timestamp ? `Generated ${timestamp}` : "Preparing report"}</div>
          </div>
        </header>

        <main className="mx-auto max-w-[860px] px-4 py-8 md:px-6 md:py-10">
          {error ? (
            <section className="terminal-panel p-6 text-sm uppercase">
              <div>[Report unavailable]</div>
              <div className="mt-4 leading-7 text-[var(--ink-muted)]">{error}</div>
              <Link className="terminal-button mt-6 inline-flex" href="/">
                {"[Return To Landing Page >>>]"}
              </Link>
            </section>
          ) : null}

          {!data && !error ? (
            <section className="terminal-panel p-6 text-sm uppercase">
              {"[Assembling your market read >>>]"}
            </section>
          ) : null}

          {data ? (
            <>
              <section className="reveal soft-panel p-5 md:p-6" style={{ animationDelay: "0ms" }}>
                <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="terminal-label">[Product in focus]</div>
                    <div className="mt-4 font-display text-4xl uppercase leading-none md:text-5xl">
                      {data.product.name}
                    </div>
                    <div className="mt-4 space-y-3 text-sm uppercase">
                      <DataLine label="Price" value={`${data.product.currency} ${formatMoney(data.product.price)}`} />
                      <DataLine label="Category" value={data.product.category} />
                      <DataLine label="Competitors" value={`${data.competitor_count} scanned`} />
                    </div>
                  </div>
                  <div className="border-t border-dashed border-[var(--ink)] pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                    <div className="terminal-label">[How to read this]</div>
                    <div className="mt-4 text-sm uppercase leading-7 text-[var(--ink-mid)]">
                      This report highlights the strongest market signal right now, the likely reason it matters, and a
                      clean response to discuss with your team.
                    </div>
                  </div>
                </div>
              </section>

              <section className="reveal mt-6 soft-panel p-6 md:p-8" style={{ animationDelay: "100ms" }}>
                <div className="editorial-note">Top market signal</div>
                <div className="mt-4 font-display text-[2.9rem] uppercase leading-[0.92] md:text-[4.3rem] whitespace-pre-line">
                  {typedIssue}
                  <span className="blink">{typedIssue.length < data.issue.length ? "_" : ""}</span>
                </div>
                <div className="mt-4 text-xs uppercase leading-6 text-[var(--ink-muted)]">
                  Read this as today&apos;s strongest signal, not a permanent verdict on the business.
                </div>
              </section>

              <section className="reveal mt-5 grid gap-5 md:grid-cols-2" style={{ animationDelay: "200ms" }}>
                <div className="terminal-panel p-5 md:p-6">
                  <div className="terminal-label">[Why it matters now]</div>
                  <div className="mt-5 space-y-3 text-sm uppercase leading-7">
                    {data.why.map((item) => (
                      <div key={item}>[+] {item}</div>
                    ))}
                  </div>
                </div>
                <div className="terminal-panel p-5 md:p-6">
                  <div className="terminal-label">[Recommended next move]</div>
                  <div className="mt-5 space-y-3 text-sm uppercase leading-7">
                    {data.direction.map((item, index) => (
                      <div key={item}>
                        {String(index + 1).padStart(2, "0")} / {item}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="reveal terminal-panel mt-5 p-5 md:p-6" style={{ animationDelay: "300ms" }}>
                <div className="terminal-label">AI discoverability</div>
                <div className="mt-5 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="border-b border-[var(--ink)] pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-5">
                    <div className="text-xs uppercase text-[var(--ink-muted)]">Current score</div>
                    <div className="mt-4 font-display text-[4rem] uppercase leading-none">{data.ai_discovery}</div>
                    {aiAssessment ? <div className="mt-2 text-xs uppercase">{aiAssessment}</div> : null}
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[var(--ink-muted)]">Why</div>
                    <div className="mt-4 space-y-3 text-sm uppercase leading-7">
                      {data.ai_reason.map((reason) => (
                        <div key={reason}>- {reason}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 border-t border-dashed border-[var(--ink)] pt-4 text-xs uppercase leading-6 text-[var(--ink-muted)]">
                  This score estimates how likely AI shopping assistants are to surface your product when customers ask
                  for recommendations.
                </div>
              </section>

              <section className="reveal mt-5" style={{ animationDelay: "400ms" }}>
                <div className="text-xs uppercase text-[var(--ink-muted)]">We compared several directions</div>
                <div className="mt-4 grid gap-5 border-t border-dashed border-[var(--ink)] pt-5 md:grid-cols-2">
                  <div className="space-y-3 text-sm uppercase leading-7 text-[var(--ink-muted)]">
                    {considered.no.map((item) => (
                      <div key={item} className="line-through">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 text-sm uppercase leading-7">
                    {considered.yes.map((item) => (
                      <div key={item}>Selected: {item}</div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="reveal mt-5 grid gap-5 md:grid-cols-2" style={{ animationDelay: "500ms" }}>
                <div className="terminal-panel p-5 md:p-6">
                  <div className="terminal-label">[Competitors seen in this scan]</div>
                  <div className="mt-5 space-y-4 text-sm uppercase leading-7">
                    {data.competitors.slice(0, 3).map((competitor) => (
                      <div key={competitor.name} className="border-b border-dashed border-[var(--ink)] pb-4 last:border-b-0 last:pb-0">
                        <div>{competitor.name}</div>
                        <div className="text-[var(--ink-muted)]">
                          {competitor.headline} // {data.product.currency} {formatMoney(competitor.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="soft-panel p-5 md:p-6">
                  <div className="terminal-label">[Want this every morning?]</div>
                  <div className="mt-4 text-sm uppercase leading-7 text-[var(--ink-mid)]">
                    REPPL can turn this one-off scan into a daily founder brief with overnight changes, AI visibility,
                    and the clearest next move before your team logs on.
                  </div>
                  <Link className="terminal-button solid mt-6 inline-flex justify-center text-center" href="/onboard">
                    {"[Start Monitoring >>>]"}
                  </Link>
                  <div className="mt-4 text-xs uppercase leading-6 text-[var(--ink-muted)]">
                    14-day free trial. No credit card. Daily brief delivered at 09:00.
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <div>{label}</div>
      <div>{value.toUpperCase()}</div>
    </div>
  );
}

function splitConsidered(items: string[]): { no: string[]; yes: string[] } {
  const no: string[] = [];
  const yes: string[] = [];

  items.forEach((item) => {
    const normalized = item.toLowerCase();
    if (normalized.includes("selected")) {
      yes.push(stripConsideredLabel(item));
      return;
    }
    no.push(stripConsideredLabel(item));
  });

  if (yes.length === 0 && items[items.length - 1]) {
    yes.push(stripConsideredLabel(items[items.length - 1]));
  }

  return {
    no: no.slice(0, 2),
    yes: yes.slice(0, 1),
  };
}

function stripConsideredLabel(value: string): string {
  return value.replace(/^.*?:\s*/u, "").trim();
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function aiLabel(value: ResultPayload["ai_discovery"] | undefined): string | null {
  if (value === "HIGH") return "[Strong visibility]";
  if (value === "MEDIUM") return "[Visible, but not dominant]";
  if (value === "LOW") return "[Needs stronger AI signals]";
  return null;
}
