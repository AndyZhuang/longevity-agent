import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { Trophy } from "lucide-react";
import { useLocalizedPrizeTiers } from "../lib/i18n-data";

const colorMap: Record<string, { ring: string; text: string; border: string; bg: string; gradient: string }> = {
  gold: { ring: "ring-gold-glow/30", text: "text-gold-glow", border: "border-gold-glow/40", bg: "bg-gold-glow/10", gradient: "from-gold-glow/30" },
  cyan: { ring: "ring-cyan-glow/30", text: "text-cyan-glow", border: "border-cyan-glow/40", bg: "bg-cyan-glow/10", gradient: "from-cyan-glow/30" },
  violet: { ring: "ring-violet-glow/30", text: "text-violet-glow", border: "border-violet-glow/40", bg: "bg-violet-glow/10", gradient: "from-violet-glow/30" },
};

export default function Prizes() {
  const { t } = useTranslation();
  const tiers = useLocalizedPrizeTiers();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="tag">{t("prizes.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            <Trans i18nKey="prizes.title_1_html" components={{ span: <span /> }} />
          </h1>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("prizes.lede")}</p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-6 space-y-4">
          {tiers.map((p) => {
            const c = colorMap[p.color];
            return (
              <div
                key={p.place}
                className="glass hover-lift relative overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.gradient} to-transparent`} />
                <div className="grid gap-6 p-6 md:grid-cols-[120px_1fr_220px] md:items-center">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} md:mx-0`}>
                    <Trophy size={28} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink-high">
                      {p.place}
                    </h2>
                    <ul className="mt-2 space-y-1 text-sm text-ink-mid">
                      {p.extras.map((e) => (
                        <li key={e} className="flex gap-2">
                          <span className={`mt-2 inline-block h-1 w-1 rounded-full ${c.text.replace("text-", "bg-")}`} />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-display text-3xl font-semibold ${c.text}`}>
                      {p.payout}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="tag">{t("prizes.numbers_tag")}</p>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { v: "$1.16M", k: "num_1_l" },
              { v: "4", k: "num_2_l" },
              { v: "12", k: "num_3_l" },
              { v: "1", k: "num_4_l" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-3xl font-semibold text-ink-high">{s.v}</p>
                <p className="mt-1 text-sm text-ink-mid">{t(`prizes.${s.k}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
