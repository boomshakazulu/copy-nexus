import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useI18n } from "../i18n";

export default function OrderConfirmationPage() {
  const { t } = useI18n();
  const details = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("orderConfirmation") || "{}");
    } catch {
      return {};
    }
  }, []);

  const email = details?.email || "";
  const preferredMethod = details?.preferredContactMethod || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-3xl font-extrabold text-[#00294D] mb-3">
          {t("orderConfirmation.title")}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {t("orderConfirmation.subtitle")}
        </p>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            {t("orderConfirmation.contactIntro")}
            {preferredMethod
              ? ` ${t(`common.contactMethods.${preferredMethod}`)}.`
              : ` ${t("orderConfirmation.contactMethods.default")}.`}
          </p>
          <p>
            {t("orderConfirmation.emailIntro")}{" "}
            <span className="font-semibold">{email || t("orderConfirmation.emailFallback")}</span>{" "}
            {t("orderConfirmation.emailFrom")}
          </p>
          <p>{t("orderConfirmation.spamHint")}</p>
          <p>{t("orderConfirmation.safelistHint")}</p>
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-[#00294D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003B66]"
          >
            {t("orderConfirmation.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
