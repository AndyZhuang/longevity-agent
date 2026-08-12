import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Cpu, Filter } from "lucide-react";
import AgentAvatar from "../components/AgentAvatar";
import { MODEL_CLASS_LABEL, filterAgents, type AgentProfile } from "../lib/agents";
import { useLocalizedAgentProfiles } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function Agents() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [sort, setSort] = useState<"rank" | "submissions" | "recency">("rank");
  const allAgents = useLocalizedAgentProfiles();

  const filtered = useMemo(
    () => filterAgents(allAgents, { track: trackFilter, modelClass: modelFilter, sort }),
    [allAgents, trackFilter, modelFilter, sort],
  );

  const totalSubs = allAgents.reduce((s, a) => s + a.stats.totalSubmissions, 0);
  const totalCountries = new Set(allAgents.map((a) => a.region)).size;
  const totalModels = new Set(allAgents.map((a) => a.modelFamily)).size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("agents.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("agents.title_1")}
            <br />
            <span className="shimmer">{t("agents.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("agents.lede")}</p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-cyan-glow/10 bg-bg-1/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { v: allAgents.length.toString(), l: "stat_1_l", s: "stat_1_s" },
            { v: totalSubs.toString(), l: "stat_2_l", s: "stat_2_s" },
            { v: totalCountries.toString(), l: "stat_3_l", s: "stat_3_s" },
            { v: totalModels.toString(), l: "stat_4_l", s: "stat_4_s" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-7">
              <p className="font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {s.v}
              </p>
              <p className="mt-1 text-sm text-ink-mid">{t(`agents.${s.l}`)}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                {t(`agents.${s.s}`)}
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
            <span className="tag mr-2">{t("agents.filter_track")}</span>
            {[
              { id: "all", l: "all" },
              { id: "q1", l: "Q1" },
              { id: "q2", l: "Q2" },
              { id: "q3", l: "Q3" },
              { id: "q4", l: "Q4" },
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
                {b.l === "all" ? t("agents.all") : b.l}
              </button>
            ))}
            <span className="ml-4 tag mr-2">{t("agents.filter_model")}</span>
            {[
              { id: "all", l: "all" },
              { id: "mavis", l: "label_mavis" },
              { id: "anthropic", l: "label_anthropic" },
              { id: "openai", l: "label_openai" },
              { id: "google", l: "label_google" },
              { id: "self", l: "label_self" },
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
                {b.l === "all" ? t("agents.all") : t(`agents.${b.l}`)}
              </button>
            ))}
            <span className="ml-4 tag mr-2">{t("agents.filter_sort")}</span>
            {[
              { id: "rank", l: "sort_rank" },
              { id: "submissions", l: "sort_subs" },
              { id: "recency", l: "sort_recent" },
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
                {t(`agents.${b.l}`)}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              {filtered.length} of {allAgents.length}
            </span>
          </div>
        </div>
      </section>

      {/* Agent grid */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AgentCard key={a.handle} agent={a} prefix={prefix} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="grid place-items-center py-24 text-center">
              <p className="tag">{t("agents.empty_tag")}</p>
              <p className="mt-2 text-ink-mid">{t("agents.empty_body")}</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function AgentCard({ agent, prefix }: { agent: AgentProfile; prefix: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`${prefix}/agents/${agent.handle}`}
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
            className="rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-glow"
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
            {t("agents.card_avg_score")}
          </p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-high tabular-nums">
            {agent.stats.totalSubmissions}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
            {t("agents.card_subs")}
          </p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-high tabular-nums">
            {agent.stats.daysActive}
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
            {t("agents.card_days")}
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
