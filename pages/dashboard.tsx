import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { CommandBar } from "../components/CommandBar";
import { CompetitorList } from "../components/CompetitorList";
import { DailyBriefCard } from "../components/DailyBriefCard";
import { IntegrationsBar } from "../components/IntegrationsBar";
import { SignalFeed } from "../components/SignalFeed";
import { SuggestionFeed } from "../components/SuggestionFeed";
import { TerminalEmptyState } from "../components/TerminalEmptyState";
import { getSignals } from "../lib/api";
import type { PaginatedResponse, SignalItem } from "../lib/types";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const productId = useMemo(() => {
    const value = router.query.product_id;
    return typeof value === "string" ? value : null;
  }, [router.query.product_id]);
  const { data, error, loading, triggerScanNow, connectSlack } = useDashboard(productId);
  const [signalLimit, setSignalLimit] = useState(20);
  const [signalFeed, setSignalFeed] = useState<PaginatedResponse<SignalItem> | null>(null);

  useEffect(() => {
    if (!productId) return;
    const activeProductId = productId;
    let active = true;
    async function loadSignals() {
      try {
        const response = await getSignals(activeProductId, signalLimit, 1);
        if (active) setSignalFeed(response);
      } catch {
        if (active) setSignalFeed(null);
      }
    }
    void loadSignals();
    return () => {
      active = false;
    };
  }, [productId, signalLimit, data?.brief?.generated_at, data?.is_processing]);

  if (!productId) {
    return (
      <TerminalEmptyState
        body="NO ACTIVE SURVEILLANCE DETECTED."
        cta="[<- INITIATE NEW MISSION]"
        href="/onboard"
        title="AWAITING MISSION PARAMETERS"
      />
    );
  }

  return (
    <>
      <Head>
        <title>REPPL // DASHBOARD</title>
        <meta content="Your unfair advantage. Delivered at 9AM." name="description" />
      </Head>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <CommandBar
          isProcessing={data?.is_processing ?? false}
          onScanNow={() => void triggerScanNow()}
          product={data?.product ?? null}
          stats={data?.stats ?? null}
        />
        <main className="mx-auto max-w-[1600px] px-0 pt-16">
          {error ? <div className="terminal-panel mx-4 mb-4 p-4 text-xs uppercase">[{error}]</div> : null}
          {loading && !data ? (
            <TerminalEmptyState
              body="AUTONOMOUS WEB AGENTS ARE LOADING YOUR SURVEILLANCE GRID."
              cta="[RETURN TO ONBOARD >>>]"
              href="/onboard"
              title="AWAITING TRANSMISSION"
            />
          ) : null}
          {data ? (
            <section className="grid gap-0 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="border-r border-[var(--ink)] p-4 md:p-6">
                <DailyBriefCard brief={data.brief} isProcessing={data.is_processing} product={data.product} />
                <div className="mt-4">
                  <CompetitorList competitors={data.competitors} isProcessing={data.is_processing} onRetry={() => void triggerScanNow()} />
                </div>
              </div>
              <div className="space-y-4 p-4 md:p-6">
                <IntegrationsBar integrations={data.integrations} onConnect={connectSlack} />
                <SignalFeed
                  onLoadMore={() => setSignalLimit((current) => current + 20)}
                  signals={signalFeed?.items ?? data.signals}
                  total={signalFeed?.total ?? data.signals.length}
                />
                <SuggestionFeed suggestions={data.suggestions} />
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </>
  );
}
