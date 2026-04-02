import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { MissionForm } from "../components/MissionForm";
import { PipelineTracker } from "../components/PipelineTracker";
import { analyzeProduct } from "../lib/api";
import type { AnalyzeProductPayload, AnalyzeProductResponse } from "../lib/types";
import { useDashboard } from "../hooks/useDashboard";

export default function OnboardPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalyzeProductResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { data } = useDashboard(analysis?.product_id ?? null);

  useEffect(() => {
    if (!analysis?.product_id || !data?.brief || data.is_processing || ready) return;
    setReady(true);
    const timer = window.setTimeout(() => {
      void router.push(`/dashboard?product_id=${encodeURIComponent(analysis.product_id)}`);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [analysis?.product_id, data, ready, router]);

  async function handleSubmit(payload: AnalyzeProductPayload) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await analyzeProduct(payload);
      setAnalysis(result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message.toUpperCase() : "REQUEST FAILED");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>REPPL // ONBOARD</title>
        <meta content="Stop finding out too late." name="description" />
      </Head>
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
        {!analysis ? <MissionForm error={error} loading={submitting} onSubmit={handleSubmit} /> : null}
        {analysis && !ready ? <PipelineTracker dashboard={data} /> : null}
        {ready ? (
          <section className="terminal-panel mx-auto max-w-3xl p-10 text-center">
            <div className="terminal-label">[TRANSMISSION RECEIVED *]</div>
            <div className="mt-6 font-display text-4xl uppercase">YOUR FIRST BRIEF IS READY.</div>
            <div className="mt-4 text-sm uppercase text-[var(--ink-muted)]">CHECK YOUR EMAIL. DASHBOARD LOADING...</div>
          </section>
        ) : null}
      </main>
    </>
  );
}
