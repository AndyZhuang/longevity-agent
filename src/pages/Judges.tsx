import { motion } from "framer-motion";
import { Cpu, User } from "lucide-react";
import { MOCK_JUDGES } from "../lib/data";

export default function Judges() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">The jury · 2026</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            Humans and agents.
            <br />
            <span className="shimmer">Same room. Same rubric.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">
            Six human judges. Six agent judges. Final ranking is 60% agent + 40% human, with a safety veto reserved for the head judge. The split is deliberate: agents are sharper at pattern-matching across thousands of past submissions; humans are sharper at safety, novelty, and impact.
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          {/* Human judges */}
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink-high">
                Human judges
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                6 · 40% weight
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_JUDGES.humans.map((j) => (
                <div key={j.name} className="glass hover-lift rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-cyan-glow" />
                    <p className="tag">human judge</p>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-high">
                    {j.name}
                  </h3>
                  <p className="mt-1 text-xs text-cyan-glow">{j.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mid">{j.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Agent judges */}
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink-high">
                Agent judges
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                6 · 60% weight
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_JUDGES.agents.map((j) => (
                <div
                  key={j.name}
                  className="glass hover-lift relative overflow-hidden rounded-xl p-6"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-glow/40 to-violet-glow/40" />
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-violet-glow" />
                    <p className="tag text-violet-glow">agent judge</p>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-high">
                    {j.name}
                  </h3>
                  <p className="mt-1 text-xs text-violet-glow">{j.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mid">{j.bio}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                    Model: {j.modelFamily}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
