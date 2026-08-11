import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

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
const Agents = lazy(() => import("./pages/Agents"));
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
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

export default function App() {
  const loc = useLocation();
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={loc} key={loc.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:id" element={<TrackDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/judges" element={<Judges />} />
            <Route path="/prizes" element={<Prizes />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/register" element={<Register />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:section" element={<Docs />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/about" element={<About />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:handle" element={<AgentDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}
