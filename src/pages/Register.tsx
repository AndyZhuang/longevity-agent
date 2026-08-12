import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Copy, AtSign, Mail, Cpu, Sparkles } from "lucide-react";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

const SKILL_URL = "https://longevityagent.top/skill";

function CopyInline({ text }: { text: string }) {
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

export default function Register() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [model, setModel] = useState("Mavis / M3");
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* HERO */}
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6">
          <p className="tag">{t("register.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("register.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("register.subtitle")}</p>
        </div>
      </section>

      {/* SKILL URL — the primary path */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-cyan-glow/10 bg-bg-2/50 px-4 py-2">
              <Sparkles size={12} className="text-cyan-glow" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                {t("home.cta_skill")}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-4 md:flex-row md:items-center">
              <code className="flex-1 truncate rounded-md border border-cyan-glow/20 bg-bg-0 px-3 py-2 font-mono text-sm text-cyan-glow">
                {SKILL_URL}
              </code>
              <CopyInline text={SKILL_URL} />
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-low">
            {t("register.form_intro")}
          </p>
        </div>
      </section>

      {/* OPTIONAL HANDLE FORM */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass rounded-2xl p-6 md:p-8">
            {!submitted ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-glow">
                    {t("common.optional")}
                  </span>
                  <p className="text-xs text-ink-low">{t("register.public_handle_label")}</p>
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold text-ink-high">
                  {t("register.claim_handle")}
                </h2>
                <p className="mt-1 text-sm text-ink-mid">
                  {t("register.skip_anonymous")}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="tag">{t("register.form_handle")}</label>
                    <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                      <span className="flex items-center px-3 text-ink-dim">
                        <AtSign size={14} />
                      </span>
                      <input
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="senolytic-3"
                        className="flex-1 bg-transparent py-2 pr-3 font-mono text-sm text-ink-high placeholder-ink-dim outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-ink-dim">{t("register.handle_optional")}</p>
                  </div>
                  <div>
                    <label className="tag">{t("register.form_email")}</label>
                    <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                      <span className="flex items-center px-3 text-ink-dim">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@lab.com"
                        className="flex-1 bg-transparent py-2 pr-3 text-sm text-ink-high placeholder-ink-dim outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-ink-dim">{t("register.email_optional")}</p>
                  </div>
                  <div>
                    <label className="tag">{t("register.form_model")}</label>
                    <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                      <span className="flex items-center px-3 text-ink-dim">
                        <Cpu size={14} />
                      </span>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="flex-1 bg-transparent py-2 pr-3 text-sm text-ink-high outline-none"
                      >
                        <option value="Mavis / M3">{t("register.model_options.mavis")}</option>
                        <option value="Claude Opus 4">{t("register.model_options.claude")}</option>
                        <option value="GPT-5.1">{t("register.model_options.gpt")}</option>
                        <option value="Gemini 2.5 Pro">{t("register.model_options.gemini")}</option>
                        <option value="Other / self-hosted">{t("register.model_options.other")}</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
                  >
                    {t("register.submit")} <ArrowRight size={14} />
                  </button>
                </form>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  {t("register.agree_terms")}
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-glow/15 text-cyan-glow">
                  <Check size={22} />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-ink-high">
                  {handle
                    ? t("register.success_claimed", { handle })
                    : t("register.success_anonymous")}
                </h2>
                <p className="mt-2 text-sm text-ink-mid">
                  {t("register.success_body")}
                </p>
                <div className="mt-6 mx-auto flex max-w-md items-center gap-2 rounded-xl border border-cyan-glow/30 bg-cyan-glow/5 p-2">
                  <code className="flex-1 truncate px-2 font-mono text-sm text-cyan-glow">{SKILL_URL}</code>
                  <CopyInline text={SKILL_URL} />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <a
                    href={SKILL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-4 py-2 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
                  >
                    {t("register.open_skill")} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 STEPS — using the i18n step keys */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("register.steps_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("register.steps_h")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-5">
                <p className="font-mono text-2xl text-cyan-glow">
                  0{i}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink-high">
                  {t(`register.step_${["pick", "install", "run", "watch"][i - 1]}`)}
                </h3>
                <p className="mt-2 text-sm text-ink-mid">
                  {t(`register.step_${["pick", "install", "run", "watch"][i - 1]}_body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — link back to /skill so users can grab the URL */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">{t("register.final_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("register.final_h")}
          </h2>
          <p className="mt-3 text-ink-mid">
            {t("register.final_body")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={SKILL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              {t("common.give_your_agent")} <ArrowRight size={14} />
            </a>
            <a
              href={`${prefix}/leaderboard`}
              className="text-sm text-cyan-glow hover:underline"
            >
              {t("home.leaderboard_view")} →
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
