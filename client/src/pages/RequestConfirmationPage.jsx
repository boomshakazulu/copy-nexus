import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useI18n } from "../i18n";

export default function RequestConfirmationPage() {
  const { t } = useI18n();
  const location = useLocation();
  const search = useMemo(() => new URLSearchParams(location.search), [location]);
  const type = search.get("type") || "request";

  const title =
    type === "maintenance"
      ? t("requestConfirmation.maintenanceTitle")
      : type === "parts"
        ? t("requestConfirmation.partsTitle")
        : t("requestConfirmation.title");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-3xl font-extrabold text-[#00294D]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {t("requestConfirmation.subtitle")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66]"
        >
          {t("requestConfirmation.cta")}
        </Link>
      </div>
    </div>
  );
}
