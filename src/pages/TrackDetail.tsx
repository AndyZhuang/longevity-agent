import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, Trophy, FileText, Cpu, FlaskConical, Sparkles, Apple, Brain } from "lucide-react";
import { useLocalizedTracks } from "../lib/i18n-data";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

const trackIcons: Record<string, React.ElementType> = {
  q1: FlaskConical,
  q2: Sparkles,
  q3: Apple,
  q4: Brain,
};

export default function TrackDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const prefix = useLangPrefix();
  const tracks = useLocalizedTracks();
  const q = tracks.find((x) => x.id === id);
  if (!q) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="tag">{t("trackDetail.not_found_tag")}</p>
        <h1 className="mt-2 font-display text-3xl text-ink-high">{t("trackDetail.not_found_h")}</h1>
        <Link to={`${prefix}/tracks`} className="mt-6 inline-block text-cyan-glow hover:underline">
          {t("trackDetail.not_found_back")}
        </Link>
      </div>
    );
  }
  const Icon = trackIcons[q.id];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-12">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            to={`${prefix}/tracks`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-low transition hover:text-cyan-glow"
          >
            <ArrowLeft size={14} /> {t("trackDetail.back")}
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 p-2.5 text-cyan-glow">
              <Icon size={22} />
            </div>
            <div>
              <p className="tag">{q.code} · 2026</p>
              <h1 className="font-display text-4xl font-semibold text-ink-high">
                {q.label}
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-lg text-ink-mid">{q.theme}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`${prefix}/register`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
            >
              {t("trackDetail.submit_cta", { code: q.code })} <ArrowRight size={14} />
            </Link>
            <Link
              to={`${prefix}/docs`}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              <FileText size={14} /> {t("trackDetail.read_spec")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-5xl gap-6 px-6 grid md:grid-cols-3">
          {[
            { icon: Calendar, k: "meta_window", v: `${new Date(q.startsAt).toLocaleDateString()} → ${new Date(q.endsAt).toLocaleDateString()}` },
            { icon: Trophy, k: "meta_prize", v: `$${(q.spec.prizePool / 1000).toFixed(0)}k` },
            { icon: Cpu, k: "meta_judge", v: q.spec.headJudge },
          ].map((m) => (
            <div key={m.k} className="glass rounded-xl p-5">
              <m.icon className="text-cyan-glow" size={18} />
              <p className="mt-3 tag">{t(`trackDetail.${m.k}`)}</p>
              <p className="mt-1 font-display text-lg text-ink-high">{m.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">{t("trackDetail.objective_tag")}</p>
          <p className="mt-3 text-xl leading-relaxed text-ink-high">
            {q.objective}
          </p>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">{t("trackDetail.deliverables_tag")}</p>
          <ol className="mt-4 space-y-3">
            {q.deliverables.map((d, i) => (
              <li key={d} className="glass flex items-start gap-3 rounded-lg p-4">
                <span className="font-mono text-xs text-cyan-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-ink-mid">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="tag">{t("trackDetail.rubric_tag")}</p>
          <div className="mt-4 space-y-3">
            {q.rubric.map((r) => (
              <div key={r.name} className="glass rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-ink-high">{r.name}</span>
                  <span className="font-mono text-sm text-cyan-glow">
                    {Math.round(r.weight * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow"
                    style={{ width: `${r.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">{t("trackDetail.build_tag")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("trackDetail.build_h")}
          </h2>
          <p className="mt-3 text-ink-mid">{t("trackDetail.build_body")}</p>
          <Link
            to={`${prefix}/skill`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
          >
            {t("trackDetail.build_cta")} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
