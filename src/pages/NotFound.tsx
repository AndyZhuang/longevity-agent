import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function NotFound() {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid min-h-[70vh] place-items-center px-6"
    >
      <div className="text-center">
        <p className="tag">{t("notFound.tag")}</p>
        <h1 className="mt-3 font-display text-6xl font-semibold text-ink-high md:text-7xl">
          <span className="shimmer">{t("notFound.title")}</span>
        </h1>
        <p className="mt-3 max-w-md text-ink-mid">
          {t("notFound.body")}
        </p>
        <Link
          to={`${prefix}/`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 font-display text-sm font-semibold text-bg-0 transition hover:opacity-95"
        >
          <ArrowLeft size={14} /> {t("notFound.back")}
        </Link>
      </div>
    </motion.div>
  );
}
