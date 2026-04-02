import { useMemo } from "react";

import { formatClock, formatDate } from "../lib/format";
import type { DailyBrief, ProductSummary } from "../lib/types";
import { useTypewriter } from "../hooks/useTypewriter";

interface DailyBriefCardProps {
  brief: DailyBrief | null;
  product: ProductSummary | null;
  isProcessing: boolean;
}

export function DailyBriefCard({ brief, product, isProcessing }: DailyBriefCardProps) {
  const documentText = useMemo(() => {
    if (!brief || !product) return "";
    return [
      `[TRANSMISSION RECEIVED - ${formatClock(brief.generated_at)} HRS]`,
      "",
      `REPPL DAILY BRIEF .......... ${formatDate(brief.brief_date)}`,
      `OPERATOR: ${(product.brand || product.product_name || "UNKNOWN").toUpperCase()} // ${(product.category || "GENERAL").toUpperCase()}`,
      "CLASSIFICATION: EYES ONLY",
      "----------------------------------------",
      "",
      "MARKET SUMMARY",
      brief.analyst_summary,
      "",
      "----------------------------------------",
      "",
      "COMMAND RECOMMENDATION",
      brief.daily_recommendation,
      "",
      "----------------------------------------",
      "",
      `FIELD INTEL: ${brief.signals.length} SIGNALS  ${brief.threats.length} THREATS  ${brief.opportunities.length} OPPORTUNITIES`,
      "",
      "[TRANSMISSION ENDS] ////////////////////",
    ].join("\n");
  }, [brief, product]);

  const typedDocument = useTypewriter(documentText, `${brief?.id ?? "none"}-${brief?.generated_at ?? "none"}`);

  return (
    <section className="reveal" style={{ animationDelay: "100ms" }}>
      <div className="terminal-panel border-l-2 border-l-[var(--ink)]">
        <div className="terminal-row">
          <span className="terminal-label">[DAILY BRIEF]</span>
          <span className="terminal-label">
            {brief ? `[${formatDate(brief.brief_date)}] [GENERATED *]` : "[AWAITING TRANSMISSION >>>]_"}
          </span>
        </div>
        {!brief && isProcessing ? (
          <div className="space-y-3 p-5">
            <div className="skeleton-line w-3/4" />
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-5/6" />
            <div className="skeleton-line w-2/3" />
          </div>
        ) : null}
        {!brief && !isProcessing ? (
          <div className="terminal-copy p-5">
            <p>[TRANSMISSION FAILED !]</p>
            <p className="mt-3 text-[var(--ink-muted)]">INTELLIGENCE ENGINE ENCOUNTERED AN ERROR.</p>
          </div>
        ) : null}
        {brief ? <pre className="type-block p-5">{typedDocument}</pre> : null}
      </div>
      <div className="terminal-panel mt-3 flex flex-wrap gap-6 p-4 text-xs uppercase">
        <span>
          EMAIL:{" "}
          {brief?.email_sent && brief.email_sent_at ? `[SENT * ${formatClock(brief.email_sent_at)}]` : "[PENDING ...]"}
        </span>
        <span>
          SLACK:{" "}
          {brief?.slack_sent && brief.slack_sent_at
            ? `[SENT * ${formatClock(brief.slack_sent_at)}]`
            : product?.slack_webhook_url
              ? "[PENDING ...]"
              : "[NOT CONFIGURED]"}
        </span>
      </div>
    </section>
  );
}
