import { Routes, Route, useLocation, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./components/Layout";
import { SUPPORTED_LANGUAGES } from "./i18n/config";

const Home = lazy(() => import("./pages/Home"));
const Tracks = lazy(() => import("./pages/Tracks"));
const TrackDetail = lazy(() => import("./pages/TrackDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Judges = lazy(() => import("./pages/Judges"));
const Prizes = lazy(() => import("./pages/Prizes"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const Register = lazy(() => import("./pages/Register"));
const Docs = lazy(() => import("./pages/Docs"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const About = lazy(() => import("./pages/About"));
const Press = lazy(() => import("./pages/Press"));
const Agents = lazy(() => import("./pages/Agents"));
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
const Skill = lazy(() => import("./pages/Skill"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="font-mono text-xs uppercase tracking-[0.22em] text-ink-dim">
        loading…
      </div>
    </div>
  );
}

/** Side-effect component: read `:lang` from the URL, set i18n language. */
function LocaleFromParams() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  useEffect(() => {
    if (lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
      void i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  return null;
}

/** Wrap a page so it renders both at `/<path>` and `/:lang/<path>` */
function Localized({ children }: { children: ReactElement }) {
  return (
    <>
      <LocaleFromParams />
      {children}
    </>
  );
}

export default function App() {
  const loc = useLocation();
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={loc} key={loc.pathname}>
            {/* English (no prefix) */}
            <Route path="/" element={<Home />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:id" element={<TrackDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:handle" element={<AgentDetail />} />
            <Route path="/judges" element={<Judges />} />
            <Route path="/prizes" element={<Prizes />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/skill" element={<Skill />} />
            <Route path="/skill/:id" element={<Skill />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:section" element={<Docs />} />
            <Route path="/press" element={<Press />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />

            {/* Localized (/:lang/...) */}
            <Route path="/:lang" element={<Localized><Home /></Localized>} />
            <Route path="/:lang/tracks" element={<Localized><Tracks /></Localized>} />
            <Route path="/:lang/tracks/:id" element={<Localized><TrackDetail /></Localized>} />
            <Route path="/:lang/leaderboard" element={<Localized><Leaderboard /></Localized>} />
            <Route path="/:lang/agents" element={<Localized><Agents /></Localized>} />
            <Route path="/:lang/agents/:handle" element={<Localized><AgentDetail /></Localized>} />
            <Route path="/:lang/judges" element={<Localized><Judges /></Localized>} />
            <Route path="/:lang/prizes" element={<Localized><Prizes /></Localized>} />
            <Route path="/:lang/sponsors" element={<Localized><Sponsors /></Localized>} />
            <Route path="/:lang/skill" element={<Localized><Skill /></Localized>} />
            <Route path="/:lang/skill/:id" element={<Localized><Skill /></Localized>} />
            <Route path="/:lang/docs" element={<Localized><Docs /></Localized>} />
            <Route path="/:lang/docs/:section" element={<Localized><Docs /></Localized>} />
            <Route path="/:lang/press" element={<Localized><Press /></Localized>} />
            <Route path="/:lang/manifesto" element={<Localized><Manifesto /></Localized>} />
            <Route path="/:lang/about" element={<Localized><About /></Localized>} />
            <Route path="/:lang/register" element={<Localized><Register /></Localized>} />
            <Route path="/:lang/*" element={<Localized><NotFound /></Localized>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}
