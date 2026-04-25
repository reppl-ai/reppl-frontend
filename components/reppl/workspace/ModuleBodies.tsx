import { useState } from "react";

import { MOCK_ANALYSIS, MOCK_COMPETITORS } from "../../../lib/reppl/mockData";
import type { RepplModuleId, RepplCompany } from "../../../lib/reppl/types";

const ink = "#0A0A0A";
const muted = "#7A7A7A";

type Props = {
  id: RepplModuleId;
  company: RepplCompany;
  expanded: boolean;
  analyzing: boolean;
  onRunAnalysis: () => void;
  onOpenProduct: (competitorId: string) => void;
  shopifyConnected: boolean;
  onConnectShopify: () => void;
};

export function ModuleCollapsed({
  id,
  company,
  analyzing,
  onRunAnalysis,
  shopifyConnected,
}: Pick<Props, "id" | "company" | "analyzing" | "onRunAnalysis" | "shopifyConnected">) {
  if (id === "decision") {
    return (
      <p className="text-[0.7rem] leading-relaxed" style={{ color: muted }}>
        LAST RUN: {company.lastAnalysisAt ? "2 DAYS AGO" : "—"} //{" "}
        {analyzing ? (
          <span className="text-[#0A0A0A]">[ANALYZING &gt;&gt;&gt;]</span>
        ) : (
          <button className="bg-transparent p-0" style={{ color: ink }} type="button" onClick={onRunAnalysis}>
            [RUN NOW &gt;&gt;&gt;]
          </button>
        )}
      </p>
    );
  }
  if (id === "competitors") {
    return (
      <p className="text-[0.7rem]" style={{ color: muted }}>
        {MOCK_COMPETITORS.length} COMPETITORS TRACKED // <span className="text-[#0A0A0A]">[ADD &gt;&gt;&gt;]</span>
      </p>
    );
  }
  if (id === "aiSearch") {
    return (
      <p className="text-[0.7rem]" style={{ color: muted }}>
        YOUR RANK: #3 // LAST CHECKED: 2 DAYS AGO
      </p>
    );
  }
  if (id === "signal") {
    return (
      <p className="text-[0.7rem]" style={{ color: muted }}>
        MODE: AUTOMATIC // CHANNELS: 2
      </p>
    );
  }
  return (
    <p className="text-[0.7rem]" style={{ color: muted }}>
      {MOCK_COMPETITORS.length} COMPETITORS // SHOPIFY: {shopifyConnected ? "CONNECTED" : "NOT"}
    </p>
  );
}

export function ModuleExpanded(props: Props) {
  if (!props.expanded) return null;
  if (props.id === "decision") return <DecisionBody {...props} />;
  if (props.id === "competitors") return <CompetitorsBody />;
  if (props.id === "aiSearch") return <AiSearchBody />;
  if (props.id === "signal") return <SignalBody />;
  return <ActionableBody {...props} />;
}

