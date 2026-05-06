import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { getCompany, loadCompanyWorkspace, patchCompany, saveCompanyWorkspace } from "../../../lib/api";
import { MOCK_ANALYSIS, MOCK_COMPETITORS } from "../../../lib/reppl/mockData";
import type { RepplCompany, RepplModuleId, RepplNodePosition, RepplWorkspaceState } from "../../../lib/reppl/types";
import { ProductIntelligencePanel } from "./ProductIntelligencePanel";

const MOBILE_ORDER: RepplModuleId[] = ["decision", "marketSignals", "competitors", "aiSearch", "actionable", "signal"];

const titles: Record<RepplModuleId, string> = {
  decision: "[◆ DECISION ENGINE]",
  competitors: "[◆ COMPETITORS]",
  marketSignals: "[◆ MARKET SIGNALS]",
  aiSearch: "[◆ AI DISCOVERABILITY]",
  signal: "[◆ SIGNAL DISTRIBUTION]",
  actionable: "[◆ ACTIONABLE]",
};

const FIXED_LAYOUT: Record<RepplModuleId, { x: number; y: number; w: number }> = {
  decision: { x: 420, y: 80, w: 400 },
  competitors: { x: 56, y: 238, w: 320 },
  actionable: { x: 884, y: 238, w: 320 },
  marketSignals: { x: 56, y: 520, w: 320 },
  aiSearch: { x: 884, y: 520, w: 320 },
  signal: { x: 460, y: 704, w: 320 },
};

const defaultPositions = (): Record<RepplModuleId, RepplNodePosition> => ({
  decision: { x: FIXED_LAYOUT.decision.x, y: FIXED_LAYOUT.decision.y },
  competitors: { x: FIXED_LAYOUT.competitors.x, y: FIXED_LAYOUT.competitors.y },
  actionable: { x: FIXED_LAYOUT.actionable.x, y: FIXED_LAYOUT.actionable.y },
  marketSignals: { x: FIXED_LAYOUT.marketSignals.x, y: FIXED_LAYOUT.marketSignals.y },
  aiSearch: { x: FIXED_LAYOUT.aiSearch.x, y: FIXED_LAYOUT.aiSearch.y },
  signal: { x: FIXED_LAYOUT.signal.x, y: FIXED_LAYOUT.signal.y },
});

const signals = [
  { mark: "●", severity: "HIGH", text: "Ustraa dropped price 18%", ago: "2h ago" },
  { mark: "◆", severity: "MED", text: "Bundle launched: Man Matters", ago: "4h ago" },
  { mark: "·", severity: "LOW", text: "Shipping threshold changed", ago: "6h ago" },
];

type Props = { companyId: string };

