import type { DashboardResponse } from "../lib/types";

interface PipelineTrackerProps {
  dashboard: DashboardResponse | null;
}

export function PipelineTracker({ dashboard }: PipelineTrackerProps) {
  const steps = dashboard?.pipeline_steps ?? [
    { label: "Identifying your product", status: "pending" as const },
    { label: "Discovering competitors", status: "pending" as const },
    { label: "Scanning competitor 1", status: "pending" as const },
    { label: "Scanning competitor 2", status: "pending" as const },
    { label: "Scanning competitor 3", status: "pending" as const },
    { label: "Generating intelligence brief", status: "pending" as const },
  ];

  return (
    <section className="terminal-panel mx-auto max-w-4xl p-6 md:p-10">
      <div className="terminal-label">[MISSION INITIATED]</div>
      <div className="mt-2 text-sm uppercase">{">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"}</div>
      <div className="mt-8 space-y-4">
        {steps.map((step) => (
          <div className="flex items-center justify-between gap-4 text-sm uppercase" key={step.label}>
            <span>{renderLead(step.label)}</span>
            <span>{renderStatus(step.status)}</span>
          </div>
        ))}
      </div>
      {dashboard?.progress_text ? (
        <div className="mt-8 text-sm uppercase text-[var(--ink-muted)]">[{dashboard.progress_text}]</div>
      ) : null}
      <div className="mt-8 text-xs uppercase text-[var(--ink-muted)]">[DO NOT CLOSE THIS WINDOW]</div>
      <div className="mt-2 text-xs uppercase text-[var(--ink-muted)]">[REPPL AGENTS ARE DEPLOYED]</div>
    </section>
  );
}

function renderLead(label: string) {
  return `> ${label.toUpperCase()}...`;
}

function renderStatus(status: string) {
  if (status === "complete") return "[COMPLETE *]";
  if (status === "active") return "[ACTIVE >>>]_";
  if (status === "failed") return "[FAILED !]";
  return "[PENDING ...]";
}
