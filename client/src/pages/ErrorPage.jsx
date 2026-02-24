import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useI18n } from "../i18n";

export default function ErrorPage() {
  const { t } = useI18n();
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const subtitle = isRouteErrorResponse(error)
    ? error.statusText
    : t("errors.genericSubtitle");

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              {t("errors.brand")}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-[#00294D]">
              {status === 404 ? t("errors.notFoundTitle") : t("errors.title")}
            </h1>
            <p className="mt-3 text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] px-6 py-5 text-center">
            <p className="text-5xl font-black text-[#00294D]">{status}</p>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              {t("errors.codeLabel")}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#00294D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003B66]"
          >
            {t("errors.ctaHome")}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#00294D] hover:bg-gray-50"
          >
            {t("errors.ctaContact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
