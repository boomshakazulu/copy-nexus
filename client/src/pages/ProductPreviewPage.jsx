import { Link } from "react-router-dom";
import { useMemo } from "react";
import { formatCOP } from "../utils/helpers";
import { useI18n } from "../i18n";

const PREVIEW_KEY = "productPreview";

export default function ProductPreviewPage() {
  const { t } = useI18n();
  const preview = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  if (!preview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-500">
          {t("admin.forms.previewMissing")}
        </p>
        <Link
          to="/admin/products"
          className="inline-flex items-center mt-4 rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white"
        >
          {t("admin.forms.backToAdmin")}
        </Link>
      </div>
    );
  }

  const images =
    preview.images && preview.images.length > 0
      ? preview.images
      : ["/copier.png"];
  const rentCostPerPrint = Number(preview.rentCostPerPrint) || 0;
  const rentCostPerScan = Number(preview.rentCostPerScan) || 0;
  const showRentCosts =
    preview.rentable && (rentCostPerPrint > 0 || rentCostPerScan > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin/products"
          className="text-sm font-semibold text-[#00294D] hover:underline"
        >
          &larr; {t("admin.forms.backToAdmin")}
        </Link>
        <span className="rounded-full bg-[#E6EEF5] px-3 py-1 text-xs font-semibold text-[#00294D]">
          {t("admin.forms.previewLabel")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl bg-[#F8FAFC] p-6 flex items-center justify-center">
            <img
              src={images[0]}
              alt={preview.name}
              className="h-80 w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className={`h-16 w-20 rounded-lg border bg-white p-2 shadow-sm ${
                    index === 0 ? "border-[#00294D]" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${preview.name} ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00294D]">
              {preview.name || t("admin.forms.previewUntitled")}
            </h1>
            {preview.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{preview.subtitle}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-lg font-bold text-[#00294D]">
              {t("product.price")}:{" "}
              <span className="font-extrabold">
                {formatCOP(preview.purchasePrice)}
              </span>
            </div>
            {preview.rentable && preview.rentPrice && (
              <div className="text-sm font-semibold text-[#555] mt-1">
                {t("product.rent")}:{" "}
                <span className="font-bold text-[#00294D]">
                  {formatCOP(preview.rentPrice)} {t("product.perMonth")}
                </span>
              </div>
            )}
            {showRentCosts && (
              <div className="mt-2 space-y-1 text-sm text-[#555]">
                {rentCostPerPrint > 0 && (
                  <div>
                    {t("product.pricePerCopy")}:{" "}
                    <span className="font-bold text-[#00294D]">
                      {formatCOP(rentCostPerPrint)}
                    </span>
                  </div>
                )}
                {rentCostPerScan > 0 && (
                  <div>
                    {t("product.pricePerScan")}:{" "}
                    <span className="font-bold text-[#00294D]">
                      {formatCOP(rentCostPerScan)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {t("product.rentalOnlyNote")}
                </p>
              </div>
            )}
          </div>

          {preview.description && (
            <div
              className="ql-editor ql-display text-gray-600"
              dangerouslySetInnerHTML={{ __html: preview.description }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled
              className="w-full bg-[#00294D] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm opacity-70"
            >
              {t("product.buyNow")}
            </button>
            {preview.rentable && (
              <button
                type="button"
                disabled
                className="w-full bg-[#FFCB05] text-[#00294D] px-5 py-2 rounded-lg text-sm font-semibold shadow-sm opacity-70"
              >
                {t("product.rent")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
