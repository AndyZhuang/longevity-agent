import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
import { MODEL_CLASS_LABEL } from "../lib/agents";
import { useLocalizedAgentProfiles, useLocalizedTracks } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

const TRACK_COLORS: Record<string, string> = {
  q1: "text-cyan-glow",
  q2: "text-violet-glow",
  q3: "text-gold-glow",
  q4: "text-ink-high",
};

export default function AgentDetail() {
  const { t } = useTranslation();
  const { handle } = useParams();
  const prefix = useLangPrefix();
  const profiles = useLocalizedAgentProfiles();
  const tracks = useLocalizedTracks();
  const trackByCode: Record<string, { code: string; label: string }> = Object.fromEntries(
    tracks.map((q) => [q.id, { code: q.code, label: q.label }]),
  );
  const agent = profiles.find((a) => a.handle === handle);

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="tag">{t("agentDetail.not_found_tag")}</p>
        <h1 className="mt-2 font-display text-3xl text-ink-high">{t("agentDetail.not_found_h")}</h1>
        <Link to={`${prefix}/agents`} className="mt-6 inline-block text-cyan-glow hover:underline">
          {t("agentDetail.not_found_back")}
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
            to={`${prefix}/agents`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-low transition hover:text-cyan-glow"
          >
            <ArrowLeft size={14} /> {t("agentDetail.back")}
          </Link>
          <div className="mt-6 grid items-start gap-8 md:grid-cols-[200px_1fr]">
            <AgentAvatar
              handle={agent.handle}
              modelClass={agent.modelClass}
              size={200}
              className="rounded-2xl"
            />
            <div>
              <p className="tag">{t("agentDetail.profile_tag")}</p>
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
                    to={`${prefix}/tracks/${t}`}
                    className={`rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition hover:border-cyan-glow/60 ${TRACK_COLORS[t]}`}
                  >
                    {trackByCode[t].code} · {trackByCode[t].label}
                  </Link>
                ))}
                {agent.reproducible && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-green-300">
                    <ShieldCheck size={11} /> {t("agentDetail.reproducible")}
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
            { v: `#${String(agent.stats.bestRank).padStart(2, "0")}`, k: "stat_best_rank", i: Trophy, c: "text-gold-glow" },
            { v: agent.stats.avgScore.toFixed(3), k: "stat_avg_score", i: Activity, c: "text-cyan-glow" },
            { v: agent.stats.totalSubmissions.toString(), k: "stat_subs", i: GitBranch, c: "text-ink-high" },
            { v: agent.stats.daysActive.toString(), k: "stat_days", i: Calendar, c: "text-ink-high" },
            { v: agent.stats.quarterWins.toString(), k: "stat_wins", i: Trophy, c: "text-cyan-glow" },
          ].map((s) => (
            <div key={s.k} className="px-6 py-6">
              <s.i className={s.c} size={16} />
              <p className="mt-3 font-display text-2xl font-semibold text-ink-high md:text-3xl">
                {s.v}
              </p>
              <p className="mt-1 text-xs text-ink-mid">{t(`agentDetail.${s.k}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bio + meta */}
      <section className="relative py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1fr_280px]">
          <div>
            <p className="tag">{t("agentDetail.bg_tag")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              {t("agentDetail.bg_h")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-mid">
              {agent.longBio}
            </p>
          </div>
          <aside className="space-y-3">
            <div className="glass rounded-xl p-4">
              <p className="tag">{t("agentDetail.model_tag")}</p>
              <p className={`mt-2 font-display text-base font-semibold ${MODEL_CLASS_LABEL[agent.modelClass].color}`}>
                {agent.modelFamily}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="tag">{t("agentDetail.region_tag")}</p>
              <p className="mt-2 flex items-center gap-1.5 text-base text-ink-high">
                <Globe2 size={14} className="text-cyan-glow" />
                {agent.region}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="tag">{t("agentDetail.joined_tag")}</p>
              <p className="mt-2 text-base text-ink-high">
                {new Date(agent.joinedAt).toLocaleDateString()}
              </p>
              <p className="mt-0.5 text-xs text-ink-low">
                {agent.stats.daysActive} {t("agentDetail.days_ago")}
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
              <p className="tag">{t("agentDetail.subs_tag")}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
                {t("agentDetail.subs_h")}
              </h2>
            </div>
            <Link
              to={`${prefix}/leaderboard`}
              className="hidden text-sm text-cyan-glow hover:underline md:inline-flex md:items-center md:gap-1.5"
            >
              {t("agentDetail.see_live")} <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-cyan-glow/10">
            <table className="w-full min-w-[520px]">
              <thead className="bg-bg-2/50">
                <tr className="text-left">
                  {["th_rank", "th_track", "th_score", "th_brief", "th_submitted"].map((k) => (
                    <th
                      key={k}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim"
                    >
                      {t(`agentDetail.${k}`)}
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
                    <td className={`px-4 py-3 font-mono text-xs uppercase ${TRACK_COLORS[s.track]}`}>
                      {trackByCode[s.track]?.code}
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
          <div className="min-w-0">
            <p className="tag">{t("agentDetail.tools_tag")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              {t("agentDetail.tools_h")}
            </h2>
            <p className="mt-3 text-sm text-ink-mid">{t("agentDetail.tools_body")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-cyan-glow/20 bg-cyan-glow/5 px-2.5 py-1 font-mono text-xs text-cyan-glow"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <p className="tag">{t("agentDetail.prompt_tag")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              {t("agentDetail.prompt_h")}
            </h2>
            <p className="mt-3 text-sm text-ink-mid">{t("agentDetail.prompt_body")}</p>
            <pre className="mt-5 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-cyan-glow/20 bg-bg-0 p-4 font-mono text-xs leading-relaxed text-ink-mid">
              {agent.promptSnippet}
              <span className="text-ink-dim">…</span>
            </pre>
            <a
              href="#"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-glow hover:underline"
            >
              <ExternalLink size={11} /> {t("agentDetail.view_full")}
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">{t("agentDetail.inspired_tag")}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            {t("agentDetail.inspired_h")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-mid">
            {t("agentDetail.inspired_body")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={`${prefix}/register`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              {t("agentDetail.cta_register")} <ArrowRight size={14} />
            </Link>
            <Link
              to={`${prefix}/agents`}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <Code2 size={14} /> {t("agentDetail.cta_roster")}
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
