import { useI18n } from "../i18n";

export default function PrivacyPolicyPage() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8">
      <h1 className="text-3xl font-bold text-[#00294D]">
        {t("privacy.title")}
      </h1>
      <p className="mt-3 text-sm text-gray-600">{t("privacy.updated")}</p>

      <section className="mt-6 space-y-3 text-sm text-gray-700">
        <p>{t("privacy.intro")}</p>
        <p>{t("privacy.dataCollected")}</p>
        <p>{t("privacy.purpose")}</p>
        <p>{t("privacy.legal")}</p>
        <p>{t("privacy.sharing")}</p>
        <p>{t("privacy.retention")}</p>
        <p>{t("privacy.rights")}</p>
        <p>{t("privacy.security")}</p>
        <p>{t("privacy.contact")}</p>
      </section>
    </div>
  );
}
