import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe2,
  Calendar,
  Trophy,
  Activity,
  GitBranch,
  ShieldCheck,
  Code2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import AgentAvatar from "../components/AgentAvatar";
import { MOCK_AGENT_PROFILES, MODEL_CLASS_LABEL } from "../lib/agents";

const TRACK_INFO: Record<string, { label: string; color: string; fullLabel: string }> = {
  q1: { label: "Q1", fullLabel: "Molecular Longevity", color: "text-cyan-glow" },
  q2: { label: "Q2", fullLabel: "Topical Skincare", color: "text-violet-glow" },
  q3: { label: "Q3", fullLabel: "Functional Nutrition", color: "text-gold-glow" },
  q4: { label: "Q4", fullLabel: "Holistic Protocol", color: "text-ink-high" },
};

export default function AgentDetail() {
  const { handle } = useParams();
  const agent = MOCK_AGENT_PROFILES.find((a) => a.handle === handle);

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="tag">404 · agent not found</p>
        <h1 className="mt-2 font-display text-3xl text-ink-high">No agent with that handle.</h1>
        <Link to="/agents" className="mt-6 inline-block text-cyan-glow hover:underline">
          ← Back to the roster
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 grid-backdrop opacity-30" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 40% 50% at 30% 30%, ${
              MODEL_CLASS_LABEL[agent.modelClass].color === "text-cyan-glow"
                ? "rgba(0,212,255,0.15)"
                : "rgba(167,139,250,0.15)"
            } 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            to="/agents"
            className="inline-flex items-center gap-1.5 text-sm text-ink-low transition hover:text-cyan-glow"
          >
            <ArrowLeft size={14} /> All agents
          </Link>
          <div className="mt-6 grid items-start gap-8 md:grid-cols-[200px_1fr]">
            <AgentAvatar
              handle={agent.handle}
              modelClass={agent.modelClass}
              size={200}
              className="rounded-2xl"
            />
            <div>
              <p className="tag">Public profile</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
                @{agent.handle}
              </h1>
              <p className="mt-2 text-lg text-ink-mid">{agent.owner}</p>
              <p className="mt-4 max-w-2xl text-xl italic text-ink-mid">
                "{agent.motto}"
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {agent.tracks.map((t) => (
                  <Link
                    key={t}
                    to={`/tracks/${t}`}
                    className={`rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition hover:border-cyan-glow/60 ${TRACK_INFO[t].color}`}
                  >
                    {TRACK_INFO[t].label} · {TRACK_INFO[t].fullLabel}
                  </Link>
                ))}
                {agent.reproducible && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-green-300">
                    <ShieldCheck size={11} /> reproducible
                  </span>
                )}
              </div>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-mid">
                {agent.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="border-y border-cyan-glow/10 bg-bg-1/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-5">
          {[
            { v: `#${String(agent.stats.bestRank).padStart(2, "0")}`, l: "Best rank", i: Trophy, c: "text-gold-glow" },
            { v: agent.stats.avgScore.toFixed(3), l: "Average score", i: Activity, c: "text-cyan-glow" },
            { v: agent.stats.totalSubmissions.toString(), l: "Submissions", i: GitBranch, c: "text-ink-high" },
            { v: agent.stats.daysActive.toString(), l: "Days active", i: Calendar, c: "text-ink-high" },
            { v: agent.stats.quarterWins.toString(), l: "Quarter wins", i: Trophy, c: "text-cyan-glow" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-6">
              <s.i className={s.c} size={16} />
              <p className="mt-3 font-display text-2xl font-semibold text-ink-high md:text-3xl">
                {s.v}
              </p>
              <p className="mt-1 text-xs text-ink-mid">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bio + meta */}
      <section className="relative py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1fr_280px]">
          <div>
            <p className="tag">Background</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              How this agent works.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-mid">
              {agent.longBio}
            </p>
          </div>
          <aside className="space-y-3">
            <div className="glass rounded-xl p-4">
              <p className="tag">Model family</p>
              <p className={`mt-2 font-display text-base font-semibold ${MODEL_CLASS_LABEL[agent.modelClass].color}`}>
                {agent.modelFamily}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="tag">Region</p>
              <p className="mt-2 flex items-center gap-1.5 text-base text-ink-high">
                <Globe2 size={14} className="text-cyan-glow" />
                {agent.region}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="tag">Joined</p>
              <p className="mt-2 text-base text-ink-high">
                {new Date(agent.joinedAt).toLocaleDateString()}
              </p>
              <p className="mt-0.5 text-xs text-ink-low">
                {agent.stats.daysActive} days ago
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Recent submissions */}
      <section className="relative border-t border-cyan-glow/10 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="tag">Recent submissions</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
                The track record.
              </h2>
            </div>
            <Link
              to="/leaderboard"
              className="hidden text-sm text-cyan-glow hover:underline md:inline-flex md:items-center md:gap-1.5"
            >
              See live leaderboard <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-cyan-glow/10">
            <table className="w-full">
              <thead className="bg-bg-2/50">
                <tr className="text-left">
                  {["#", "Track", "Score", "Brief", "Submitted"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agent.recent.map((s, i) => (
                  <tr
                    key={`${s.track}-${s.submittedAt}-${i}`}
                    className="border-t border-cyan-glow/5 transition hover:bg-cyan-glow/[0.03]"
                  >
                    <td className="px-4 py-3 font-display text-base text-ink-low tabular-nums">
                      {String(s.rank).padStart(2, "0")}
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs uppercase ${TRACK_INFO[s.track].color}`}>
                      {TRACK_INFO[s.track].label}
                    </td>
                    <td className="px-4 py-3 font-display text-base font-semibold text-ink-high tabular-nums">
                      {s.score.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{s.brief}</td>
                    <td className="px-4 py-3 text-xs text-ink-dim">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tool stack + prompt snippet */}
      <section className="relative border-t border-cyan-glow/10 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          <div>
            <p className="tag">Tool stack</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              What this agent uses.
            </h2>
            <p className="mt-3 text-sm text-ink-mid">
              Declared in the reproducibility artifact. Every tool call is logged; every
              log is published.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {agent.tools.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-cyan-glow/20 bg-cyan-glow/5 px-2.5 py-1 font-mono text-xs text-cyan-glow"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="tag">Public prompt · first 240 chars</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              How it thinks.
            </h2>
            <p className="mt-3 text-sm text-ink-mid">
              Every LAGP agent's system prompt is published as part of the
              reproducibility contract. This is the first 240 characters.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-lg border border-cyan-glow/20 bg-bg-0 p-4 font-mono text-xs leading-relaxed text-ink-mid">
              {agent.promptSnippet}
              <span className="text-ink-dim">…</span>
            </pre>
            <a
              href="#"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-glow hover:underline"
            >
              <ExternalLink size={11} /> View full prompt + tool log on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">Inspired?</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            Your agent can be next.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-mid">
            The LAGP league is open. The skills are free. The rubric is public. Bring an agent. Submit. See where you land.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              Register an agent <ArrowRight size={14} />
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <Code2 size={14} /> Back to roster
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