function DecisionBody({ company, analyzing, onRunAnalysis }: Props) {
  if (!company.lastAnalysisAt && !analyzing) {
    return (
      <div className="px-0 py-6 text-center">
        <p className="text-[0.7rem]">[NO ANALYSIS RUN]</p>
        <p className="mt-1 text-[0.6rem]" style={{ color: muted }}>
          {"..........................................."}
        </p>
        <button
          className="reppl-btn-solid mx-auto mt-4 w-full max-w-xs text-[0.65rem]"
          type="button"
          onClick={onRunAnalysis}
        >
          [RUN ANALYSIS &gt;&gt;&gt;]
        </button>
      </div>
    );
  }
  if (analyzing) {
    return (
      <p className="py-3 text-center text-[0.7rem]" style={{ color: muted }}>
        [ANALYZING &gt;&gt;&gt;]
        <span className="blink">_</span>
      </p>
    );
  }
  const a = MOCK_ANALYSIS;
  return (
    <div className="space-y-4 pb-2">
      <div>
        <p className="text-[0.6rem] tracking-[0.15em]">PRIMARY ISSUE</p>
        <p className="text-[0.6rem]">{"─────────────"}</p>
        <p className="mt-1 font-display text-3xl uppercase leading-tight" style={{ color: ink }}>{`"${a.primaryIssue}"`}</p>
      </div>
      <div>
        <p className="text-[0.6rem] tracking-widest" style={{ color: muted }}>{`WHY ${">".repeat(12)}`}</p>
        <ul className="mt-1 space-y-0.5 text-[0.7rem]">
          {a.why.map((w) => (
            <li key={w}>◆ {w}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[0.6rem] tracking-widest" style={{ color: muted }}>{`DIRECTION ${">".repeat(8)}`}</p>
        <ol className="mt-1 list-decimal pl-4 text-[0.7rem]">
          {a.direction.map((d, i) => (
            <li key={d}>
              0{i + 1} / {d}
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-[0.6rem] tracking-widest" style={{ color: muted }}>
          WE CONSIDERED {".".repeat(10)}
        </p>
        {a.optionsConsidered.map((o) => (
          <p key={o.text} className="text-[0.7rem]">
            {o.text} {o.selected ? "✓" : "✗"}
          </p>
        ))}
      </div>
      <div>
        <p className="text-[0.6rem]">{"—".repeat(18)}</p>
        <p className="text-[0.6rem]">AI DISCOVERABILITY</p>
        <p className="mt-1 font-display text-5xl" style={{ color: ink }}>{`[${a.discoverability}]`}</p>
        <ul className="mt-1 space-y-0.5 text-[0.7rem]">
          <li>· {a.aiReason[0]}</li>
          <li>· {a.aiReason[1]}</li>
        </ul>
      </div>
      <button className="reppl-btn-solid w-full text-[0.65rem]" type="button" onClick={onRunAnalysis}>
        [RUN NEW ANALYSIS &gt;&gt;&gt;]
      </button>
    </div>
  );
}

function CompetitorsBody() {
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-3 pb-1">
      <button className="reppl-border-solid w-full border border-[#0A0A0A] py-1.5 text-[0.65rem]" type="button">
        [+ ADD COMPETITOR &gt;&gt;&gt;]
      </button>
      <div className="flex flex-wrap gap-2">
        <input className="reppl-input min-w-0 flex-1 text-[0.65rem]" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="competitor url" />
        <button className="reppl-border-solid border border-[#0A0A0A] px-2 py-1 text-[0.6rem]" type="button">
          [ADD]
        </button>
      </div>
      <div className="space-y-2">
        {MOCK_COMPETITORS.map((c) => (
          <div key={c.id} className="reppl-border-solid border p-2 text-[0.65rem] transition-colors duration-150 hover:bg-[rgba(10,10,10,0.04)]">
            <div className="flex items-start justify-between gap-1">
              <span>[{c.name}]</span>
              <span>[REMOVE ✗]</span>
            </div>
            <p className="mt-1" style={{ color: muted }}>{c.url}</p>
            <p className="mt-1 border-t border-dashed border-[#0A0A0A] pt-1">
              PRICE: {c.price} OFFERS: ✦ {c.offers}
            </p>
            <p className="mt-0.5" style={{ color: muted }}>{`LAST SCAN: ${c.lastScanHours} hrs ago`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiSearchBody() {
  const total = 12;
  const you = 3;
  return (
    <div className="space-y-4 pb-1">
      <div>
        <p className="text-[0.6rem]" style={{ color: muted }}>
          YOUR PRODUCT
        </p>
        <p className="mt-1 font-display text-5xl">#3 OF {total}</p>
        <p className="mt-2 font-mono text-[0.6rem]">{"■ ".repeat(you) + "□ ".repeat(total - you)}</p>
        <p className="mt-0.5 text-[0.55rem] text-[#0A0A0A]">▲ YOU</p>
      </div>
      <div>
        <p className="text-[0.6rem]">COMPETITOR RANKS</p>
        {MOCK_COMPETITORS.map((c) => (
          <p key={c.id} className="flex justify-between text-[0.65rem]">
            <span>{c.name}</span>
            <span>{".".repeat(6)}</span>
            <span>#2</span>
          </p>
        ))}
      </div>
      <div>
        <p className="text-[0.6rem] tracking-widest" style={{ color: muted }}>{`IMPROVE RANKING ${">".repeat(6)}`}</p>
        <p className="text-[0.65rem]">◆ tighten PDP tokens</p>
        <p className="text-[0.65rem]">◆ add bundle above fold</p>
        <p className="mt-2 text-[0.6rem] tracking-widest" style={{ color: muted }}>{`MAINTAIN PERFORMANCE ${">".repeat(3)}`}</p>
        <p className="text-[0.65rem]">◆ keep reviews velocity</p>
        <p className="text-[0.65rem]">◆ cap ad drift</p>
      </div>
      <button className="reppl-border-solid w-full border border-[#0A0A0A] bg-[#0A0A0A] py-2 text-[0.65rem] text-[#F5F4EF]" type="button">
        [RECHECK RANKING &gt;&gt;&gt;]
      </button>
    </div>
  );
}

function SignalBody() {
  const [mode, setMode] = useState<"auto" | "man">("auto");
  return (
    <div className="space-y-3 pb-1">
      <div className="flex flex-wrap items-center gap-2 text-[0.65rem]">
        <span>MODE:</span>
        <button
          className={mode === "auto" ? "bg-[#0A0A0A] px-2 py-0.5 text-[#F5F4EF]" : "reppl-border-solid border px-2 py-0.5"}
          type="button"
          onClick={() => setMode("auto")}
        >
          [AUTOMATIC]
        </button>
        <button
          className={mode === "man" ? "bg-[#0A0A0A] px-2 py-0.5 text-[#F5F4EF]" : "reppl-border-solid border px-2 py-0.5"}
          type="button"
          onClick={() => setMode("man")}
        >
          [MANUAL]
        </button>
      </div>
      <p className="border-t border-dashed border-[#0A0A0A] pt-2 text-[0.6rem]">CHANNELS {">".repeat(12)}</p>
      {["SLACK", "TELEGRAM", "WHATSAPP", "EMAIL"].map((ch) => (
        <div
          key={ch}
          className="reppl-border-solid flex items-center justify-between border px-2 py-1 text-[0.65rem] hover:bg-[rgba(10,10,10,0.04)]"
        >
          <span>◆ {ch}</span>
          <span>{ch === "SLACK" || ch === "EMAIL" ? "[CONNECTED ✦]" : "[CONNECT >>>]"}</span>
        </div>
      ))}
      <p className="border-t border-dashed border-[#0A0A0A] pt-2 text-[0.6rem]">COMMUNITIES {">".repeat(8)}</p>
      <p className="text-[0.6rem]">[+ ADD COMMUNITY]</p>
      <p className="border-t border-dashed border-[#0A0A0A] pt-2 text-[0.6rem]">CONTACTS {">".repeat(10)}</p>
      <p className="text-[0.6rem]">[+ ADD CONTACT]</p>
      <div className="border-t border-dashed border-[#0A0A0A] pt-2">
        <button className="reppl-btn-solid w-full text-[0.65rem]" type="button">
          [SEND SIGNAL &gt;&gt;&gt;]
        </button>
        <p className="mt-2 text-center text-[0.55rem] text-[#7A7A7A]">USAGE-BASED PRICING // CREDITS REMAINING: 40</p>
        <button className="mt-1 w-full border border-dashed border-[#0A0A0A] py-1.5 text-[0.6rem]" type="button">
          [BUY MORE CREDITS &gt;&gt;&gt;]
        </button>
      </div>
    </div>
  );
}

function ActionableBody({ shopifyConnected, onConnectShopify, onOpenProduct }: Props) {
  if (!shopifyConnected) {
    return (
      <div className="space-y-3 py-1 text-center">
        <button className="reppl-btn-solid w-full text-[0.65rem]" type="button" onClick={onConnectShopify}>
          [CONNECT SHOPIFY &gt;&gt;&gt;]
        </button>
        <p className="text-[0.6rem] leading-relaxed" style={{ color: muted }}>
          Connect your store to enable competitor revenue intelligence and AI product actions.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3 pb-1">
      <p className="text-[0.6rem]">COMPETITOR INTELLIGENCE {">".repeat(4)}</p>
      {MOCK_COMPETITORS.map((c) => (
        <div key={c.id} className="reppl-border-solid border p-2 text-[0.65rem]">
          <p>[{c.name}]</p>
          <p className="mt-0.5" style={{ color: muted }}>{c.url}</p>
          <p className="mt-1 border-t border-dashed border-[#0A0A0A] pt-1">ADS RUNNING: YES ✦</p>
          <p>EST. MONTHLY REV: $12k</p>
          <p>ARR / MRR: $90k / $7k</p>
          <p>TOP PRODUCT: hero sku</p>
        </div>
      ))}
      <p className="text-[0.6rem]">PRODUCT ACTIONS {">".repeat(6)}</p>
      <button
        className="w-full border border-dashed border-[#0A0A0A] py-1.5 text-[0.65rem]"
        type="button"
        onClick={() => onOpenProduct(MOCK_COMPETITORS[0]?.id ?? "c1")}
      >
        [+ ADD PRODUCT TO STORE &gt;&gt;&gt;]
      </button>
    </div>
  );
}
