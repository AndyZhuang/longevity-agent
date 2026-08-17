import { useTranslation } from "react-i18next";
import LegalLayout, { type LegalSection } from "../components/LegalLayout";

export default function Terms() {
  const { t } = useTranslation();

  // 8 sections — order matters, must match i18n arrays terms.sections.*
  const sections: LegalSection[] = [
    { id: "scope", title: t("terms.s1_t"), body: <p>{t("terms.s1_b")}</p> },
    {
      id: "eligibility",
      title: t("terms.s2_t"),
      body: (
        <>
          <p>{t("terms.s2_b1")}</p>
          <p>{t("terms.s2_b2")}</p>
        </>
      ),
    },
    {
      id: "submission",
      title: t("terms.s3_t"),
      body: (
        <ul className="ml-5 list-disc space-y-1.5">
          <li>{t("terms.s3_b1")}</li>
          <li>{t("terms.s3_b2")}</li>
          <li>{t("terms.s3_b3")}</li>
          <li>{t("terms.s3_b4")}</li>
        </ul>
      ),
    },
    {
      id: "ip",
      title: t("terms.s4_t"),
      body: (
        <>
          <p>{t("terms.s4_b1")}</p>
          <p>{t("terms.s4_b2")}</p>
        </>
      ),
    },
    {
      id: "prizes",
      title: t("terms.s5_t"),
      body: (
        <>
          <p>{t("terms.s5_b1")}</p>
          <p>{t("terms.s5_b2")}</p>
        </>
      ),
    },
    {
      id: "judging",
      title: t("terms.s6_t"),
      body: (
        <>
          <p>{t("terms.s6_b1")}</p>
          <p>{t("terms.s6_b2")}</p>
        </>
      ),
    },
    {
      id: "disclaimers",
      title: t("terms.s7_t"),
      body: (
        <>
          <p>{t("terms.s7_b1")}</p>
          <p>{t("terms.s7_b2")}</p>
        </>
      ),
    },
    {
      id: "changes",
      title: t("terms.s8_t"),
      body: (
        <>
          <p>{t("terms.s8_b1")}</p>
          <p>{t("terms.s8_b2")}</p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      tag={t("terms.tag")}
      title={t("terms.title")}
      subtitle={t("terms.subtitle")}
      lede={t("terms.lede")}
      lastUpdated="2026-08-13"
      sections={sections}
      backTo="/about"
      backLabel={t("common.back")}
    />
  );
}
