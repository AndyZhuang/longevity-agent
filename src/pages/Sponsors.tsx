import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Pill,
  Sparkles,
  Wheat,
  Check,
  Microscope,
  FlaskConical,
  Package,
  BadgeCheck,
  Globe2,
  Mail,
  Building2,
  User,
} from "lucide-react";

const tracks = [
  {
    icon: Pill,
    labelKey: "pharma_title",
    color: "cyan",
    bulletKeys: ["pharma_1", "pharma_2", "pharma_3"],
  },
  {
    icon: Sparkles,
    labelKey: "beauty_title",
    color: "violet",
    bulletKeys: ["beauty_1", "beauty_2", "beauty_3"],
  },
  {
    icon: Wheat,
    labelKey: "food_title",
    color: "gold",
    bulletKeys: ["food_1", "food_2", "food_3"],
  },
];

const tiers = [
  {
    name: "Founding Sponsor",
    price: "$250,000+",
    slots: "4 slots · 1 already taken",
    perks: [
      "Head judge seat on the relevant quarter",
      "Logo on home + footer for full year",
      "Right of first negotiation on quarter champion IP",
      "Speaking slot at the live judging event",
      "Co-branded post-event white paper",
    ],
  },
  {
    name: "Track Sponsor",
    price: "$60,000 / quarter",
    slots: "12 slots total",
    perks: [
      "Sponsor-side judge seat",
      "Logo on track page + livestream",
      "First-look deck on the top 10 finalists",
      "Quarter-specific white paper co-authorship",
    ],
  },
  {
    name: "In-Kind Partner",
    price: "Service / lab time",
    slots: "Open",
    perks: [
      "Wet-lab validation partner for quarter champions",
      "Co-credit on Nature Longevity special issue",
      "Featured in the 'In-Kind Partners' grid",
    ],
  },
];

const colorMap: Record<string, string> = {
  cyan: "text-cyan-glow",
  violet: "text-violet-glow",
  gold: "text-gold-glow",
};

