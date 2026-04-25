import type { RepplEdge, RepplModuleId, RepplNodePosition } from "./types";

const SNAP = 24;
const W = 280;
const GAP = 48;

const x0 = SNAP * 2;
const x1 = x0 + W + GAP;
const y0 = SNAP * 2;
const y1 = y0 + 200;
const y2 = y1 + 200;

export const DEFAULT_NODE_POSITIONS: Record<RepplModuleId, RepplNodePosition> = {
  competitors: { x: x0, y: y0 },
  marketSignals: { x: x0, y: y2 },
  decision: { x: x1, y: y0 },
  aiSearch: { x: x1, y: y2 },
  actionable: { x: x1 + W + GAP, y: y0 },
  signal: { x: x1 + W + GAP, y: y2 },
};

export const DEFAULT_EDGES: RepplEdge[] = [
  ["competitors", "decision"],
  ["decision", "actionable"],
  ["decision", "signal"],
  ["aiSearch", "decision"],
];

export function snapValue(n: number): number {
  return Math.round(n / SNAP) * SNAP;
}

export function snapPoint(p: RepplNodePosition): RepplNodePosition {
  return { x: snapValue(p.x), y: snapValue(p.y) };
}

const NODE_H_COLLAPSED = 88;
const NODE_W = 280;

export function anchorPoint(
  mod: RepplModuleId,
  pos: RepplNodePosition,
  side: "bottom" | "top" | "right" | "left"
): { x: number; y: number } {
  const x = pos.x;
  const y = pos.y;
  const cx = x + NODE_W / 2;
  switch (side) {
    case "top":
      return { x: cx, y: y };
    case "bottom":
      return { x: cx, y: y + NODE_H_COLLAPSED };
    case "left":
      return { x, y: y + NODE_H_COLLAPSED / 2 };
    case "right":
      return { x: x + NODE_W, y: y + NODE_H_COLLAPSED / 2 };
    default:
      return { x: cx, y: y + NODE_H_COLLAPSED };
  }
}

export function manhattanPath(
  a: { x: number; y: number },
  b: { x: number; y: number }
): string {
  const midX = a.x;
  return `M ${a.x} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
}
