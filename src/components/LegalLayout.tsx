/**
 * Shared layout for legal / FAQ pages. Renders a hero (tag + title + lede),
 * a sticky in-page TOC (when sections >= 2), the section list, and a
 * "back to docs" link at the bottom.
 *
 * Sections are passed as plain ReactNodes so each page can keep its own
 * JSX (e.g. a <details>/<summary> for FAQ, a <ol> for rules, etc.).
 */
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface LegalLayoutProps {
  tag: string;
  title: ReactNode;
  lede: string;
  sections: LegalSection[];
  /** Path to the page that links back (defaults to /about). */
  backTo?: string;
  /** Translated label for the back link. */
  backLabel?: string;
  /** Optional subtitle shown under the title (smaller, ink-mid). */
  subtitle?: string;
  /** Optional "last updated" date shown under the lede. */
  lastUpdated?: string;
}

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function LegalLayout({
  tag,
  title,
  lede,
  sections,
  backTo = "/about",
  backLabel,
  subtitle,
  lastUpdated,
}: LegalLayoutProps) {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const back = backLabel ?? t("common.back");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60vh]"
    >
      {/* Hero */}
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6">
          <p className="tag">{tag}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base text-ink-mid">{subtitle}</p>
          ) : null}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-mid">{lede}</p>
          {lastUpdated ? (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              {t("legal.last_updated", { date: lastUpdated })}
            </p>
          ) : null}
        </div>
      </section>

      {/* Body */}
      <section className="relative pb-20">
        <div
          className={
            sections.length >= 2
              ? "mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[220px_1fr]"
              : "mx-auto max-w-3xl px-6"
          }
        >
          {sections.length >= 2 ? (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="tag">{t("legal.contents")}</p>
              <ul className="mt-3 space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-md px-2 py-1.5 text-sm text-ink-mid transition hover:bg-cyan-glow/5 hover:text-ink-high"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <article className="glass rounded-2xl p-6 md:p-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-semibold text-ink-high">{s.title}</h2>
                <div className="prose-invert mt-4 space-y-4 text-sm leading-relaxed text-ink-mid">
                  {s.body}
                </div>
              </section>
            ))}
            <div className="mt-10 border-t border-cyan-glow/10 pt-6">
              <Link
                to={`${prefix}${backTo}`}
                className="inline-flex items-center gap-1.5 text-sm text-cyan-glow hover:underline"
              >
                <ArrowLeft size={14} /> {back}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </motion.div>
  );
}
