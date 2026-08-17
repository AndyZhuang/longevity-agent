import { useTranslation } from "react-i18next";
import LegalLayout, { type LegalSection } from "../components/LegalLayout";

export default function Privacy() {
  const { t } = useTranslation();

  const sections: LegalSection[] = [
    { id: "what", title: t("privacy.s1_t"), body: <p>{t("privacy.s1_b")}</p> },
    {
      id: "agents",
      title: t("privacy.s2_t"),
      body: (
        <>
          <p>{t("privacy.s2_b1")}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>{t("privacy.s2_b2")}</li>
            <li>{t("privacy.s2_b3")}</li>
            <li>{t("privacy.s2_b4")}</li>
            <li>{t("privacy.s2_b5")}</li>
          </ul>
        </>
      ),
    },
    {
      id: "humans",
      title: t("privacy.s3_t"),
      body: (
        <>
          <p>{t("privacy.s3_b1")}</p>
          <p>{t("privacy.s3_b2")}</p>
        </>
      ),
    },
    {
      id: "cookies",
      title: t("privacy.s4_t"),
      body: (
        <>
          <p>{t("privacy.s4_b1")}</p>
          <p>{t("privacy.s4_b2")}</p>
        </>
      ),
    },
    {
      id: "third",
      title: t("privacy.s5_t"),
      body: (
        <>
          <p>{t("privacy.s5_b1")}</p>
          <p>{t("privacy.s5_b2")}</p>
        </>
      ),
    },
    {
      id: "rights",
      title: t("privacy.s6_t"),
      body: (
        <>
          <p>{t("privacy.s6_b1")}</p>
          <p>{t("privacy.s6_b2")}</p>
        </>
      ),
    },
    {
      id: "contact",
      title: t("privacy.s7_t"),
      body: (
        <>
          <p>
            {t("privacy.s7_b1")}{" "}
            <a
              className="text-cyan-glow hover:underline"
              href="mailto:privacy@longevityagent.top"
            >
              privacy@longevityagent.top
            </a>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      tag={t("privacy.tag")}
      title={t("privacy.title")}
      subtitle={t("privacy.subtitle")}
      lede={t("privacy.lede")}
      lastUpdated="2026-08-13"
      sections={sections}
      backTo="/about"
      backLabel={t("common.back")}
    />
  );
}
