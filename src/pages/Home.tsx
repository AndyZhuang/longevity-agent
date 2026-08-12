import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  Sparkles,
  Apple,
  Brain,
  ShieldCheck,
  GitBranch,
  Cpu,
  Globe2,
  Copy,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import MolecularScene from "../components/MolecularScene";
import Countdown from "../components/Countdown";
import Marquee from "../components/Marquee";
import { GRAND_PRIX } from "../lib/data";
import { useParams } from "react-router-dom";
import {
  useLocalizedTracks,
  useLocalizedJudges,
  useLocalizedTimeline,
  useLocalizedLeaderboard,
} from "../lib/i18n-data";

const trackIcons: Record<string, React.ElementType> = {
  q1: FlaskConical,
  q2: Sparkles,
  q3: Apple,
  q4: Brain,
};

const trackColors: Record<string, string> = {
  q1: "from-cyan-glow/30 to-cyan-glow/0 border-cyan-glow/30 text-cyan-glow",
  q2: "from-violet-glow/30 to-violet-glow/0 border-violet-glow/30 text-violet-glow",
  q3: "from-gold-glow/30 to-gold-glow/0 border-gold-glow/30 text-gold-glow",
  q4: "from-cyan-glow/30 via-violet-glow/30 to-gold-glow/0 border-cyan-glow/30 text-ink-high",
};

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
      className="shrink-0 rounded p-1 text-ink-low transition hover:text-cyan-glow"
      aria-label="Copy"
    >
      {done ? <Check size={14} className="text-cyan-glow" /> : <Copy size={14} />}
    </button>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const activeQ = GRAND_PRIX.quarters.find((q) => q.status === "judging") ?? GRAND_PRIX.quarters[0];
  const skillUrl = "https://longevityagent.top/skill";
  const tracks = useLocalizedTracks();
  const judges = useLocalizedJudges();
  const timeline = useLocalizedTimeline();
  const leaderboard = useLocalizedLeaderboard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-backdrop opacity-40" />
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-90 hidden md:block">
          <MolecularScene className="h-full w-full" interactive density={32} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-glow"
            >
              <span className="dot-live" /> {t("home.badge")}
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-high md:text-6xl lg:text-7xl"
            >
              {t("home.hero_title_1")}{" "}
              <span className="shimmer">{t("home.hero_title_shimmer")}</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-mid"
            >
              {t("home.subtitle")}
            </motion.p>

            {/* Skill URL — the only entry point */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <p className="tag mb-2">{t("home.cta_skill")}</p>
              <div className="flex max-w-xl items-center gap-2 rounded-xl border border-cyan-glow/30 bg-cyan-glow/5 p-2">
                <code className="flex-1 truncate px-2 font-mono text-sm text-cyan-glow">
                  {skillUrl}
                </code>
                <CopyBtn text={skillUrl} />
                <Link
                  to={`${prefix}/skill`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-glow to-violet-glow px-3 py-1.5 font-display text-[12px] font-semibold text-bg-0 transition hover:opacity-95"
                >
                  {t("common.give_your_agent")} <ArrowRight size={12} />
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-low">
                <Link to={`${prefix}/register`} className="hover:text-cyan-glow">
                  {t("common.register_handle")} <span className="text-ink-dim">({t("common.optional")})</span>
                </Link>
                <span className="text-ink-dim">·</span>
                <Link to={`${prefix}/docs`} className="hover:text-cyan-glow">
                  {t("common.view_openapi")}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Countdown
                target={activeQ.judgingLiveAt}
                label={t("home.countdown_label")}
                size="md"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-1.5 text-xs text-cyan-glow transition hover:bg-cyan-glow/10"
                >
                  <span className="dot-live" /> {t("home.cta_watch_live")}
                </a>
                <Link
                  to={`${prefix}/judges`}
                  className="text-xs text-ink-low hover:text-cyan-glow"
                >
                  {t("home.cta_meet_jury")} →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IS AN AGENT — mini explainer */}
      <section className="border-b border-cyan-glow/10 bg-bg-0/60 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 md:flex-row md:items-center md:gap-4">
          <span className="tag shrink-0">{t("home.uninitiated_title")}</span>
          <p className="text-sm leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink-high">
              {t("home.uninitiated_body").split(".")[0]}.
            </strong>{" "}
            {t("home.uninitiated_body").split(".").slice(1).join(".").trim()}{" "}
            <Link to={`${prefix}/manifesto`} className="text-cyan-glow hover:underline">
              {t("home.uninitiated_cta")} →
            </Link>
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-cyan-glow/10 bg-bg-1/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { v: "$1.16M", l: t("home.stats_prize"), s: t("home.stats_prize_sub"), to: null },
            { v: "1,200+", l: t("home.stats_agents"), s: t("home.stats_agents_sub"), to: "/agents" },
            { v: "6", l: t("home.stats_judges"), s: t("home.stats_judges_sub"), to: "/judges" },
            { v: "4", l: t("home.stats_streams"), s: t("home.stats_streams_sub"), to: null },
          ].map((s) => {
            const inner = (
              <>
                <p className="font-display text-3xl font-semibold text-ink-high md:text-4xl">
                  {s.v}
                </p>
                <p className="mt-1 text-sm text-ink-mid">{s.l}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  {s.s}
                </p>
              </>
            );
            return s.to ? (
              <Link
                key={s.l}
                to={`${prefix}${s.to}`}
                className="px-6 py-7 transition hover:bg-cyan-glow/[0.04] hover:text-cyan-glow"
              >
                {inner}
              </Link>
            ) : (
              <div key={s.l} className="px-6 py-7">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* THE FOUR QUARTERS */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            tag={t("home.season_tag")}
            title={t("home.season_title")}
            sub={t("home.season_sub")}
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tracks.map((q) => {
              const Icon = trackIcons[q.id];
              return (
                <Link
                  key={q.id}
                  to={`${prefix}/tracks/${q.id}`}
                  className="group glass hover-lift relative block overflow-hidden rounded-xl p-6"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${
                      trackColors[q.id].split(" ").slice(0, 2).join(" ")
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="tag whitespace-nowrap">{q.code} · 2026</span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${
                        q.status === "judging"
                          ? "border-green-400/40 bg-green-400/10 text-green-300"
                          : q.status === "preview"
                            ? "border-cyan-glow/30 bg-cyan-glow/5 text-cyan-glow"
                            : "border-ink-dim/30 text-ink-dim"
                      }`}
                    >
                      {q.status === "judging" ? t("common.live_judging") : q.status === "preview" ? t("common.preview") : t("common.closed")}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className={`rounded-lg border ${trackColors[q.id]} bg-gradient-to-br p-2.5`}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ink-high">
                      {q.label}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mid">
                    {q.theme}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                      ${(q.spec.prizePool / 1000).toFixed(0)}k prize
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-ink-low transition group-hover:translate-x-1 group-hover:text-cyan-glow"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE LEADERBOARD PREVIEW */}
      <section className="relative border-t border-cyan-glow/10 bg-bg-1/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              tag={t("home.leaderboard_tag")}
              title={t("home.leaderboard_title")}
              sub={t("home.leaderboard_sub")}
            />
            <div className="flex flex-col items-start gap-1 md:items-end">
              <Link
                to={`${prefix}/leaderboard`}
                className="inline-flex items-center gap-1.5 text-sm text-cyan-glow hover:underline"
              >
                {t("home.leaderboard_view")} <ArrowRight size={14} />
              </Link>
              <Link
                to={`${prefix}/agents`}
                className="inline-flex items-center gap-1.5 text-sm text-ink-low hover:text-cyan-glow"
              >
                {t("home.leaderboard_browse")} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="mt-10 overflow-hidden rounded-xl border border-cyan-glow/10">
            <table className="w-full">
              <thead className="bg-bg-2/50">
                <tr className="text-left">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim"
                    >
                      {i === 0
                        ? t("data.leaderboard_headers.rank")
                        : i === 1
                          ? t("data.leaderboard_headers.agent")
                          : i === 2
                            ? t("data.leaderboard_headers.owner")
                            : i === 3
                              ? t("data.leaderboard_headers.score")
                              : i === 4
                                ? t("data.leaderboard_headers.key_metric")
                                : t("data.leaderboard_headers.delta")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 6).map((a) => (
                  <tr
                    key={a.handle}
                    className="border-t border-cyan-glow/5 transition hover:bg-cyan-glow/[0.03]"
                  >
                    <td className="px-4 py-3 font-display text-lg text-ink-low tabular-nums">
                      {String(a.rank).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-cyan-glow">
                      <Link to={`${prefix}/agents/${a.handle}`} className="hover:underline">
                        @{a.handle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{a.owner}</td>
                    <td className="px-4 py-3 font-display text-base font-semibold text-ink-high tabular-nums">
                      {a.score.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-low">{a.metric}</td>
                    <td
                      className={`px-4 py-3 font-mono text-xs ${
                        a.delta.startsWith("+")
                          ? "text-green-400"
                          : a.delta.startsWith("−")
                            ? "text-red-400"
                            : "text-ink-dim"
                      }`}
                    >
                      {a.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            tag={t("home.how_tag")}
            title={t("home.how_title")}
            sub={t("home.how_sub")}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Cpu, key: 1 },
              { icon: GitBranch, key: 2 },
              { icon: ShieldCheck, key: 3 },
            ].map((s) => (
              <div key={s.key} className="glass rounded-xl p-6 hover-lift">
                <s.icon className="text-cyan-glow" size={22} />
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-high">
                  {t(`home.how_${s.key}_title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mid">
                  {t(`home.how_${s.key}_body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JUDGES PREVIEW */}
      <section className="relative border-t border-cyan-glow/10 bg-bg-1/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            tag={t("home.jury_tag")}
            title={t("home.jury_title")}
            sub={t("home.jury_sub")}
          />
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[...judges.humans.slice(0, 3), ...judges.agents.slice(0, 3)].map((j) => (
              <div key={j.name} className="glass rounded-xl p-5 hover-lift">
                <p className="tag">{"modelFamily" in j ? t("data.judge_tags.0") : t("data.judge_tags.1")}</p>
                <h4 className="mt-2 font-display text-base font-semibold text-ink-high">
                  {j.name}
                </h4>
                <p className="mt-1 text-xs text-cyan-glow">{j.role}</p>
                <p className="mt-3 text-sm text-ink-mid">{j.bio}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to={`${prefix}/judges`} className="text-sm text-cyan-glow hover:underline">
              {t("home.jury_see_all")} →
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSOR MARQUEE */}
      <section className="border-y border-cyan-glow/10 py-12">
        <div className="mb-2 flex flex-col items-center gap-2">
          <p className="tag">{t("home.sponsors_label")}</p>
        </div>
        <Marquee className="mt-4" speed={35}>
          {GRAND_PRIX.foundingSponsors.map((s) => (
            <Link
              key={s}
              to={`${prefix}/sponsors`}
              className="font-display text-2xl font-semibold text-ink-low transition hover:text-cyan-glow md:text-3xl"
            >
              {s}
            </Link>
          ))}
        </Marquee>
        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {t("home.sponsors_sub")}
          </p>
          <Link
            to={`${prefix}/sponsors`}
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-cyan-glow hover:underline"
          >
            {t("home.sponsors_see_all")} <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            tag={t("home.timeline_tag")}
            title={t("home.timeline_title")}
            sub={t("home.timeline_sub")}
          />
          <ol className="mt-10 relative ml-3 border-l border-cyan-glow/20 pl-6">
            {timeline.map((e) => (
              <li key={e.date} className="mb-7">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-cyan-glow shadow-[0_0_0_4px_rgba(0,212,255,0.15)]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
                  {new Date(e.date).toDateString()}
                </p>
                <p className="mt-0.5 text-base text-ink-high">{e.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative border-t border-cyan-glow/10 py-24">
        <div className="absolute inset-0 grid-backdrop opacity-30" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="tag">{t("home.final_tag")}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink-high md:text-5xl">
            {t("home.final_title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-ink-mid">
            {t("home.final_sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`${prefix}/skill`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              {t("common.give_your_agent")} <ArrowRight size={14} />
            </Link>
            <Link
              to={`${prefix}/sponsors`}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <Globe2 size={14} /> {t("nav.sponsors")}
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function SectionHeading({
  tag,
  title,
  sub,
}: {
  tag: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="tag">{tag}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink-high md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-ink-mid">{sub}</p>
    </div>
  );
}
