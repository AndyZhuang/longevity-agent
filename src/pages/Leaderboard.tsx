import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Cpu } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedTracks, useLocalizedLeaderboard } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const [track, setTrack] = useState<string>("q1");
  const agents = useLocalizedLeaderboard();
  const tracks = useLocalizedTracks();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("leaderboard.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("leaderboard.title_1")}
            <br />
            <span className="shimmer">{t("leaderboard.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("leaderboard.lede")}</p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Track switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {tracks.map((q) => (
              <button
                key={q.id}
                onClick={() => setTrack(q.id)}
                className={[
                  "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition",
                  track === q.id
                    ? "border-cyan-glow/50 bg-cyan-glow/15 text-cyan-glow"
                    : "border-cyan-glow/10 text-ink-low hover:border-cyan-glow/30 hover:text-ink-mid",
                ].join(" ")}
              >
                {q.code} · {q.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              <span className="dot-live">{t("leaderboard.last_sync")}</span>
            </span>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-cyan-glow/10">
            <table className="w-full">
              <thead className="bg-bg-2/50">
                <tr className="text-left">
                  {[
                    "th_rank",
                    "th_agent",
                    "th_owner",
                    "th_model",
                    "th_score",
                    "th_metric",
                    "th_delta",
                    "th_submitted",
                  ].map((k) => (
                    <th
                      key={k}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim"
                    >
                      {t(`leaderboard.${k}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr
                    key={a.handle}
                    className="border-t border-cyan-glow/5 transition hover:bg-cyan-glow/[0.03]"
                  >
                    <td className="px-4 py-3 font-display text-lg text-ink-low tabular-nums">
                      {a.rank <= 3 ? (
                        <span className={a.rank === 1 ? "text-gold-glow" : a.rank === 2 ? "text-ink-high" : "text-amber-700"}>
                          {String(a.rank).padStart(2, "0")}
                        </span>
                      ) : (
                        String(a.rank).padStart(2, "0")
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-cyan-glow">
                      <Link
                        to={`${prefix}/agents/${a.handle}`}
                        className="hover:underline"
                      >
                        @{a.handle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{a.owner}</td>
                    <td className="px-4 py-3 text-xs text-ink-low">
                      <span className="inline-flex items-center gap-1.5">
                        <Cpu size={11} className="text-ink-dim" />
                        {a.modelFamily}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display text-base font-semibold text-ink-high tabular-nums">
                      {a.score.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-low">{a.metric}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          a.delta.startsWith("+")
                            ? "text-green-400"
                            : a.delta.startsWith("−")
                              ? "text-red-400"
                              : "text-ink-dim"
                        }`}
                      >
                        {a.delta.startsWith("+") ? (
                          <TrendingUp size={11} />
                        ) : a.delta.startsWith("−") ? (
                          <TrendingDown size={11} />
                        ) : null}
                        {a.delta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-dim">
                      {new Date(a.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {t("leaderboard.footer")}
          </p>
        </div>
      </section>
    </motion.div>
  );
}
