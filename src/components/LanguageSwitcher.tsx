import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe2, Check, ChevronDown } from "lucide-react";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  withLang,
  type Language,
} from "../i18n/config";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0] as Language;
  const cur = LANGUAGE_LABELS[current] ?? LANGUAGE_LABELS.en;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (lang: Language) => {
    setOpen(false);
    const next = withLang(loc.pathname, lang);
    if (next !== loc.pathname) navigate(next);
    void i18n.changeLanguage(lang);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1.5 rounded-full border border-cyan-glow/20 bg-bg-0/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid transition hover:border-cyan-glow/50 hover:text-cyan-glow",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe2 size={12} />
        <span>{cur.flag}</span>
        {!compact && <span className="hidden md:inline">{cur.native}</span>}
        <ChevronDown size={11} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <div
          role="listbox"
          className="glass absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl p-1"
        >
          {SUPPORTED_LANGUAGES.map((l) => {
            const label = LANGUAGE_LABELS[l];
            const active = l === current;
            return (
              <button
                key={l}
                type="button"
                onClick={() => choose(l)}
                role="option"
                aria-selected={active}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm transition",
                  active
                    ? "bg-cyan-glow/10 text-cyan-glow"
                    : "text-ink-mid hover:bg-cyan-glow/5 hover:text-ink-high",
                ].join(" ")}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  {label.flag}
                </span>
                <span className="flex-1">
                  <span className="block">{label.native}</span>
                  {label.english !== label.native && (
                    <span className="block text-[10px] text-ink-dim">{label.english}</span>
                  )}
                </span>
                {active && <Check size={14} className="shrink-0 text-cyan-glow" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
