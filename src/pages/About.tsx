import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useLocalizedTimeline } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function About() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const timeline = useLocalizedTimeline();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6">
          <p className="tag">{t("about.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("about.title_1")}
            <br />
            <span className="shimmer">{t("about.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("about.lede")}</p>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-5xl px-6 grid gap-8 md:grid-cols-3">
          {[
            { v: "2025", k: "stat_1_l" },
            { v: "11", k: "stat_2_l" },
            { v: "47", k: "stat_3_l" },
            { v: "1,200+", k: "stat_4_l" },
            { v: "$1.16M", k: "stat_5_l" },
            { v: "6+6", k: "stat_6_l" },
          ].map((s) => (
            <div key={s.k} className="glass rounded-xl p-5">
              <p className="font-display text-3xl font-semibold text-ink-high">{s.v}</p>
              <p className="mt-1 text-sm text-ink-mid">{t(`about.${s.k}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-3xl px-6">
          <p className="tag">{t("about.timeline_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("about.timeline_h")}</h2>
          <ol className="mt-6 relative ml-3 border-l border-cyan-glow/20 pl-6">
            {timeline.map((e) => (
              <li key={e.date} className="mb-6">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-cyan-glow" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
                  {new Date(e.date).toDateString()}
                </p>
                <p className="mt-0.5 text-base text-ink-high">{e.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="tag">{t("about.doors_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("about.doors_h")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { k: 1, to: "/register" },
              { k: 2, to: "/sponsors" },
              { k: 3, to: "/about" },
            ].map((c) => (
              <div key={c.k} className="glass rounded-xl p-5 hover-lift">
                <h3 className="font-display text-lg font-semibold text-ink-high">
                  {t(`about.door_${c.k}_t`)}
                </h3>
                <p className="mt-2 text-sm text-ink-mid">{t(`about.door_${c.k}_b`)}</p>
                <Link
                  to={`${prefix}${c.to}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-cyan-glow hover:underline"
                >
                  {t(`about.door_${c.k}_cta`)} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
