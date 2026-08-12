import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  buildDescription,
  buildTitle,
  hreflangAlternates,
  localizedUrl,
  resolveRoute,
  SITE,
  SUPPORTED_LANGS,
  type Lang,
} from "../lib/seo";

/**
 * Apply SEO meta tags for the current route. Updates <title>, description,
 * canonical, hreflang alternates, OG / Twitter cards, and JSON-LD structured
 * data. Idempotent — multiple SeoHead instances on the same page share tags.
 */
export function useSeo() {
  const { t, i18n } = useTranslation();
  const loc = useLocation();
  const params = useParams();
  const langParam = params.lang;

  useEffect(() => {
    const lang = ((langParam as Lang) ||
      (i18n.resolvedLanguage || i18n.language || "en").split("-")[0]) as Lang;
    const route = resolveRoute(loc.pathname);

    // Update <html lang> so screen readers + browsers see the right language
    document.documentElement.lang = lang;

    // Fall back to "home" if we land on a 404 / unknown path
    const r = route ?? resolveRoute("/")!;
    const path = r.path;
    const title = buildTitle(t, r, lang);
    const desc = buildDescription(t, r);
    const canonical = localizedUrl(path, lang);

    // ----- title + description
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", r.ogType ?? "website");
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:image", `${SITE.baseUrl}${SITE.ogImage}`);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", title);
    setMeta("property", "og:locale", SITE.localeMap[lang]);
    for (const alt of SUPPORTED_LANGS) {
      if (alt === lang) continue;
      setMeta("property", `og:locale:alternate`, SITE.localeMap[alt], true);
    }
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", SITE.twitter);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", `${SITE.baseUrl}${SITE.ogImage}`);
    setMeta("name", "twitter:image:alt", title);

    // ----- robots
    setMeta(
      "name",
      "robots",
      r.indexable === false ? "noindex, nofollow" : "index, follow, max-image-preview:large"
    );

    // ----- canonical + hreflang
    setLink("canonical", canonical);
    for (const alt of hreflangAlternates(path)) {
      setLink("alternate", alt.url, "hreflang", alt.lang);
    }

    // ----- JSON-LD: Organization, WebSite, and (if route has event) Event
    const ldGraph: object[] = [
      {
        "@type": "Organization",
        "@id": `${SITE.baseUrl}#org`,
        name: SITE.name,
        url: SITE.baseUrl,
        logo: `${SITE.baseUrl}/favicon.svg`,
        sameAs: [
          `https://github.com/AndyZhuang/${SITE.domain.split(".")[0]}`,
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: `hello@${SITE.domain}`,
            contactType: "general",
            availableLanguage: ["English", "Chinese", "French", "Spanish", "Portuguese"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.baseUrl}#site`,
        url: SITE.baseUrl,
        name: SITE.name,
        inLanguage: SUPPORTED_LANGS,
        publisher: { "@id": `${SITE.baseUrl}#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.baseUrl}/leaderboard?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ];
    if (r.event) {
      ldGraph.push({
        "@type": "Event",
        name: `${SITE.shortName} — ${r.id.toUpperCase()}`,
        description: desc,
        startDate: r.event.startDate,
        endDate: r.event.endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: r.event.location,
        },
        organizer: { "@id": `${SITE.baseUrl}#org` },
        url: canonical,
        inLanguage: lang,
      });
    }
    if (r.parent) {
      const parent = resolveRoute("/" + (r.parent === "home" ? "" : r.parent));
      if (parent) {
        ldGraph.push({
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.baseUrl },
            { "@type": "ListItem", position: 2, name: t(`nav.${parent.id}`), item: localizedUrl(parent.path, lang) },
            { "@type": "ListItem", position: 3, name: title.replace(` · ${SITE.name}`, ""), item: canonical },
          ],
        });
      }
    }
    setJsonLd({
      "@context": "https://schema.org",
      "@graph": ldGraph,
    });

    // ----- title last so screen readers read it after the body is updated
    document.title = title;
  }, [loc.pathname, t, i18n, langParam]);
}

/** Render the SEO tags. Returns nothing — it's a side-effect component. */
export default function SeoHead() {
  useSeo();
  return null;
}

// ---------- helpers ----------

function setMeta(
  attr: "name" | "property",
  key: string,
  value: string,
  append = false
) {
  if (!value) return;
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (append) {
    // For og:locale:alternate (multi-value), store as space-separated.
    const cur = el.getAttribute("content") || "";
    if (!cur.split(" ").includes(value)) {
      el.setAttribute("content", cur ? `${cur} ${value}` : value);
    }
  } else {
    el.setAttribute("content", value);
  }
}

function setLink(
  rel: string,
  href: string,
  attr?: string,
  attrValue?: string
) {
  let el: HTMLLinkElement | null;
  if (attr) {
    el = document.head.querySelector<HTMLLinkElement>(
      `link[rel="${rel}"][${attr}="${attrValue}"]`
    );
  } else {
    el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`);
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (attr) el.setAttribute(attr, attrValue!);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(payload: object) {
  const id = "ld-json-graph";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}
