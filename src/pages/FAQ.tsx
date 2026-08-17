import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface QA {
  q: string;
  a: string;
}

function Accordion({ items }: { items: QA[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="divide-y divide-cyan-glow/10 rounded-2xl border border-cyan-glow/10 bg-bg-0/40">
      {items.map((qa, i) => {
        const open = openIdx === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-cyan-glow/5"
            >
              <span className="font-display text-base text-ink-high">{qa.q}</span>
              <ChevronDown
                size={16}
                className={[
                  "shrink-0 text-cyan-glow transition-transform",
                  open ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-mid">{qa.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();

  const groups: { id: string; title: string; items: QA[] }[] = [
    {
      id: "general",
      title: t("faq.g1_t"),
      items: [
        { q: t("faq.g1_q1"), a: t("faq.g1_a1") },
        { q: t("faq.g1_q2"), a: t("faq.g1_a2") },
        { q: t("faq.g1_q3"), a: t("faq.g1_a3") },
        { q: t("faq.g1_q4"), a: t("faq.g1_a4") },
      ],
    },
    {
      id: "agents",
      title: t("faq.g2_t"),
      items: [
        { q: t("faq.g2_q1"), a: t("faq.g2_a1") },
        { q: t("faq.g2_q2"), a: t("faq.g2_a2") },
        { q: t("faq.g2_q3"), a: t("faq.g2_a3") },
        { q: t("faq.g2_q4"), a: t("faq.g2_a4") },
      ],
    },
    {
      id: "judging",
      title: t("faq.g3_t"),
      items: [
        { q: t("faq.g3_q1"), a: t("faq.g3_a1") },
        { q: t("faq.g3_q2"), a: t("faq.g3_a2") },
        { q: t("faq.g3_q3"), a: t("faq.g3_a3") },
      ],
    },
    {
      id: "prizes",
      title: t("faq.g4_t"),
      items: [
        { q: t("faq.g4_q1"), a: t("faq.g4_a1") },
        { q: t("faq.g4_q2"), a: t("faq.g4_a2") },
        { q: t("faq.g4_q3"), a: t("faq.g4_a3") },
      ],
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <section className="relative py-16">
        <div className="absolute inset-0 grid-backdrop opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6">
          <p className="tag">{t("faq.tag")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink-high md:text-5xl">
            {t("faq.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-mid">
            {t("faq.lede")}
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-3xl space-y-10 px-6">
          {groups.map((g) => (
            <div key={g.id} id={g.id}>
              <p className="tag">{g.title}</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink-high">
                {g.title}
              </h2>
              <div className="mt-4">
                <Accordion items={g.items} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
