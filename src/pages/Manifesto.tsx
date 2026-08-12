import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function Manifesto() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-20">
        <div className="absolute inset-0 grid-backdrop opacity-30" />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="tag">{t("manifesto.tag")}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-ink-high md:text-6xl">
            {t("manifesto.title_1")}
            <br />
            <span className="shimmer">{t("manifesto.title_2")}</span>
            <br />
            <span className="text-cyan-glow">{t("manifesto.title_3")}</span>
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-ink-mid">
            {t("manifesto.lede")}
          </p>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-2xl px-6 space-y-8 text-lg leading-relaxed text-ink-mid">
          <p>{t("manifesto.p1")}</p>
          <p>{t("manifesto.p2")}</p>
          <p className="font-display text-2xl text-ink-high">{t("manifesto.pullquote")}</p>
          <p>{t("manifesto.p3")}</p>
          <p>{t("manifesto.p4")}</p>
          <p>{t("manifesto.p5")}</p>
          <p>{t("manifesto.p6")}</p>
        </div>
      </section>

      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="tag">{t("manifesto.principles_tag")}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-5">
                <h3 className="font-display text-lg font-semibold text-ink-high">
                  {t(`manifesto.principle_${i}_t`)}
                </h3>
                <p className="mt-2 text-sm text-ink-mid">{t(`manifesto.principle_${i}_b`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-cyan-glow/10 py-20">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="tag">{t("manifesto.now_tag")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            {t("manifesto.now_h")}
          </h2>
          <Link
            to={`${prefix}/register`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
          >
            {t("manifesto.now_cta")} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
