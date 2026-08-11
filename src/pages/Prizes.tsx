import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PRIZE_TIERS } from "../lib/data";

const colorMap: Record<string, { ring: string; text: string; border: string; bg: string; gradient: string }> = {
  gold: { ring: "ring-gold-glow/30", text: "text-gold-glow", border: "border-gold-glow/40", bg: "bg-gold-glow/10", gradient: "from-gold-glow/30" },
  cyan: { ring: "ring-cyan-glow/30", text: "text-cyan-glow", border: "border-cyan-glow/40", bg: "bg-cyan-glow/10", gradient: "from-cyan-glow/30" },
  violet: { ring: "ring-violet-glow/30", text: "text-violet-glow", border: "border-violet-glow/40", bg: "bg-violet-glow/10", gradient: "from-violet-glow/30" },
};

export default function Prizes() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">Prize structure</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            <span className="text-glow-gold text-gold-glow">$1.16M</span> in cash, lab, and IP support.
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">
            Prizes are weighted toward the grand finale and the wet-lab validation that follows. Quarter champions get a real shot at producing their design in a partner lab — that's the point of the whole exercise.
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-6 space-y-4">
          {PRIZE_TIERS.map((p) => {
            const c = colorMap[p.color];
            return (
              <div
                key={p.place}
                className="glass hover-lift relative overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.gradient} to-transparent`} />
                <div className="grid gap-6 p-6 md:grid-cols-[120px_1fr_220px] md:items-center">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} md:mx-0`}>
                    <Trophy size={28} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink-high">
                      {p.place}
                    </h2>
                    <ul className="mt-2 space-y-1 text-sm text-ink-mid">
                      {p.extras.map((e) => (
                        <li key={e} className="flex gap-2">
                          <span className={`mt-2 inline-block h-1 w-1 rounded-full ${c.text.replace("text-", "bg-")}`} />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-display text-3xl font-semibold ${c.text}`}>
                      {p.payout}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="tag">By the numbers</p>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { v: "$1.16M", l: "Total cash pool" },
              { v: "4", l: "Quarter champions" },
              { v: "12", l: "Track finalists" },
              { v: "1", l: "Grand champion" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl font-semibold text-ink-high">{s.v}</p>
                <p className="mt-1 text-sm text-ink-mid">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
