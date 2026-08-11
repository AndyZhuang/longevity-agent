// Procedurally-generated agent avatar.
// Given a handle + modelClass, returns a deterministic SVG that looks like a
// stylized "circuit / molecular" identity. No external assets.

import { useMemo } from "react";

type Props = {
  handle: string;
  modelClass: "anthropic" | "openai" | "google" | "mavis" | "self";
  size?: number;
  className?: string;
};

// 32-bit FNV-1a — fast, deterministic, no deps
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Palette per model class — keeps the wall visually coherent
const PALETTES: Record<string, { from: string; mid: string; to: string; bg: string }> = {
  anthropic: { from: "#fde68a", mid: "#fb923c", to: "#dc2626", bg: "#1a1108" },
  openai: { from: "#a7f3d0", mid: "#10b981", to: "#065f46", bg: "#08231b" },
  google: { from: "#bae6fd", mid: "#38bdf8", to: "#1e40af", bg: "#08172b" },
  mavis: { from: "#5eead4", mid: "#00d4ff", to: "#a78bfa", bg: "#050b1f" },
  self: { from: "#c4b5fd", mid: "#a78bfa", to: "#6d28d9", bg: "#0e0820" },
};

export default function AgentAvatar({
  handle,
  modelClass,
  size = 64,
  className = "",
}: Props) {
  const svg = useMemo(() => {
    const h = hash(handle);
    const palette = PALETTES[modelClass];
    // 5 seed values drive the shape
    const nodeCount = 5 + (h % 4);
    const radius = 32;
    const cx = 40;
    const cy = 40;

    // Place nodes around a circle with jitter
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const a = (i / nodeCount) * Math.PI * 2 + ((h >> i) & 0xff) * 0.01;
      const rr = radius * (0.7 + (((h >> (i * 3)) & 0xff) / 255) * 0.4);
      nodes.push({
        x: cx + Math.cos(a) * rr,
        y: cy + Math.sin(a) * rr,
        r: 2.5 + (((h >> (i * 2 + 4)) & 0x7) * 0.5),
      });
    }

    // Each node connects to its 2 nearest neighbours
    const lines: { x1: number; y1: number; x2: number; y2: number; op: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter((d) => d.j !== i)
        .sort((a, b) => a.d - b.d);
      const opA = 0.35 + (((h >> (i * 5)) & 0x3) * 0.1);
      lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[distances[0].j].x, y2: nodes[distances[0].j].y, op: opA });
      if (distances[1] && distances[1].d < radius * 1.6) {
        lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[distances[1].j].x, y2: nodes[distances[1].j].y, op: opA * 0.7 });
      }
    }

    // Optional center node
    const showCore = (h & 0x7) > 2;

    const id = `g-${modelClass}-${(h % 100000).toString(16)}`;

    return (
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        className={className}
        aria-hidden
      >
        <defs>
          <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={palette.bg} stopOpacity="0.2" />
            <stop offset="100%" stopColor={palette.bg} stopOpacity="1" />
          </radialGradient>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="50%" stopColor={palette.mid} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="14" fill={`url(#bg-${id})`} />
        {/* Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 2}
          fill="none"
          stroke={palette.mid}
          strokeOpacity="0.18"
          strokeWidth="0.6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.55}
          fill="none"
          stroke={palette.mid}
          strokeOpacity="0.12"
          strokeWidth="0.5"
        />
        {/* Bonds */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={palette.mid}
            strokeOpacity={l.op}
            strokeWidth="0.8"
          />
        ))}
        {/* Core */}
        {showCore && (
          <circle cx={cx} cy={cy} r="3" fill={palette.from} opacity="0.9" />
        )}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i === 0 ? palette.from : i % 2 === 0 ? palette.mid : palette.to}
            opacity="0.95"
          />
        ))}
        {/* Frame */}
        <rect
          x="0.5"
          y="0.5"
          width="79"
          height="79"
          rx="13.5"
          fill="none"
          stroke={palette.mid}
          strokeOpacity="0.25"
          strokeWidth="0.5"
        />
      </svg>
    );
  }, [handle, modelClass, size, className]);

  return svg;
}
