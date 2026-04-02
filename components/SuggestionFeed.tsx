import { categoryBadge, confidenceBadge } from "../lib/format";
import type { SuggestionItem } from "../lib/types";

interface SuggestionFeedProps {
  suggestions: SuggestionItem[];
}

export function SuggestionFeed({ suggestions }: SuggestionFeedProps) {
  return (
    <section className="terminal-panel reveal p-0" style={{ animationDelay: "400ms" }}>
      <div className="terminal-row px-4 py-3">
        <span className="terminal-label">{"[COMMAND SUGGESTIONS >>>>>>>]"}</span>
      </div>
      <div className="space-y-0">
        {!suggestions.length ? (
          <div className="terminal-copy px-4 py-6 text-[var(--ink-muted)]">
            SUGGESTIONS APPEAR AFTER YOUR FIRST FULL SCAN COMPLETES.
          </div>
        ) : null}
        {suggestions.map((suggestion) => (
          <article className="border-b border-dashed border-[var(--ink)] p-4 transition-all duration-150 hover:border-2" key={suggestion.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="terminal-label">{categoryBadge(suggestion.category)}</span>
              <span className="terminal-label">{confidenceBadge(suggestion.confidence)}</span>
            </div>
            <div className="mt-4 text-sm font-bold uppercase">{suggestion.headline}</div>
            <div className="mt-4 text-sm text-[var(--ink-mid)]">{suggestion.suggestion_text}</div>
            <div className="mt-4 text-xs uppercase text-[var(--ink-muted)]">
              ACTION: {suggestion.urgency.replace("_", " ").toUpperCase()} // BASED ON {suggestion.based_on_signals.length} SIGNALS
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