export function WorkspaceClient({ companyId }: Props) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [company, setCompany] = useState<RepplCompany | null | undefined>(undefined);
  const [active, setActive] = useState<RepplModuleId>("decision");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const [shopify, setShopify] = useState(true);
  const [productOpen, setProductOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [expanded, setExpanded] = useState<Record<RepplModuleId, boolean>>({
    decision: true,
    competitors: false,
    marketSignals: false,
    aiSearch: false,
    actionable: false,
    signal: false,
  });
  const [positions, setPositions] = useState<Record<RepplModuleId, RepplNodePosition>>(() => defaultPositions());
  const [dragging, setDragging] = useState<{
    id: RepplModuleId;
    startX: number;
    startY: number;
    startPos: RepplNodePosition;
  } | null>(null);
  const [focused, setFocused] = useState<RepplModuleId | null>(null);
  const [updateTarget, setUpdateTarget] = useState(() => Date.now() + 12 * 60 * 60 * 1000);
  const [countdown, setCountdown] = useState("12:00:00");
  const [updating, setUpdating] = useState<RepplModuleId | null>(null);
  const [updated, setUpdated] = useState<RepplModuleId | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const updateTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setCompany(undefined);
      setWorkspaceLoaded(false);
      try {
        const [nextCompany, workspace] = await Promise.all([
          getCompany(companyId),
          loadCompanyWorkspace(companyId),
        ]);
        if (!active) return;
        setCompany(nextCompany);
        setPositions(mergePositions(workspace));
        setExpanded((current) => ({ ...current, ...workspace.expanded }));
        setWorkspaceLoaded(true);
      } catch {
        if (active) {
          setCompany(null);
          setWorkspaceLoaded(true);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!workspaceLoaded || !company) return;
    const timer = window.setTimeout(() => {
      void saveCompanyWorkspace(companyId, {
        positions,
        connections: [],
        expanded,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [companyId, company, expanded, positions, workspaceLoaded]);

  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return;
    const decision = FIXED_LAYOUT.decision;
    setPan({
      x: Math.round(window.innerWidth / 2 - decision.x - decision.w / 2),
      y: 36,
    });
  }, [companyId, isMobile]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocused(null);
        setBriefOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runLiveUpdate = useCallback(() => {
    if (updateTimer.current) window.clearTimeout(updateTimer.current);
    setAnalyzing(true);
    const sequence: RepplModuleId[] = ["competitors", "marketSignals", "decision", "aiSearch", "actionable", "signal"];
    sequence.forEach((id, index) => {
      window.setTimeout(() => {
        setUpdating(id);
        setUpdated(null);
      }, index * 650);
      window.setTimeout(() => {
        setUpdating(null);
        setUpdated(id);
      }, index * 650 + 520);
    });
    updateTimer.current = window.setTimeout(() => {
      setAnalyzing(false);
      setUpdated(null);
      void patchCompany(companyId, { lastAnalysisAt: new Date().toISOString() }).then(setCompany).catch(() => {});
    }, sequence.length * 650 + 2500);
  }, [companyId]);

  useEffect(() => {
    const tick = () => {
      const ms = updateTarget - Date.now();
      if (ms <= 0) {
        setCountdown("00:00:00");
        runLiveUpdate();
        setUpdateTarget(Date.now() + 12 * 60 * 60 * 1000);
        return;
      }
      setCountdown(formatDuration(ms));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [runLiveUpdate, updateTarget]);

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      if (isMobile || !event.ctrlKey) return;
      event.preventDefault();
      setZoom((current) => Math.min(1.5, Math.max(0.5, current - event.deltaY * 0.001)));
    },
    [isMobile]
  );

  const onCanvasDown = (event: React.PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.dataset.canvas !== "1" || isMobile) return;
    event.preventDefault();
    if (focused) {
      setFocused(null);
      return;
    }
    setPanning({ startX: event.clientX, startY: event.clientY, startPanX: pan.x, startPanY: pan.y });
  };

  const onCanvasMove = (event: React.PointerEvent) => {
    if (!panning) return;
    setPan({
      x: panning.startPanX + (event.clientX - panning.startX),
      y: panning.startPanY + (event.clientY - panning.startY),
    });
  };

  const onCanvasUp = () => setPanning(null);

  const onNodeHeaderDown = (event: React.PointerEvent, id: RepplModuleId) => {
    if (isMobile) return;
    event.preventDefault();
    event.stopPropagation();
    setDragging({
      id,
      startX: event.clientX,
      startY: event.clientY,
      startPos: { ...positions[id] },
    });
  };

  useEffect(() => {
    if (!dragging) return;
    const snap = (value: number) => Math.round(value / 24) * 24;
    const onMove = (event: PointerEvent) => {
      const dx = (event.clientX - dragging.startX) / zoom;
      const dy = (event.clientY - dragging.startY) / zoom;
      setPositions((current) => ({
        ...current,
        [dragging.id]: {
          x: snap(dragging.startPos.x + dx),
          y: snap(dragging.startPos.y + dy),
        },
      }));
    };
    const onUp = () => setDragging(null);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, zoom]);

  const focusNode = (id: RepplModuleId) => {
    if (isMobile) return;
    setExpanded((current) => ({ ...current, [id]: true }));
    setFocused(id);
    const pos = positions[id];
    const width = FIXED_LAYOUT[id].w;
    const nextZoom = id === "decision" ? 1.35 : 1.55;
    setZoom(nextZoom);
    setPan({
      x: Math.round(window.innerWidth / 2 - (pos.x + width / 2) * nextZoom),
      y: Math.round(window.innerHeight / 2 - (pos.y + 180) * nextZoom),
    });
  };

  if (company === undefined) {
    return (
      <div className="reppl-shell flex min-h-screen items-center justify-center p-4">
        <p className="font-mono text-sm text-[#7A7A7A]">[LOADING...]</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="reppl-shell flex min-h-screen items-center justify-center p-4">
        <p className="font-mono text-sm">
          [NOT FOUND] // <Link href="/companies" className="text-[#0A0A0A]">[COMPANIES]</Link>
        </p>
      </div>
    );
  }

  const boardStyle: React.CSSProperties = isMobile
    ? {}
    : {
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: "0 0",
        transition: panning || dragging ? "none" : "transform 400ms ease",
      };

  return (
    <div className="reppl-shell flex min-h-screen flex-col" style={{ background: "#F5F4EF" }}>
      <header className="flex h-12 shrink-0 items-center justify-between bg-[#0A0A0A] px-3 text-xs text-[#F5F4EF] md:px-4">
        <div className="min-w-0 truncate font-mono tracking-[0.08em]">
          ✦ REPPL // <span>[{company.name.toUpperCase()}]</span>
        </div>
        <div className="hidden font-mono text-[0.6rem] sm:block">NEXT UPDATE IN: [{analyzing ? "UPDATING >>>" : countdown}]</div>
        <div className="flex items-center gap-2">
          <button
            className="border border-[#F5F4EF] px-2 py-0.5 font-mono text-[0.6rem] hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"
            type="button"
            onClick={() => setBriefOpen(true)}
          >
            [VIEW BRIEF &gt;&gt;&gt;]
          </button>
          <Link href="/companies" className="font-mono text-[0.6rem] text-[#F5F4EF] hover:underline">
            [EXIT]
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          {isMobile ? (
            <div className="flex-1 space-y-3 overflow-y-auto p-3 pb-16">
              {MOBILE_ORDER.map((id) => (
                <BriefNode
                  key={id}
                  company={company}
                  countdown={countdown}
                  expanded={expanded[id]}
                  id={id}
                  onDoubleClick={() => {}}
                  onHeaderPointerDown={() => {}}
                  onConnectShopify={() => setShopify(true)}
                  onOpenProduct={() => setProductOpen(true)}
                  onRunAnalysis={runLiveUpdate}
                  onToggle={() => setExpanded((current) => ({ ...current, [id]: !current[id] }))}
                  shopifyConnected={shopify}
                  statusOverride={statusOverride(id, updating, updated)}
                />
              ))}
            </div>
          ) : (
            <div
              className={
                "reppl-canvas-bg relative min-h-[560px] flex-1 cursor-grab overflow-hidden transition-opacity duration-200 active:cursor-grabbing " +
                (productOpen ? "opacity-30" : "opacity-100")
              }
              data-canvas="1"
              onPointerDown={onCanvasDown}
              onPointerMove={onCanvasMove}
              onPointerUp={onCanvasUp}
              onPointerLeave={onCanvasUp}
              onWheel={onWheel}
            >
              <div className="absolute left-0 top-0 h-[980px] w-[1260px] will-change-transform" data-canvas="1" style={boardStyle}>
                <FlowLines expanded={expanded} positions={positions} />
                {(["competitors", "marketSignals", "decision", "aiSearch", "actionable", "signal"] as RepplModuleId[]).map((id) => {
                  const position = positions[id];
                  const isDimmed = focused && focused !== id;
                  return (
                    <div
                      key={id}
                      className="absolute z-10 transition-[opacity,transform] duration-300 ease-out"
                      style={{
                        left: position.x,
                        opacity: isDimmed ? 0.2 : 1,
                        top: position.y,
                        transform: focused === id ? "scale(1.02)" : "scale(1)",
                        width: FIXED_LAYOUT[id].w,
                      }}
                    >
                      <BriefNode
                        company={company}
                        countdown={countdown}
                        expanded={expanded[id]}
                        id={id}
                        onDoubleClick={() => focusNode(id)}
                        onHeaderPointerDown={(event) => onNodeHeaderDown(event, id)}
                        onConnectShopify={() => setShopify(true)}
                        onOpenProduct={() => setProductOpen(true)}
                        onRunAnalysis={runLiveUpdate}
                        onToggle={() => setExpanded((current) => ({ ...current, [id]: !current[id] }))}
                        shopifyConnected={shopify}
                        statusOverride={statusOverride(id, updating, updated)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex items-end gap-2">
              <div className="reppl-minimap reppl-border-solid pointer-events-auto flex items-center justify-center font-mono text-[0.5rem] text-[#7A7A7A]">
                MINIMAP
              </div>
              <div className="pointer-events-auto border border-[#0A0A0A] bg-[#F5F4EF] px-2 py-0.5 font-mono text-[0.6rem]">[ZOOM: {Math.round(zoom * 100)}%]</div>
            </div>
          )}
        </div>

        <ProductIntelligencePanel open={productOpen} onClose={() => setProductOpen(false)} />
      </div>

      {isMobile ? (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-12 border-t border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F4EF]">
          {[
            ["decision", "BRIEF"],
            ["marketSignals", "MARKET"],
            ["actionable", "ACTION"],
            ["signal", "SIGNALS"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={active === id ? "flex flex-1 items-center justify-center font-mono text-[0.55rem] underline" : "flex flex-1 items-center justify-center font-mono text-[0.55rem]"}
              type="button"
              onClick={() => {
                setActive(id as RepplModuleId);
                document.getElementById(`m-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              ◆ {label}
            </button>
          ))}
        </nav>
      ) : null}

      <BriefOverlay company={company} open={briefOpen} onClose={() => setBriefOpen(false)} />
    </div>
  );
}

function BriefNode({
  id,
  company,
  expanded,
  countdown,
  statusOverride,
  shopifyConnected,
  onDoubleClick,
  onHeaderPointerDown,
  onToggle,
  onRunAnalysis,
  onConnectShopify,
  onOpenProduct,
}: {
  id: RepplModuleId;
  company: RepplCompany;
  expanded: boolean;
  countdown: string;
  statusOverride: string | null;
  shopifyConnected: boolean;
  onDoubleClick: () => void;
  onHeaderPointerDown: (event: React.PointerEvent) => void;
  onToggle: () => void;
  onRunAnalysis: () => void;
  onConnectShopify: () => void;
  onOpenProduct: () => void;
}) {
  return (
    <section className="reppl-node w-full overflow-hidden transition-[height] duration-300 ease-out" id={`m-${id}`}>
      <div
        className={(updatingStatus(statusOverride) ? "reppl-pulse " : "") + "flex h-12 items-center justify-between gap-3 bg-[#0A0A0A] px-3 text-[#F5F4EF]"}
        onDoubleClick={onDoubleClick}
        onPointerDown={onHeaderPointerDown}
      >
        <span className="min-w-0 flex-1 truncate font-mono text-[0.62rem]">✦ {titles[id]}</span>
        <span className="shrink-0 truncate font-mono text-[0.58rem] text-[#F5F4EF]">{statusOverride ?? collapsedStatus(id, company, shopifyConnected)}</span>
        <button
          className="shrink-0 bg-transparent font-mono text-[0.65rem] text-[#F5F4EF]"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onToggle}
        >
          {expanded ? "[▲]" : "[▼]"}
        </button>
      </div>
      {expanded ? (
        <div className="reppl-node-content border-t border-[#0A0A0A] p-5">
            {id === "competitors" ? <CompetitorsNode /> : null}
            {id === "marketSignals" ? <MarketSignalsNode countdown={countdown} /> : null}
            {id === "decision" ? <DecisionNode company={company} onRunAnalysis={onRunAnalysis} running={statusOverride === "[UPDATING >>>]"} /> : null}
            {id === "aiSearch" ? <AiSearchNode /> : null}
            {id === "actionable" ? <ActionableNode connected={shopifyConnected} onConnect={onConnectShopify} onOpenProduct={onOpenProduct} /> : null}
            {id === "signal" ? <SignalDistributionNode countdown={countdown} /> : null}
        </div>
      ) : null}
    </section>
  );
}

function CompetitorsNode() {
  return (
    <div className="space-y-3">
      <button className="reppl-btn-solid text-[0.65rem]" type="button">[+ ADD COMPETITOR &gt;&gt;&gt;]</button>
      <div className="grid grid-cols-[minmax(0,1fr)_44px_62px_48px_24px] gap-2 font-mono text-[0.56rem] text-[#7A7A7A]">
        <span>BRAND</span>
        <span>PRICE</span>
        <span>OFFER</span>
        <span>STOCK</span>
        <span />
      </div>
      <div className="space-y-2 font-mono text-[0.62rem]">
        {MOCK_COMPETITORS.map((competitor, index) => (
          <div key={competitor.id} className="grid grid-cols-[minmax(0,1fr)_44px_62px_48px_24px] gap-2 border-b border-dashed border-[#0A0A0A] pb-2">
            <span className="truncate">[{competitor.name}]</span>
            <span>{competitor.price}</span>
            <span>{index === 0 ? "BUNDLE ✦" : "SUB ✦"}</span>
            <span>{index === 0 ? "IN ●" : "OUT ○"}</span>
            <span>[✗]</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketSignalsNode({ countdown }: { countdown: string }) {
  if (!signals.length) {
    return (
      <div className="py-4 text-center font-mono text-[0.62rem]">
        <p>[MONITORING ACTIVE]</p>
        <p className="mt-2 text-[#7A7A7A]">{".".repeat(36)}</p>
        <p className="mt-2">Next scan in [{countdown}]</p>
      </div>
    );
  }
  return (
    <div className="font-mono text-[0.62rem]">
      {signals.map((signal) => (
        <div key={signal.text} className="flex items-center gap-2 border-b border-dashed border-[#0A0A0A] py-2 last:border-b-0">
          <span>{signal.mark}</span>
          <span className="w-10">{signal.severity}</span>
          <span className="min-w-0 flex-1 truncate">{signal.text}</span>
          <span className="text-[#7A7A7A]">{signal.ago}</span>
        </div>
      ))}
    </div>
  );
}

function DecisionNode({ company, running, onRunAnalysis }: { company: RepplCompany; running: boolean; onRunAnalysis: () => void }) {
  const analysis = MOCK_ANALYSIS;
  if (running) {
    return (
      <ul className="space-y-2 font-mono text-[0.65rem] text-[#7A7A7A]">
        <li>▸ Scanning competitors... [ACTIVE &gt;&gt;&gt;]_</li>
        <li>▸ Running decision engine [PENDING ···]</li>
        <li>▸ Checking AI ranking... [PENDING ···]</li>
      </ul>
    );
  }
  if (!company.lastAnalysisAt) {
    return (
      <div className="py-8 text-center font-mono text-[0.65rem]">
        <p>[NO ANALYSIS YET]</p>
        <p className="mt-2 text-[#7A7A7A]">{".".repeat(36)}</p>
        <p className="mx-auto mt-3 max-w-[240px] leading-relaxed text-[#7A7A7A]">Add competitors first, then run analysis.</p>
        <button className="mx-auto mt-4 block border border-dashed border-[#0A0A0A] px-4 py-2 text-[0.65rem]" type="button">
          [+ ADD COMPETITOR &gt;&gt;&gt;]
        </button>
        <button className="reppl-btn-solid mx-auto mt-4 max-w-[260px] text-[0.65rem]" type="button" onClick={onRunAnalysis}>
          [RUN ANALYSIS &gt;&gt;&gt;]
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[0.62rem]">PRIMARY ISSUE</p>
        <p className="font-mono text-[0.6rem]">{"─".repeat(30)}</p>
        <p className="mt-2 font-display text-[40px] uppercase leading-none">"YOUR BUNDLE OFFER IS MISSING VS MARKET"</p>
      </div>
      <div>
        <p className="font-mono text-[0.62rem] text-[#7A7A7A]">WHY {">".repeat(12)}</p>
        <p className="mt-1 text-[0.7rem]">◆ {analysis.why[0]}</p>
        <p className="text-[0.7rem]">◆ {analysis.why[1]}</p>
      </div>
      <div>
        <p className="font-mono text-[0.62rem] text-[#7A7A7A]">DIRECTION {">".repeat(8)}</p>
        <p className="mt-1 text-[0.7rem]">01 / {analysis.direction[0]}</p>
        <p className="text-[0.7rem]">02 / {analysis.direction[1]}</p>
      </div>
      <div className="border-t border-dashed border-[#0A0A0A] pt-3 text-[0.7rem]">
        <p className="font-mono text-[0.62rem]">WE CONSIDERED:</p>
        <p>{analysis.optionsConsidered[0].text} ✗ &nbsp;&nbsp; {analysis.optionsConsidered[1].text} ✓</p>
      </div>
      <button className="reppl-btn-solid text-[0.65rem]" type="button" onClick={onRunAnalysis}>[RUN NEW ANALYSIS &gt;&gt;&gt;]</button>
    </div>
  );
}

function AiSearchNode() {
  const analysis = MOCK_ANALYSIS;
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-6xl leading-none">{analysis.discoverability}</p>
        <p className="mt-2 font-mono text-[0.65rem]">{"■ ".repeat(3) + "□ ".repeat(9)}</p>
        <p className="font-mono text-[0.58rem]">↑ YOU (#3 OF 12)</p>
      </div>
      <div className="font-mono text-[0.62rem]">
        <p>COMPETITOR RANKS</p>
        <p>NORTHBOUND LABS ........ #2</p>
        <p>URBAN RITUAL ........... #4</p>
      </div>
      <div className="border-t border-dashed border-[#0A0A0A] pt-3 text-[0.65rem]">
        <p className="font-mono text-[0.62rem]">WHY THIS SCORE:</p>
        <p>· {analysis.aiReason[0]}</p>
        <p>· {analysis.aiReason[1]}</p>
      </div>
      <div className="text-[0.65rem]">
        <p className="font-mono text-[0.62rem]">HOW TO IMPROVE:</p>
        <p>◆ Add comparison proof to PDP.</p>
        <p>◆ Tighten category language above fold.</p>
      </div>
      <button className="reppl-btn-solid text-[0.65rem]" type="button">[RECHECK &gt;&gt;&gt;]</button>
    </div>
  );
}

function ActionableNode({ connected, onConnect, onOpenProduct }: { connected: boolean; onConnect: () => void; onOpenProduct: () => void }) {
  if (!connected) {
    return (
      <div className="py-3 text-center">
        <button className="reppl-btn-solid text-[0.65rem]" type="button" onClick={onConnect}>[CONNECT SHOPIFY &gt;&gt;&gt;]</button>
        <p className="mt-3 font-mono text-[0.62rem] leading-relaxed text-[#7A7A7A]">Unlock competitor revenue data and AI product actions.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 font-mono text-[0.62rem]">
      <div className="border border-dashed border-[#0A0A0A] p-3">
        <p>COMPETITOR REVENUE EST.</p>
        <p className="mt-2">[NORTHBOUND] $12k/mo ARR: $144k</p>
        <p>[URBAN RITUAL] $9k/mo ARR: $108k</p>
      </div>
      <div>
        <p>TOP PRODUCTS:</p>
        <p>[NORTHBOUND] → Focus gummies</p>
        <p>[URBAN RITUAL] → Daily kit</p>
      </div>
      <button className="reppl-btn-solid text-[0.65rem]" type="button" onClick={onOpenProduct}>[+ ADD PRODUCT TO STORE &gt;&gt;&gt;]</button>
    </div>
  );
}

function SignalDistributionNode({ countdown }: { countdown: string }) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  return (
    <div className="space-y-4 font-mono text-[0.62rem]">
      <div>
        <p>DELIVERY MODE</p>
        <div className="mt-2 flex gap-2">
          <button className={mode === "auto" ? "bg-[#0A0A0A] px-2 py-1 text-[#F5F4EF]" : "border border-[#0A0A0A] px-2 py-1"} type="button" onClick={() => setMode("auto")}>[AUTOMATIC]</button>
          <button className={mode === "manual" ? "bg-[#0A0A0A] px-2 py-1 text-[#F5F4EF]" : "border border-[#0A0A0A] px-2 py-1"} type="button" onClick={() => setMode("manual")}>[MANUAL]</button>
        </div>
      </div>
      <div className="border-t border-dashed border-[#0A0A0A] pt-3">
        <p>CHANNELS</p>
        <p>SLACK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [CONNECTED ✦]</p>
        <p>TELEGRAM&nbsp;&nbsp; [CONNECT &gt;&gt;&gt;]</p>
        <p>EMAIL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [CONNECTED ✦]</p>
      </div>
      <p className="border-t border-dashed border-[#0A0A0A] pt-3">NEXT SIGNAL IN: [{countdown}]</p>
      <div className="border-t border-dashed border-[#0A0A0A] pt-3">
        <p>LAST SIGNAL SENT:</p>
        <p>{new Date().toLocaleDateString()} // {signals.length} updates delivered</p>
      </div>
      <button className="reppl-btn-solid text-[0.65rem]" type="button">[SEND MANUAL SIGNAL &gt;&gt;&gt;]</button>
    </div>
  );
}

function FlowLines({
  expanded,
  positions,
}: {
  expanded: Record<RepplModuleId, boolean>;
  positions: Record<RepplModuleId, RepplNodePosition>;
}) {
  const decision = positions.decision;
  const outer: RepplModuleId[] = ["competitors", "actionable", "marketSignals", "aiSearch", "signal"];
  const rows = outer
    .filter((id) => expanded[id] && expanded.decision)
    .map((id) => {
      const pos = positions[id];
      const fromLeft = pos.x < decision.x;
      const nodeWidth = FIXED_LAYOUT[id].w;
      const decisionWidth = FIXED_LAYOUT.decision.w;
      const x1 = fromLeft ? pos.x + nodeWidth : pos.x;
      const x2 = fromLeft ? decision.x : decision.x + decisionWidth;
      const y1 = pos.y + 24;
      const y2 = decision.y + 24;
      const mid = Math.round((x1 + x2) / 2);
      return { id, fromLeft, mid, x1, x2, y1, y2 };
    });
  return (
    <svg className="pointer-events-none absolute left-0 top-0 z-0 h-[980px] w-[1260px]">
      <defs>
        <marker id="reppl-arrow" markerHeight="6" markerWidth="6" orient="auto" refX="6" refY="3">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#0A0A0A" />
        </marker>
      </defs>
      {rows.map((row) => (
        <g key={row.id} className="reppl-flow-line">
          <path
            d={`M ${row.x1} ${row.y1} L ${row.mid} ${row.y1} L ${row.mid} ${row.y2} L ${row.x2} ${row.y2}`}
            fill="none"
            markerEnd={row.fromLeft ? "url(#reppl-arrow)" : undefined}
            markerStart={!row.fromLeft ? "url(#reppl-arrow)" : undefined}
            stroke="#0A0A0A"
            strokeWidth="1"
          />
        </g>
      ))}
    </svg>
  );
}

function BriefOverlay({ company, open, onClose }: { company: RepplCompany; open: boolean; onClose: () => void }) {
  if (!open) return null;
  const analysis = MOCK_ANALYSIS;
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#F5F4EF] px-4 py-6 md:py-10">
      <section
        className="max-h-full w-full max-w-[680px] overflow-y-auto bg-[#F5F4EF] p-2 md:p-4"
        style={{ animation: "briefIn 500ms ease forwards" }}
      >
        <style>{`@keyframes briefIn{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[0.7rem]">REPPL BRIEF // {company.name.toUpperCase()} // {new Date().toLocaleDateString()}</p>
          <button className="bg-transparent font-mono text-[0.75rem]" type="button" onClick={onClose}>[✗]</button>
        </div>
        <p className="mt-3 font-mono text-[0.65rem]">{"━".repeat(34)}</p>
        <div className="mt-6 space-y-5">
          <div>
            <p className="font-mono text-[0.65rem]">PRIMARY ISSUE</p>
            <p className="mt-1 font-display text-5xl uppercase leading-none">"YOUR BUNDLE OFFER IS MISSING VS MARKET"</p>
          </div>
          <DocSection title="WHY">{analysis.why.slice(0, 2).map((why) => `◆ ${why}`).join("\n")}</DocSection>
          <DocSection title="DIRECTION">{analysis.direction.slice(0, 2).map((item, index) => `0${index + 1} / ${item}`).join("\n")}</DocSection>
          <DocSection title="AI SCORE: MEDIUM">{analysis.aiReason.map((reason) => `· ${reason}`).join("\n")}</DocSection>
          <DocSection title="SIGNALS THIS CYCLE">{signals.map((signal) => `${signal.mark} ${signal.severity} ${signal.text} ${signal.ago}`).join("\n")}</DocSection>
          <p className="font-mono text-[0.65rem]">{"━".repeat(34)}</p>
          <p className="font-mono text-[0.65rem] text-[#7A7A7A]">This brief was sent via Slack + Email<br />{new Date().toLocaleString()}</p>
        </div>
      </section>
    </div>
  );
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-dashed border-[#0A0A0A] pt-4">
      <p className="font-mono text-[0.65rem]">{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-7">{children}</p>
    </div>
  );
}

function statusOverride(id: RepplModuleId, updating: RepplModuleId | null, updated: RepplModuleId | null) {
  if (updating === id) return "[UPDATING >>>]";
  if (updated === id) return "[UPDATED ✦]";
  return null;
}

function mergePositions(workspace: RepplWorkspaceState): Record<RepplModuleId, RepplNodePosition> {
  return {
    ...defaultPositions(),
    ...(workspace.positions ?? {}),
  };
}

function collapsedStatus(id: RepplModuleId, company: RepplCompany, shopifyConnected: boolean) {
  if (id === "competitors") return `${MOCK_COMPETITORS.length} TRACKED`;
  if (id === "marketSignals") return `${signals.length} NEW`;
  if (id === "decision") return company.lastAnalysisAt ? "COMPLETE ✦" : "ISSUE DETECTED ⚠";
  if (id === "aiSearch") return `SCORE: ${MOCK_ANALYSIS.discoverability} ⚠`;
  if (id === "actionable") return `SHOPIFY: ${shopifyConnected ? "ON ✦" : "OFF"}`;
  return "AUTO // SLACK + EMAIL ✦";
}

function updatingStatus(status: string | null) {
  return status === "[UPDATING >>>]";
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, "0");
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
