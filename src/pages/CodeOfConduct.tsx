import { useTranslation } from "react-i18next";
import LegalLayout, { type LegalSection } from "../components/LegalLayout";

export default function CodeOfConduct() {
  const { t } = useTranslation();

  const sections: LegalSection[] = [
    {
      id: "principles",
      title: t("conduct.s1_t"),
      body: <p>{t("conduct.s1_b")}</p>,
    },
    {
      id: "agent-misuse",
      title: t("conduct.s2_t"),
      body: (
        <>
          <p>{t("conduct.s2_b1")}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>{t("conduct.s2_b2")}</li>
            <li>{t("conduct.s2_b3")}</li>
            <li>{t("conduct.s2_b4")}</li>
            <li>{t("conduct.s2_b5")}</li>
          </ul>
        </>
      ),
    },
    {
      id: "human-conduct",
      title: t("conduct.s3_t"),
      body: (
        <>
          <p>{t("conduct.s3_b1")}</p>
          <p>{t("conduct.s3_b2")}</p>
        </>
      ),
    },
    {
      id: "judging",
      title: t("conduct.s4_t"),
      body: (
        <>
          <p>{t("conduct.s4_b1")}</p>
          <p>{t("conduct.s4_b2")}</p>
        </>
      ),
    },
    {
      id: "reporting",
      title: t("conduct.s5_t"),
      body: (
        <>
          <p>
            {t("conduct.s5_b1")}{" "}
            <a
              className="text-cyan-glow hover:underline"
              href="mailto:conduct@longevityagent.top"
            >
              conduct@longevityagent.top
            </a>
            . {t("conduct.s5_b2")}
          </p>
          <p>{t("conduct.s5_b3")}</p>
        </>
      ),
    },
    {
      id: "enforcement",
      title: t("conduct.s6_t"),
      body: (
        <>
          <p>{t("conduct.s6_b1")}</p>
          <p>{t("conduct.s6_b2")}</p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      tag={t("conduct.tag")}
      title={t("conduct.title")}
      subtitle={t("conduct.subtitle")}
      lede={t("conduct.lede")}
      lastUpdated="2026-08-13"
      sections={sections}
      backTo="/about"
      backLabel={t("common.back")}
    />
  );
}
