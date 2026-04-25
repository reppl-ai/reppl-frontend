import type { RepplModuleId, RepplNodePosition } from "./types";

const NODE_W = 280;

export const COLLAPSED_H = 88;

export function port(
  id: RepplModuleId,
  pos: RepplNodePosition,
  h: number,
  side: "top" | "bottom" | "left" | "right"
): { x: number; y: number } {
  const cx = pos.x + NODE_W / 2;
  const cy = pos.y + h / 2;
  switch (side) {
    case "top":
      return { x: cx, y: pos.y };
    case "bottom":
      return { x: cx, y: pos.y + h };
    case "left":
      return { x: pos.x, y: cy };
    case "right":
      return { x: pos.x + NODE_W, y: cy };
    default:
      return { x: cx, y: pos.y + h };
  }
}

type EdgeKey = `${RepplModuleId}:${RepplModuleId}`;

const EDGE_PORTS: Partial<Record<EdgeKey, [/* from */ "top" | "bottom" | "left" | "right", /* to */ "top" | "bottom" | "left" | "right"]>> = {
  "decision:competitors": ["bottom", "top"],
  "competitors:decision": ["right", "left"],
  "aiSearch:decision": ["left", "right"],
  "decision:actionable": ["right", "left"],
  "decision:signal": ["right", "left"],
  "competitors:actionable": ["right", "left"],
  "competitors:signal": ["bottom", "top"],
};

function key(a: RepplModuleId, b: RepplModuleId): EdgeKey {
  return `${a}:${b}` as EdgeKey;
}

export function edgeAnchors(
  a: RepplModuleId,
  b: RepplModuleId,
  pos: Record<RepplModuleId, RepplNodePosition>,
  h: Record<RepplModuleId, number>
): { ax: number; ay: number; bx: number; by: number } | null {
  const ports = EDGE_PORTS[key(a, b)];
  if (!ports) return null;
  const [fromSide, toSide] = ports;
  const p1 = port(a, pos[a], h[a] ?? COLLAPSED_H, fromSide);
  const p2 = port(b, pos[b], h[b] ?? COLLAPSED_H, toSide);
  return { ax: p1.x, ay: p1.y, bx: p2.x, by: p2.y };
}

/** Right-angle only: one bend */
export function orthoPathD(ax: number, ay: number, bx: number, by: number): string {
  if (ax === bx) return `M ${ax} ${ay} L ${bx} ${by}`;
  if (ay === by) return `M ${ax} ${ay} L ${bx} ${by}`;
  const hFirst = Math.abs(ay - by) < Math.abs(ax - bx);
  if (hFirst) {
    const my = (ay + by) / 2;
    return `M ${ax} ${ay} L ${ax} ${my} L ${bx} ${my} L ${bx} ${by}`;
  }
  const mx = (ax + bx) / 2;
  return `M ${ax} ${ay} L ${mx} ${ay} L ${mx} ${by} L ${bx} ${by}`;
}
