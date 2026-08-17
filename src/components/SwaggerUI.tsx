/**
 * Interactive Swagger UI for the LAGP OpenAPI spec.
 *
 * Loads swagger-ui-dist's prebuilt UMD bundle via a <script> tag (loaded
 * once and cached by the browser) instead of via Vite ESM imports. The UMD
 * path is the one swagger-ui's own docs use and sidesteps a class of init
 * issues (e.g. "Cannot read properties of undefined (reading 'download')")
 * that come up when the ESM bundle is initialised without a full DOM/window
 * shim.
 *
 * The bundle is ~600 KB minified and is only fetched on the first time the
 * user opens the "Interactive" tab. Subsequent visits hit the browser cache.
 */
import { useEffect, useRef, useState } from "react";

const SWAGGER_CSS_HREF = "/swagger-ui-dist/swagger-ui.css";
const SWAGGER_BUNDLE_SRC = "/swagger-ui-dist/swagger-ui-bundle.js";
const SPEC_URL = "/api/openapi.json";

type SwaggerUIBundle = (cfg: Record<string, unknown>) => unknown;

declare global {
  interface Window {
    SwaggerUIBundle?: SwaggerUIBundle;
    ui?: unknown;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.src = src;
    s.addEventListener("load", () => {
      s.dataset.loaded = "1";
      resolve();
    });
    s.addEventListener("error", () => reject(new Error("Failed to load " + src)));
    document.head.appendChild(s);
  });
}

function loadCss(href: string): void {
  if (document.querySelector(`link[data-href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  l.dataset.href = href;
  document.head.appendChild(l);
}

export default function SwaggerUI() {
  const elRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        loadCss(SWAGGER_CSS_HREF);
        await loadScript(SWAGGER_BUNDLE_SRC);

        if (cancelled || !elRef.current) return;
        if (typeof window.SwaggerUIBundle !== "function") {
          throw new Error("SwaggerUIBundle not on window after script load");
        }

        const mountId = elRef.current.id;
        const result = window.SwaggerUIBundle({
          url: SPEC_URL,
          dom_id: `#${mountId}`,
          layout: "BaseLayout",
          defaultModelsExpandDepth: -1,
          defaultModelExpandDepth: 3,
          docExpansion: "list",
          filter: true,
          tryItOutEnabled: false,
          supportedSubmitMethods: [],
        });
        window.ui = result;
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative">
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-ink-mid">
          Loading interactive API explorer…
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Failed to load Swagger UI: {error}
        </div>
      ) : null}
      <div
        id="swagger-ui-container"
        ref={elRef}
        className="swagger-ui-host"
        style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.85)" }}
      />
    </div>
  );
}
