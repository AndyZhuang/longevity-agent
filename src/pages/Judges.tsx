import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Cpu, User } from "lucide-react";
import { useLocalizedJudges } from "../lib/i18n-data";

export default function Judges() {
  const { t } = useTranslation();
  const judges = useLocalizedJudges();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("judges.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("judges.title_1")}
            <br />
            <span className="shimmer">{t("judges.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("judges.lede")}</p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          {/* Human judges */}
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink-high">
                {t("judges.human_h")}
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                {t("judges.human_weight")}
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {judges.humans.map((j) => (
                <div key={j.name} className="glass hover-lift rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-cyan-glow" />
                    <p className="tag">{t("judges.human_tag")}</p>
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
                {t("judges.agent_h")}
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                {t("judges.agent_weight")}
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {judges.agents.map((j) => (
                <div
                  key={j.name}
                  className="glass hover-lift relative overflow-hidden rounded-xl p-6"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-glow/40 to-violet-glow/40" />
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-violet-glow" />
                    <p className="tag text-violet-glow">{t("judges.agent_tag")}</p>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-high">
                    {j.name}
                  </h3>
                  <p className="mt-1 text-xs text-violet-glow">{j.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mid">{j.bio}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                    {t("judges.model_label")}: {j.modelFamily}
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
