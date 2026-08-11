import { useEffect, useState } from "react";

type Props = {
  /** ISO date string */
  target: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

function diff(target: Date) {
  const now = Date.now();
  const t = target.getTime();
  const ms = Math.max(0, t - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s };
}

export default function Countdown({ target, label, size = "md" }: Props) {
  const [t, setT] = useState(() => diff(new Date(target)));

  useEffect(() => {
    const id = setInterval(() => setT(diff(new Date(target))), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cell = size === "lg" ? "px-4 py-3" : size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2";
  const num = size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-base" : "text-xl md:text-2xl";

  const cells: { v: number; u: string }[] = [
    { v: t.d, u: "days" },
    { v: t.h, u: "hrs" },
    { v: t.m, u: "min" },
    { v: t.s, u: "sec" },
  ];

  return (
    <div>
      {label && (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim">
          {label}
        </p>
      )}
      <div className="flex gap-1.5 md:gap-2">
        {cells.map((c, i) => (
          <div
            key={c.u}
            className={`glass rounded-md ${cell} flex flex-col items-center min-w-[58px] md:min-w-[72px]`}
          >
            <span className={`font-display ${num} font-semibold text-ink-high tabular-nums`}>
              {String(c.v).padStart(2, "0")}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim mt-0.5">
              {c.u}
            </span>
            {i < cells.length - 1 && (
              <span className="sr-only">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
