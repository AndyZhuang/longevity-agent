import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, FlaskConical, Sparkles, Apple, Brain } from "lucide-react";
import { useLocalizedTracks } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

const trackIcons: Record<string, React.ElementType> = {
  q1: FlaskConical,
  q2: Sparkles,
  q3: Apple,
  q4: Brain,
};

const trackAccents: Record<string, { dot: string; ring: string; text: string; bg: string; border: string; gradient: string }> = {
  q1: { dot: "bg-cyan-glow", ring: "ring-cyan-glow/40", text: "text-cyan-glow", bg: "bg-cyan-glow/10", border: "border-cyan-glow/30", gradient: "from-cyan-glow/30" },
  q2: { dot: "bg-violet-glow", ring: "ring-violet-glow/40", text: "text-violet-glow", bg: "bg-violet-glow/10", border: "border-violet-glow/30", gradient: "from-violet-glow/30" },
  q3: { dot: "bg-gold-glow", ring: "ring-gold-glow/40", text: "text-gold-glow", bg: "bg-gold-glow/10", border: "border-gold-glow/30", gradient: "from-gold-glow/30" },
  q4: { dot: "bg-gradient-to-r from-cyan-glow via-violet-glow to-gold-glow", ring: "ring-cyan-glow/30", text: "text-ink-high", bg: "bg-cyan-glow/5", border: "border-cyan-glow/30", gradient: "from-cyan-glow/30" },
};

export default function Tracks() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const tracks = useLocalizedTracks();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("tracks.season_tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("tracks.season_title_1")}
            <br />
            <span className="shimmer">{t("tracks.season_title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("tracks.season_sub")}</p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          {tracks.map((q) => {
            const Icon = trackIcons[q.id];
            const a = trackAccents[q.id];
            return (
              <div
                key={q.id}
                className="glass hover-lift relative overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${a.gradient} to-transparent`} />
                <div className="grid gap-0 lg:grid-cols-[260px_1fr_280px]">
                  {/* Left: track identity */}
                  <div className={`border-r ${a.border} p-8`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${a.dot}`} />
                      <span className="tag">{q.code} · 2026</span>
                    </div>
                    <div className={`mt-6 inline-flex rounded-xl ${a.bg} ${a.border} border p-3`}>
                      <Icon className={a.text} size={24} />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-semibold text-ink-high">
                      {q.label}
                    </h2>
                    <p className="mt-2 text-sm text-ink-mid">{q.theme}</p>
                  </div>

                  {/* Middle: objective + rubric */}
                  <div className="border-r border-cyan-glow/10 p-8">
                    <p className="tag">{t("tracks.objective")}</p>
                    <p className="mt-2 text-base leading-relaxed text-ink-high">
                      {q.objective}
                    </p>
                    <div className="mt-6">
                      <p className="tag">{t("tracks.deliverables_tag")}</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-ink-mid">
                        {q.deliverables.map((d) => (
                          <li key={d} className="flex gap-2">
                            <span className={`mt-2 inline-block h-1 w-1 rounded-full ${a.dot}`} />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: meta + actions */}
                  <div className="p-8">
                    <div className="space-y-4">
                      <div>
                        <p className="tag">{t("tracks.prize_pool")}</p>
                        <p className="mt-1 font-display text-2xl font-semibold text-ink-high">
                          ${(q.spec.prizePool / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div>
                        <p className="tag">{t("tracks.head_judge")}</p>
                        <p className="mt-1 text-sm text-ink-mid">{q.spec.headJudge}</p>
                      </div>
                      <div>
                        <p className="tag">{t("tracks.window")}</p>
                        <p className="mt-1 text-sm text-ink-mid">
                          {new Date(q.startsAt).toLocaleDateString()} → {new Date(q.endsAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="tag">{t("tracks.rubric_tag")}</p>
                        <div className="mt-2 space-y-1.5">
                          {q.rubric.map((r) => (
                            <div key={r.name} className="flex items-center gap-2 text-xs">
                              <span className="text-ink-mid">{r.name}</span>
                              <span className="ml-auto font-mono text-ink-dim">
                                {Math.round(r.weight * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Link
                        to={`${prefix}/tracks/${q.id}`}
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-full ${a.bg} ${a.border} border ${a.text} px-4 py-2 text-sm transition hover:opacity-90`}
                      >
                        {t("tracks.open_spec")} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
