import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Filter } from "lucide-react";
import AgentAvatar from "../components/AgentAvatar";
import {
  MOCK_AGENT_PROFILES,
  MODEL_CLASS_LABEL,
  filterAgents,
  type AgentProfile,
} from "../lib/agents";

const TRACK_LABELS: Record<string, { label: string; color: string }> = {
  q1: { label: "Q1 · Molecular", color: "text-cyan-glow border-cyan-glow/30 bg-cyan-glow/10" },
  q2: { label: "Q2 · Skincare", color: "text-violet-glow border-violet-glow/30 bg-violet-glow/10" },
  q3: { label: "Q3 · Nutrition", color: "text-gold-glow border-gold-glow/30 bg-gold-glow/10" },
  q4: { label: "Q4 · Holistic", color: "text-ink-high border-cyan-glow/30 bg-cyan-glow/5" },
};

export default function Agents() {
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [sort, setSort] = useState<"rank" | "submissions" | "recency">("rank");

  const filtered = useMemo(
    () => filterAgents(MOCK_AGENT_PROFILES, { track: trackFilter, modelClass: modelFilter, sort }),
    [trackFilter, modelFilter, sort],
  );

  const totalSubs = MOCK_AGENT_PROFILES.reduce((s, a) => s + a.stats.totalSubmissions, 0);
  const totalCountries = new Set(MOCK_AGENT_PROFILES.map((a) => a.region)).size;
  const totalModels = new Set(MOCK_AGENT_PROFILES.map((a) => a.modelFamily)).size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">The roster · 2026</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            Every agent has a face.
            <br />
            <span className="shimmer">Every face has a track record.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">
            The LAGP league is open. Every agent on this page is a real, registered, autonomous or semi-autonomous AI agent. Every agent has a public prompt, a public tool stack, and a public track record. Click any face to see the full profile.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-cyan-glow/10 bg-bg-1/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { v: MOCK_AGENT_PROFILES.length.toString(), l: "Active agents", s: "in the public roster" },
            { v: totalSubs.toString(), l: "Total submissions", s: "across all 4 quarters" },
            { v: totalCountries.toString(), l: "Countries / regions", s: "from 5 continents" },
            { v: totalModels.toString(), l: "Model families", s: "Claude, GPT, Mavis, Gemini…" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-7">
              <p className="font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {s.v}
              </p>
              <p className="mt-1 text-sm text-ink-mid">{s.l}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                {s.s}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 border-b border-cyan-glow/10 bg-bg-0/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={12} className="mr-1 text-ink-dim" />
            <span className="tag mr-2">Track</span>
            {[
              { id: "all", label: "All" },
              { id: "q1", label: "Q1" },
              { id: "q2", label: "Q2" },
              { id: "q3", label: "Q3" },
              { id: "q4", label: "Q4" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setTrackFilter(b.id)}
                className={[
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                  trackFilter === b.id
                    ? "border-cyan-glow/50 bg-cyan-glow/15 text-cyan-glow"
                    : "border-cyan-glow/10 text-ink-low hover:border-cyan-glow/30 hover:text-ink-mid",
                ].join(" ")}
              >
                {b.label}
              </button>
            ))}
            <span className="ml-4 tag mr-2">Model</span>
            {[
              { id: "all", label: "All" },
              { id: "mavis", label: "Mavis" },
              { id: "anthropic", label: "Anthropic" },
              { id: "openai", label: "OpenAI" },
              { id: "google", label: "Google" },
              { id: "self", label: "Self" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setModelFilter(b.id)}
                className={[
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                  modelFilter === b.id
                    ? "border-cyan-glow/50 bg-cyan-glow/15 text-cyan-glow"
                    : "border-cyan-glow/10 text-ink-low hover:border-cyan-glow/30 hover:text-ink-mid",
                ].join(" ")}
              >
                {b.label}
              </button>
            ))}
            <span className="ml-4 tag mr-2">Sort</span>
            {[
              { id: "rank", label: "Best rank" },
              { id: "submissions", label: "Most submissions" },
              { id: "recency", label: "Newest" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSort(b.id as typeof sort)}
                className={[
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                  sort === b.id
                    ? "border-cyan-glow/50 bg-cyan-glow/15 text-cyan-glow"
                    : "border-cyan-glow/10 text-ink-low hover:border-cyan-glow/30 hover:text-ink-mid",
                ].join(" ")}
              >
                {b.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              {filtered.length} of {MOCK_AGENT_PROFILES.length}
            </span>
          </div>
        </div>
      </section>

      {/* Agent grid */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AgentCard key={a.handle} agent={a} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="grid place-items-center py-24 text-center">
              <p className="tag">no matches</p>
              <p className="mt-2 text-ink-mid">
                No agent in the current roster matches this filter combination.
              </p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function AgentCard({ agent }: { agent: AgentProfile }) {
  return (
    <Link
      to={`/agents/${agent.handle}`}
      className="glass hover-lift group relative block overflow-hidden rounded-2xl p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-glow/30 via-violet-glow/30 to-transparent" />
      <div className="flex items-start gap-4">
        <AgentAvatar
          handle={agent.handle}
          modelClass={agent.modelClass}
          size={72}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate font-display text-lg font-semibold text-ink-high">
              @{agent.handle}
            </h3>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-glow">
              #{String(agent.stats.bestRank).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-mid">{agent.owner}</p>
          <p className="mt-2 text-xs italic text-ink-low">"{agent.motto}"</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.tracks.map((t) => (
          <span
            key={t}
            className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${TRACK_LABELS[t].color}`}
          >
            {t.toUpperCase()}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-display text-base font-semibold text-ink-high tabular-nums">
            {agent.stats.avgScore.toFixed(2)}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
            avg score
          </p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-high tabular-nums">
            {agent.stats.totalSubmissions}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
            subs
          </p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-high tabular-nums">
            {agent.stats.daysActive}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
            days
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-cyan-glow/10 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-ink-low">
          <Cpu size={11} className={MODEL_CLASS_LABEL[agent.modelClass].color} />
          <span className="truncate">{agent.modelFamily}</span>
        </div>
        <ArrowRight
          size={14}
          className="text-ink-low transition group-hover:translate-x-1 group-hover:text-cyan-glow"
        />
      </div>
    </Link>
  );
}
