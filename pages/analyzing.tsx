import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

interface StatusStep {
  label: string;
  status: "pending" | "active" | "complete" | "failed";
}

interface StatusResponse {
  job_id: string;
  status: "analyzing" | "scanning" | "deciding" | "complete" | "failed";
  current_step: string;
  steps: StatusStep[];
  error_message?: string | null;
}

export default function AnalyzingPage() {
  const router = useRouter();
  const jobId = useMemo(() => {
    const value = router.query.job_id;
    return typeof value === "string" ? value : null;
  }, [router.query.job_id]);
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const activeJobId = jobId;

    let active = true;
    let intervalId: number | null = null;

    async function loadStatus() {
      try {
        const response = await fetch(`/api/analyze/status?job_id=${encodeURIComponent(activeJobId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as StatusResponse | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : "Unable to load analysis status.");
        }

        if (!active) return;
        const statusPayload = payload as StatusResponse;
        setData(statusPayload);
        setError(statusPayload.error_message ?? null);

        if (statusPayload.status === "complete") {
          window.setTimeout(() => {
            void router.replace(`/result?id=${encodeURIComponent(activeJobId)}`);
          }, 650);
        }

        if (statusPayload.status === "failed" && intervalId !== null) {
          window.clearInterval(intervalId);
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load analysis status.");
      }
    }

    void loadStatus();
    intervalId = window.setInterval(() => {
      void loadStatus();
    }, 1500);

    return () => {
      active = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [jobId, router]);

  const steps = data?.steps ?? defaultSteps;
  const currentStep = data?.current_step || "Gathering the first market signals.";

  return (
    <>
      <Head>
        <title>REPPL // BUILDING YOUR BRIEF</title>
        <meta content="REPPL is assembling a calm, actionable market brief for your product." name="description" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-8 text-[var(--ink)] md:px-8">
        <section className="soft-panel w-full max-w-[840px] p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
            <div className="border-b border-[var(--ink)] pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <div className="terminal-label">[Building your market read]</div>
              <div className="mt-5 font-display text-5xl uppercase leading-none md:text-6xl">Hold on a moment.</div>
              <div className="mt-5 text-sm uppercase leading-8 text-[var(--ink-mid)]">
                We are scanning your product page, nearby competitors, offer changes, and AI shopping visibility to
                turn the noise into one clear brief.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="signal-chip">Usually under 1 minute</span>
                <span className="signal-chip">No extra steps</span>
              </div>
              <div className="mt-6 editorial-note">{currentStep}</div>
            </div>

            <div>
              {!jobId ? (
                <div className="terminal-panel p-5 text-sm uppercase">
                  <div>[No active scan found]</div>
                  <div className="mt-3 leading-7 text-[var(--ink-muted)]">
                    Start a new scan from the landing page and we will build a fresh report here.
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-start justify-between gap-4 border-b border-dashed border-[var(--ink)] pb-4 text-sm uppercase last:border-b-0 last:pb-0"
                  >
                    <div className="pr-3">
                      <span className="mr-3">[+]</span>
                      <span>{step.label}</span>
                    </div>
                    <StepStatus status={step.status} />
                  </div>
                ))}
              </div>

              {error ? (
                <div className="terminal-panel mt-8 p-5 text-sm uppercase">
                  <div>[We hit a problem]</div>
                  <div className="mt-3 text-[var(--ink-muted)]">{error}</div>
                  <Link className="terminal-button mt-5 inline-flex" href="/">
                    {"[Return To Landing Page >>>]"}
                  </Link>
                </div>
              ) : null}

              <div className="mt-8 text-xs uppercase leading-6 text-[var(--ink-muted)]">
                You can leave this tab open while REPPL finishes the brief.
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function StepStatus({ status }: { status: StatusStep["status"] }) {
  if (status === "complete") {
    return <span className="whitespace-nowrap">[Done]</span>;
  }

  if (status === "active") {
    return <span className="blink whitespace-nowrap">{"[In progress >>>]"}</span>;
  }

  if (status === "failed") {
    return <span className="whitespace-nowrap">[Needs attention]</span>;
  }

  return <span className="whitespace-nowrap text-[var(--ink-muted)]">[Queued]</span>;
}

const defaultSteps: StatusStep[] = [
  { label: "Identifying your product", status: "active" },
  { label: "Scanning nearby competitors", status: "pending" },
  { label: "Summarizing the strongest signal", status: "pending" },
  { label: "Checking AI shopping visibility", status: "pending" },
];
