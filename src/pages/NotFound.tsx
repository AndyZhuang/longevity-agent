import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid min-h-[70vh] place-items-center px-6"
    >
      <div className="text-center">
        <p className="tag">404 · route not found</p>
        <h1 className="mt-3 font-display text-6xl font-semibold text-ink-high md:text-7xl">
          <span className="shimmer">lost in the loop</span>
        </h1>
        <p className="mt-3 max-w-md text-ink-mid">
          The path you tried to reach doesn't exist. The agents haven't generated it yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </motion.div>
  );
}
