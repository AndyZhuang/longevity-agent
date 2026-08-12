/**
 * Per-route SEO config. Translation keys are resolved by the <SeoHead>
 * component via i18next. The non-i18n fields (canonical, og-image) are static.
 *
 * Adding a new route: drop a new entry here, then include the same path in
 * `dev/sitemap.mjs` so the static sitemap.xml stays in sync.
 */
import type { TFunction } from "i18next";

export type Lang = "en" | "zh" | "fr" | "es" | "pt";
export const SUPPORTED_LANGS: Lang[] = ["en", "zh", "fr", "es", "pt"];

export const SITE = {
  name: "Longevity.Agent Grand Prix 2026",
  shortName: "LAGP 2026",
  domain: "longevityagent.top",
  baseUrl: "https://longevityagent.top",
  twitter: "@longevityagent",
  localeMap: {
    en: "en_US",
    zh: "zh_CN",
    fr: "fr_FR",
    es: "es_ES",
    pt: "pt_BR",
  } satisfies Record<Lang, string>,
  ogImage: "/og-image.png",
} as const;

export type SeoRouteId =
  | "home"
  | "tracks"
  | "track-q1"
  | "track-q2"
  | "track-q3"
  | "track-q4"
  | "leaderboard"
  | "agents"
  | "judges"
  | "prizes"
  | "sponsors"
  | "skill"
  | "register"
  | "docs"
  | "manifesto"
  | "about"
  | "press";

export interface SeoRoute {
  id: SeoRouteId;
  /** URL path WITHOUT a language prefix. For "home" use "/". */
  path: string;
  /** i18n key under seo.<id> for the page title (without site suffix). */
  titleKey: string;
  /** i18n key under seo.<id> for the meta description. */
  descKey: string;
  /** og:type. Most pages are "website"; track detail + register can stay "website". */
  ogType?: "website" | "article";
  /** If set, JSON-LD Event schema will be emitted. */
  event?: {
    /** ISO date for start of submission window. */
    startDate: string;
    /** ISO date for end of submission window (judging starts). */
    endDate: string;
    /** Where the event is hosted (city, country). */
    location: string;
  };
  /** If true, this page is a child of `parent` for BreadcrumbList. */
  parent?: SeoRouteId;
  /** Whether search engines should index this page. */
  indexable?: boolean;
}

export const ROUTES: SeoRoute[] = [
  { id: "home",      path: "/",         titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "tracks",    path: "/tracks",   titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "track-q1",  path: "/tracks/q1", titleKey: "title_q1",   descKey: "desc_q1",    indexable: true, parent: "tracks",
    event: { startDate: "2026-01-01", endDate: "2026-04-01", location: "San Francisco, USA" } },
  { id: "track-q2",  path: "/tracks/q2", titleKey: "title_q2",   descKey: "desc_q2",    indexable: true, parent: "tracks",
    event: { startDate: "2026-04-01", endDate: "2026-07-01", location: "Geneva, Switzerland" } },
  { id: "track-q3",  path: "/tracks/q3", titleKey: "title_q3",   descKey: "desc_q3",    indexable: true, parent: "tracks",
    event: { startDate: "2026-07-01", endDate: "2026-10-01", location: "Tokyo, Japan" } },
  { id: "track-q4",  path: "/tracks/q4", titleKey: "title_q4",   descKey: "desc_q4",    indexable: true, parent: "tracks",
    event: { startDate: "2026-10-01", endDate: "2027-01-15", location: "San Francisco, USA" } },
  { id: "leaderboard", path: "/leaderboard", titleKey: "title", descKey: "desc", indexable: true },
  { id: "agents",    path: "/agents",   titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "judges",    path: "/judges",   titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "prizes",    path: "/prizes",   titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "sponsors",  path: "/sponsors", titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "skill",     path: "/skill",    titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "register",  path: "/register", titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "docs",      path: "/docs",     titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "manifesto", path: "/manifesto", titleKey: "title",      descKey: "desc",       indexable: true },
  { id: "about",     path: "/about",    titleKey: "title",       descKey: "desc",       indexable: true },
  { id: "press",     path: "/press",    titleKey: "title",       descKey: "desc",       indexable: true },
];

/** Build the absolute URL for a (path, lang) pair. */
export function localizedUrl(path: string, lang: Lang): string {
  const cleaned = "/" + path.split("/").filter(Boolean).join("/");
  if (lang === "en") return `${SITE.baseUrl}${cleaned === "/" ? "" : cleaned}`;
  return `${SITE.baseUrl}/${lang}${cleaned === "/" ? "" : cleaned}`;
}

/** Resolve a route by pathname. The pathname may include a language prefix. */
export function resolveRoute(pathname: string): SeoRoute | null {
  // Strip the language prefix
  const parts = pathname.split("/").filter(Boolean);
  let core = parts;
  if (parts[0] && (SUPPORTED_LANGS as readonly string[]).includes(parts[0])) {
    core = parts.slice(1);
  }
  const candidate = "/" + core.join("/");
  // Try exact match first
  return (
    ROUTES.find((r) => r.path === candidate) ||
    ROUTES.find((r) => candidate.startsWith(r.path + "/") && r.path !== "/") ||
    null
  );
}

/** Build hreflang alternates for every (route, lang) combination. */
export function hreflangAlternates(path: string): { lang: Lang | "x-default"; url: string }[] {
  return [
    ...SUPPORTED_LANGS.map((lang) => ({ lang, url: localizedUrl(path, lang) })),
    { lang: "x-default" as const, url: localizedUrl(path, "en") },
  ];
}

/** Build the i18n title for a route. Resolved with t(). */
export function buildTitle(t: TFunction, route: SeoRoute, lang: Lang): string {
  const raw = t(`seo.${route.id}.${route.titleKey}`);
  // English gets a brand suffix; the suffix is the same in every locale so we keep
  // it out of the i18n files (it never translates).
  const suffix = lang === "en" ? ` · ${SITE.name}` : ` · ${SITE.name}`;
  return `${raw}${suffix}`;
}

/** Build the i18n description. */
export function buildDescription(t: TFunction, route: SeoRoute): string {
  return t(`seo.${route.id}.${route.descKey}`);
}