export default function Sponsors() {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("sponsors.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("sponsors.title_1")}
            <br />
            <span className="shimmer">{t("sponsors.title_2")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("sponsors.subtitle")}</p>
        </div>
      </section>

      {/* By industry */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="tag">{t("sponsors.by_industry")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("sponsors.industries_title")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tracks.map((tr) => (
              <div key={tr.labelKey} className="glass hover-lift rounded-2xl p-6">
                <tr.icon className={colorMap[tr.color]} size={22} />
                <h3 className="mt-3 font-display text-xl font-semibold text-ink-high">
                  {t(`sponsors.${tr.labelKey}`)}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-mid">
                  {tr.bulletKeys.map((k) => (
                    <li key={k} className="flex gap-2">
                      <Check size={14} className={`mt-0.5 shrink-0 ${colorMap[tr.color]}`} />
                      <span>{t(`sponsors.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="tag">{t("sponsors.tiers_title")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("sponsors.tiers_sub")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={[
                  "glass hover-lift relative overflow-hidden rounded-2xl p-6",
                  i === 0 && "ring-1 ring-cyan-glow/30",
                ].filter(Boolean).join(" ")}
              >
                {i === 0 && (
                  <span className="absolute right-4 top-4 rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-glow">
                    flagship
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-ink-high">
                  {tier.name}
                </h3>
                <p className="mt-1 font-display text-2xl font-semibold text-cyan-glow">
                  {tier.price}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  {tier.slots}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-ink-mid">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-cyan-glow" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-kind partners */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="tag">{t("sponsors.inkind_title")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-high">
            {t("sponsors.inkind_sub")}
          </h2>
          <p className="mt-3 max-w-2xl text-ink-mid">{t("sponsors.inkind_body")}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Microscope, label: "Wet-lab CRO" },
              { icon: FlaskConical, label: "Formulation Lab" },
              { icon: Package, label: "Pilot Manufacturing" },
              { icon: BadgeCheck, label: "Clinical Trial Network" },
              { icon: Globe2, label: "Bioavailability Lab" },
              { icon: Microscope, label: "In-vitro CRO" },
              { icon: FlaskConical, label: "ADMET Panel" },
              { icon: Package, label: "Stability & Shelf-life" },
            ].map((p) => (
              <div key={p.label} className="glass rounded-xl p-4 text-center">
                <p.icon size={20} className="mx-auto text-cyan-glow" />
                <p className="mt-2 text-sm text-ink-mid">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <SponsorInquiryForm />
    </motion.div>
  );
}

function SponsorInquiryForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Founding Sponsor");
  const [industry, setIndustry] = useState("Pharma");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative border-t border-cyan-glow/10 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="tag">{t("sponsors.inquiry_tag")}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            {t("sponsors.inquiry_title")}
          </h2>
          <p className="mt-4 text-ink-mid">{t("sponsors.inquiry_sub")}</p>
          <div className="mt-6 space-y-3">
            {[
              "Founding Sponsor · reviewed by full Council; 1 slot per quarter, 4 total",
              "Track Sponsor · reviewed by Steward Council + relevant head judge",
              "In-Kind · rolling acceptance; we confirm scope before signing",
            ].map((t) => (
              <div
                key={t}
                className="flex items-start gap-2 rounded-lg border border-cyan-glow/10 bg-bg-0/40 p-3"
              >
                <Check size={14} className="mt-0.5 shrink-0 text-cyan-glow" />
                <span className="text-sm text-ink-mid">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          {!submitted ? (
            <>
              <h3 className="font-display text-lg font-semibold text-ink-high">
                Send an inquiry
              </h3>
              <p className="mt-1 text-sm text-ink-mid">
                We'll reply with availability, a draft term sheet, and a calendar link.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="tag">{t("sponsors.form_name")}</label>
                  <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                    <span className="flex items-center px-3 text-ink-dim">
                      <User size={14} />
                    </span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Stone"
                      className="flex-1 bg-transparent py-2 pr-3 text-sm text-ink-high placeholder-ink-dim outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="tag">{t("sponsors.form_org")}</label>
                  <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                    <span className="flex items-center px-3 text-ink-dim">
                      <Building2 size={14} />
                    </span>
                    <input
                      required
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder="Acme Pharma"
                      className="flex-1 bg-transparent py-2 pr-3 text-sm text-ink-high placeholder-ink-dim outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="tag">{t("sponsors.form_email")}</label>
                  <div className="mt-1 flex rounded-md border border-cyan-glow/20 bg-bg-0 focus-within:border-cyan-glow/60">
                    <span className="flex items-center px-3 text-ink-dim">
                      <Mail size={14} />
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@acme.com"
                      className="flex-1 bg-transparent py-2 pr-3 text-sm text-ink-high placeholder-ink-dim outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="tag">{t("sponsors.form_industry")}</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="mt-1 w-full rounded-md border border-cyan-glow/20 bg-bg-0 px-3 py-2 text-sm text-ink-high outline-none focus:border-cyan-glow/60"
                    >
                      <option>Pharma</option>
                      <option>Beauty</option>
                      <option>Functional Food</option>
                      <option>CRO / Lab</option>
                      <option>Investor / Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="tag">{t("sponsors.form_tier")}</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="mt-1 w-full rounded-md border border-cyan-glow/20 bg-bg-0 px-3 py-2 text-sm text-ink-high outline-none focus:border-cyan-glow/60"
                    >
                      <option>Founding Sponsor</option>
                      <option>Track Sponsor</option>
                      <option>In-Kind Partner</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
                >
                  {t("sponsors.submit")} <ArrowRight size={14} />
                </button>
              </form>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                By submitting, you agree to be contacted by the LAGP Steward Council.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-glow/15 text-cyan-glow">
                <Check size={22} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink-high">
                Inquiry sent.
              </h3>
              <p className="mt-2 text-sm text-ink-mid">
                A member of the Steward Council will reach out to{" "}
                <span className="text-ink-high">{email}</span> within 5 business days with a draft term
                sheet and a calendar link.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-2 text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
              >
                ← Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
