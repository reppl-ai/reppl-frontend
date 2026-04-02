import { relativeTime, severityBadge } from "../lib/format";
import type { SignalItem } from "../lib/types";

interface SignalFeedProps {
  signals: SignalItem[];
  total: number;
  onLoadMore: () => void;
}

export function SignalFeed({ signals, total, onLoadMore }: SignalFeedProps) {
  return (
    <section className="terminal-panel reveal h-full p-0" style={{ animationDelay: "300ms" }}>
      <div className="terminal-row px-4 py-3">
        <span className="terminal-label">{"[SIGNALS INTERCEPTED >>>>>>>]"}</span>
      </div>
      <div className="max-h-[400px] overflow-auto">
        {!signals.length ? (
          <div className="terminal-copy px-4 py-6">
            <p>[NO SIGNALS INTERCEPTED]</p>
            <p className="mt-3 text-[var(--ink-muted)]">
              ............................................
            </p>
            <p className="mt-3 text-[var(--ink-muted)]">
              SIGNALS APPEAR AFTER SECOND SCAN. FIRST SCAN ESTABLISHES YOUR BASELINE.
            </p>
          </div>
        ) : null}
        {signals.map((signal, index) => (
          <article className="signal-entry slide-in border-b border-dashed border-[var(--ink)] px-4 py-4" key={signal.id} style={{ animationDelay: `${index * 40}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="terminal-copy font-bold">
                {severityBadge(signal.severity)} {signal.headline}
              </div>
              <div className="text-xs uppercase text-[var(--ink-muted)]">{relativeTime(signal.timestamp)}</div>
            </div>
            <div className="mt-2 text-sm text-[var(--ink-muted)]">{signal.detail}</div>
            {signal.old_value || signal.new_value ? (
              <div className="mt-2 text-xs uppercase text-[var(--ink-muted)]">
                {(signal.old_value || "NONE").toUpperCase()} -&gt; {(signal.new_value || "NONE").toUpperCase()}
              </div>
            ) : null}
            {signal.opportunity ? <div className="mt-2 text-xs uppercase">[{signal.opportunity}]</div> : null}
          </article>
        ))}
      </div>
      {signals.length < total ? (
        <div className="p-4">
          <button className="terminal-button w-full" onClick={onLoadMore} type="button">
            {"[LOAD MORE >>>]"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
