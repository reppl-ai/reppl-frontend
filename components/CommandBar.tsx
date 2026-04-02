import { relativeTime, uppercaseOrFallback } from "../lib/format";
import type { DashboardStats, ProductSummary } from "../lib/types";

interface CommandBarProps {
  product: ProductSummary | null;
  stats: DashboardStats | null;
  isProcessing: boolean;
  onScanNow: () => void;
}

export function CommandBar({ product, stats, isProcessing, onScanNow }: CommandBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-[var(--bg)] bg-[var(--ink)] text-[var(--bg)]">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 px-4 text-xs uppercase md:px-6">
        <div className="font-display text-xl tracking-[0.08em]">REPPL</div>
        <div className="hidden flex-1 items-center justify-center gap-2 overflow-hidden text-center md:flex">
          {product ? (
            <>
              <span>[{uppercaseOrFallback(product.product_name, "UNKNOWN PRODUCT")}]</span>
              <span>//</span>
              <span>[{uppercaseOrFallback(product.category, "GENERAL")}]</span>
              <span>//</span>
              <span>[{uppercaseOrFallback(product.brand, "UNKNOWN BRAND")}]</span>
              {isProcessing ? <span className="blink">{"[SCANNING >>>]_"}</span> : null}
            </>
          ) : (
            <span>[AWAITING MISSION PARAMETERS]</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline">
            LAST SCAN: [{product?.last_scanned_at ? relativeTime(product.last_scanned_at) : "NEVER"}]
          </span>
          <button className="terminal-button invert" disabled={isProcessing || !product} onClick={onScanNow} type="button">
            {isProcessing ? "[SCANNING >>>]_" : "[SCAN NOW >>>]"}
          </button>
        </div>
      </div>
      <div className="hidden border-t border-[var(--bg)] px-6 py-2 text-[11px] uppercase md:block">
        {stats ? `[${stats.competitors_tracked} COMPETITORS] [${stats.signals_today} SIGNALS] [${stats.suggestions_count} SUGGESTIONS]` : "[NO ACTIVE SURVEILLANCE]"}
      </div>
    </header>
  );
}
