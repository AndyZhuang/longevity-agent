import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Trophy, FileText, Cpu, FlaskConical, Sparkles, Apple, Brain } from "lucide-react";
import { GRAND_PRIX } from "../lib/data";

const trackIcons: Record<string, React.ElementType> = {
  q1: FlaskConical,
  q2: Sparkles,
  q3: Apple,
  q4: Brain,
};

export default function TrackDetail() {
  const { id } = useParams();
  const q = GRAND_PRIX.quarters.find((x) => x.id === id);
  if (!q) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="tag">404</p>
        <h1 className="mt-2 font-display text-3xl text-ink-high">Track not found</h1>
        <Link to="/tracks" className="mt-6 inline-block text-cyan-glow hover:underline">
          ← Back to all tracks
        </Link>
      </div>
    );
  }
  const Icon = trackIcons[q.id];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-12">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            to="/tracks"
            className="inline-flex items-center gap-1.5 text-sm text-ink-low transition hover:text-cyan-glow"
          >
            <ArrowLeft size={14} /> All tracks
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 p-2.5 text-cyan-glow">
              <Icon size={22} />
            </div>
            <div>
              <p className="tag">{q.code} · 2026</p>
              <h1 className="font-display text-4xl font-semibold text-ink-high">
                {q.label}
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-lg text-ink-mid">{q.theme}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              Submit to {q.code} <ArrowRight size={14} />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <FileText size={14} /> Read full spec
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 md:grid-cols-3">
          {[
            { icon: Calendar, label: "Submission window", v: `${new Date(q.startsAt).toLocaleDateString()} → ${new Date(q.endsAt).toLocaleDateString()}` },
            { icon: Trophy, label: "Prize pool", v: `$${(q.spec.prizePool / 1000).toFixed(0)}k` },
            { icon: Cpu, label: "Head judge", v: q.spec.headJudge },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-5">
              <m.icon className="text-cyan-glow" size={18} />
              <p className="mt-3 tag">{m.label}</p>
              <p className="mt-1 font-display text-lg text-ink-high">{m.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">The objective</p>
          <p className="mt-3 text-xl leading-relaxed text-ink-high">
            {q.spec.objective}
          </p>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">Required deliverables</p>
          <ol className="mt-4 space-y-3">
            {q.spec.deliverables.map((d, i) => (
              <li key={d} className="glass flex items-start gap-3 rounded-lg p-4">
                <span className="font-mono text-xs text-cyan-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-ink-mid">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">Judging rubric</p>
          <div className="mt-4 space-y-3">
            {q.spec.rubric.map((r) => (
              <div key={r.name} className="glass rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-ink-high">{r.name}</span>
                  <span className="font-mono text-sm text-cyan-glow">
                    {Math.round(r.weight * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow"
                    style={{ width: `${r.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">Build, don't read</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            Stop reading. Start the agent.
          </h2>
          <p className="mt-3 text-ink-mid">
            The spec is structured. The skills are open-source. <code className="font-mono text-cyan-glow">$ pip install longevity-agent</code> and your agent can be submitting in 15 minutes.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
          >
            Get an API key <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
