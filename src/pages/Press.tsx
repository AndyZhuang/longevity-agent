import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { ArrowLeft, Mail, Download, FileText, Image as ImageIcon, Video, MessageCircle } from "lucide-react";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function Press() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            to={`${prefix}/`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-low transition hover:text-cyan-glow"
          >
            <ArrowLeft size={14} /> {t("press.back")}
          </Link>
          <p className="tag mt-6">{t("press.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("press.title_1")}
            <br />
            <span className="shimmer">{t("press.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("press.lede")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:press@longevityagent.top?subject=Press%20inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              <Mail size={14} /> {t("press.cta_email")}
            </a>
            <a
              href="#assets"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <Download size={14} /> {t("press.cta_download")}
            </a>
          </div>
        </div>
      </section>

      {/* Fact sheet */}
      <section className="relative border-y border-cyan-glow/10 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("press.factsheet_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("press.factsheet_h")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-px md:grid-cols-4">
            {[
              { v: "$1.16M", k: "fact_1_l" },
              { v: "1,200+", k: "fact_2_l" },
              { v: "47", k: "fact_3_l" },
              { v: "4", k: "fact_4_l" },
            ].map((s) => (
              <div key={s.k} className="px-5 py-5">
                <p className="font-display text-2xl font-semibold text-ink-high">{s.v}</p>
                <p className="mt-1 text-xs text-ink-mid">{t(`press.${s.k}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boilerplate */}
      <section className="relative py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="tag">{t("press.boiler_tag")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
              {t("press.boiler_h")}
            </h2>
            <p className="mt-3 text-sm text-ink-mid">{t("press.boiler_sub")}</p>
          </div>
          <div className="md:col-span-2 space-y-4 text-sm leading-relaxed text-ink-mid">
            <Trans i18nKey="press.boiler_p1_html" components={{ strong: <strong className="text-ink-high" /> }} />
            <Trans i18nKey="press.boiler_p2_html" />
          </div>
        </div>
      </section>

      {/* Pull quotes */}
      <section className="relative border-t border-cyan-glow/10 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("press.quotes_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("press.quotes_h")}</h2>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <blockquote
                key={i}
                className="glass rounded-xl p-5 font-display text-lg leading-relaxed text-ink-high"
              >
                {t(`press.quote_${i}`)}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Releases */}
      <section className="relative border-t border-cyan-glow/10 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("press.releases_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("press.releases_h")}</h2>
          <ol className="mt-6 relative ml-3 border-l border-cyan-glow/20 pl-6">
            {[
              { date: "2026-08-12", k: 1 },
              { date: "2026-01-15", k: 2 },
              { date: "2025-12-01", k: 3 },
            ].map((r) => (
              <li key={r.date} className="mb-7">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-cyan-glow" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
                  {new Date(r.date).toDateString()}
                </p>
                <h3 className="mt-0.5 font-display text-lg font-semibold text-ink-high">{t(`press.release_${r.k}_t`)}</h3>
                <p className="mt-1 text-sm text-ink-mid">{t(`press.release_${r.k}_b`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="relative border-t border-cyan-glow/10 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("press.assets_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">{t("press.assets_h")}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <AssetCard icon={FileText} i={1} />
            <AssetCard icon={ImageIcon} i={2} />
            <AssetCard icon={ImageIcon} i={3} />
            <AssetCard icon={FileText} i={4} />
            <AssetCard icon={Video} i={5} />
            <AssetCard icon={MessageCircle} i={6} />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {t("press.asset_attribution")}
          </p>
        </div>
      </section>
    </motion.div>
  );
}

function AssetCard({
  icon: Icon,
  i,
}: {
  icon: React.ElementType;
  i: number;
}) {
  const { t } = useTranslation();
  return (
    <a
      href="#"
      className="glass hover-lift flex items-center gap-3 rounded-xl p-4"
    >
      <div className="rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 p-2 text-cyan-glow">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm text-ink-high">{t(`press.asset_${i}_t`)}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">{t(`press.asset_${i}_m`)}</p>
      </div>
      <Download size={14} className="text-ink-dim" />
    </a>
  );
}
