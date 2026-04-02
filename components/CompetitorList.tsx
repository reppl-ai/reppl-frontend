import { formatCurrency, relativeTime, statusStamp } from "../lib/format";
import type { CompetitorItem } from "../lib/types";

interface CompetitorListProps {
  competitors: CompetitorItem[];
  isProcessing: boolean;
  onRetry: () => void;
}

export function CompetitorList({ competitors, isProcessing, onRetry }: CompetitorListProps) {
  if (!competitors.length && isProcessing) {
    return (
      <div className="grid gap-0 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="terminal-panel p-5" key={index}>
            <div className="skeleton-line w-2/3" />
            <div className="mt-3 skeleton-line w-1/2" />
            <div className="mt-6 skeleton-line w-1/3" />
            <div className="mt-6 skeleton-line w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!competitors.length) {
    return (
      <div className="terminal-panel p-5">
        <div className="terminal-copy">[NO COMPETITOR ASSETS YET]</div>
        <div className="mt-3 text-sm uppercase text-[var(--ink-muted)]">
          REPPL AGENTS WILL POPULATE THIS GRID AFTER DISCOVERY COMPLETES.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-0 md:grid-cols-2">
      {competitors.map((competitor, index) => (
        <article
          className={`terminal-panel reveal p-5 ${competitor.highlight_signal_severity === "high" ? "border-l-4 border-l-[var(--ink)]" : ""}`}
          key={competitor.id}
          style={{ animationDelay: `${200 + index * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="terminal-label">ASSET ID: {competitor.competitor_name.toUpperCase()}</div>
              <a
                className="mt-2 inline-block text-xs text-[var(--ink-muted)] underline-offset-4 hover:underline"
                href={`https://${competitor.domain}`}
                rel="noreferrer"
                target="_blank"
              >
                {competitor.domain}
              </a>
            </div>
            <div className="terminal-label">{statusStamp(competitor.extraction_status)}</div>
          </div>
          <div className="terminal-divider" />
          {competitor.extraction_status === "pending" ? (
            <div className="space-y-3">
              <div className="skeleton-line w-1/2" />
              <div className="skeleton-line w-2/3" />
              <div className="terminal-copy text-[var(--ink-muted)]">{"[EXTRACTION IN PROGRESS >>>]_"}</div>
            </div>
          ) : (
            <>
              <div className="terminal-copy text-lg font-bold">
                CURRENT PRICE: {formatCurrency(competitor.current_price, competitor.currency)}
              </div>
              {competitor.original_price !== null ? (
                <div className="mt-1 text-sm text-[var(--ink-muted)]">
                  [DOWN FROM {formatCurrency(competitor.original_price, competitor.currency)}]
                </div>
              ) : null}
              {competitor.highlight_signal_headline ? (
                <div className="mt-2 text-sm font-bold uppercase">{competitor.highlight_signal_headline}</div>
              ) : null}
              <div className="terminal-divider" />
              <div className="terminal-label">ACTIVE OPERATIONS:</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {competitor.active_offers.length ? (
                  competitor.active_offers.map((offer) => (
                    <span className="offer-pill" key={`${offer.type}-${offer.summary}`}>
                      [{offer.type.toUpperCase()}: {offer.summary}]
                    </span>
                  ))
                ) : (
                  <span className="offer-pill">[NONE]</span>
                )}
                {competitor.subscription_discount?.summary ? (
                  <span className="offer-pill">[SUBSCRIPTION: {competitor.subscription_discount.summary}]</span>
                ) : null}
              </div>
              <div className="terminal-divider" />
              <div className="terminal-copy text-xs uppercase text-[var(--ink-muted)]">
                {competitor.in_stock === false ? "O OUT OF STOCK" : "O IN STOCK"}{" "}
                {competitor.shipping_threshold !== null
                  ? `// FREE SHIP: ${formatCurrency(competitor.shipping_threshold, competitor.currency)}`
                  : "// FREE SHIP: UNKNOWN"}{" "}
                // UPDATED {relativeTime(competitor.last_updated)}
              </div>
            </>
          )}
          {competitor.extraction_status === "failed" || competitor.extraction_status === "blocked" ? (
            <button className="terminal-button mt-4" onClick={onRetry} type="button">
              {"[RETRY EXTRACTION >>>]"}
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
