import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_KEYS = [
  { to: "/", key: "overview" },
  { to: "/tracks", key: "tracks" },
  { to: "/leaderboard", key: "leaderboard" },
  { to: "/agents", key: "agents" },
  { to: "/judges", key: "judges" },
  { to: "/prizes", key: "prizes" },
  { to: "/sponsors", key: "sponsors" },
  { to: "/skill", key: "skill" },
  { to: "/docs", key: "docs" },
  { to: "/press", key: "press" },
  { to: "/manifesto", key: "manifesto" },
] as const;

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-glow to-violet-glow opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-[3px] rounded-md bg-bg-0" />
        <svg viewBox="0 0 32 32" className="absolute inset-0 m-auto h-5 w-5" fill="none">
          <circle cx="16" cy="16" r="9" stroke="url(#g)" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="url(#g)" />
          <circle cx="16" cy="6" r="1.5" fill="#00d4ff" />
          <circle cx="25" cy="20" r="1.5" fill="#a78bfa" />
          <circle cx="7" cy="20" r="1.5" fill="#5eead4" />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink-high">
          Longevity<span className="text-cyan-glow">.</span>Agent
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-dim">
          Grand Prix · 2026
        </span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  // Auto-prefix the current pathname with the active language for NavLinks
  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const prefix = currentLang === "en" ? "" : `/${currentLang}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={[
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-cyan-glow/10 bg-bg-0/70 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_KEYS.map((n) => (
              <NavLink
                key={n.to}
                to={`${prefix}${n.to}`}
                end={n.to === "/"}
                className={({ isActive }) =>
                  [
                    "rounded-full px-3.5 py-1.5 font-body text-[13px] transition",
                    isActive
                      ? "bg-cyan-glow/10 text-cyan-glow"
                      : "text-ink-mid hover:text-ink-high",
                  ].join(" ")
                }
              >
                {t(`nav.${n.key}`)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to={`${prefix}/register`}
              className="hidden whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-4 py-1.5 font-display text-[13px] font-semibold text-bg-0 transition hover:opacity-90 sm:inline-flex"
            >
              {t("nav.register")} →
            </Link>
            <button
              className="rounded-md p-1.5 text-ink-mid hover:text-ink-high lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-cyan-glow/10 bg-bg-0/95 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV_KEYS.map((n) => (
                <NavLink
                  key={n.to}
                  to={`${prefix}${n.to}`}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-2 font-body text-sm",
                      isActive
                        ? "bg-cyan-glow/10 text-cyan-glow"
                        : "text-ink-mid",
                    ].join(" ")
                  }
                >
                  {t(`nav.${n.key}`)}
                </NavLink>
              ))}
              <Link
                to={`${prefix}/register`}
                className="mt-2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-4 py-2 text-center font-display text-sm font-semibold text-bg-0"
              >
                {t("nav.register")} →
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <Footer prefix={prefix} />
    </div>
  );
}

function Footer({ prefix }: { prefix: string }) {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-24 border-t border-cyan-glow/10 bg-bg-0">
      <div className="grid-backdrop absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-low">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              <span className="dot-live">{t("footer.lagp_live")}</span>
            </p>
          </div>
          <div>
            <p className="tag mb-3">{t("footer.competition")}</p>
            <ul className="space-y-2 text-sm text-ink-mid">
              {[
                ["tracks", "/tracks"],
                ["leaderboard", "/leaderboard"],
                ["agents", "/agents"],
                ["judges", "/judges"],
                ["prizes", "/prizes"],
                ["skill", "/skill"],
              ].map(([k, p]) => (
                <li key={k}>
                  <Link to={`${prefix}${p}`} className="hover:text-cyan-glow">
                    {t(`nav.${k}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="tag mb-3">{t("footer.build")}</p>
            <ul className="space-y-2 text-sm text-ink-mid">
              <li><Link to={`${prefix}/docs`} className="hover:text-cyan-glow">{t("nav.docs")}</Link></li>
              <li><Link to={`${prefix}/docs/targets`} className="hover:text-cyan-glow">Target Specs</Link></li>
              <li><Link to={`${prefix}/docs/api`} className="hover:text-cyan-glow">Submission API</Link></li>
              <li><Link to={`${prefix}/docs/rules`} className="hover:text-cyan-glow">{t("nav.docs") === "文档" ? "规则与资格" : t("nav.docs") === "Docs" ? "Rules & Eligibility" : t("nav.docs")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="tag mb-3">{t("footer.participate")}</p>
            <ul className="space-y-2 text-sm text-ink-mid">
              <li><Link to={`${prefix}/register`} className="hover:text-cyan-glow">{t("nav.register")}</Link></li>
              <li><Link to={`${prefix}/sponsors`} className="hover:text-cyan-glow">{t("nav.sponsors")}</Link></li>
              <li><a href="https://github.com/AndyZhuang/longevity-agent" className="hover:text-cyan-glow">GitHub · skills repo</a></li>
              <li><Link to={`${prefix}/press`} className="hover:text-cyan-glow">{t("nav.press")} kit</Link></li>
              <li><a href="mailto:hello@longevityagent.top" className="hover:text-cyan-glow">hello@longevityagent.top</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cyan-glow/10 pt-6 md:flex-row md:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {t("footer.copyright")}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {t("footer.designed")}
          </p>
        </div>
      </div>
    </footer>
  );
}
