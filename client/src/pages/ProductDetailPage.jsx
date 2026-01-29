import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../utils/axios";
import { formatCOP } from "../utils/helpers";
import { useI18n } from "../i18n";

export default function ProductDetailPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const [copier, setCopier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => {
    if (!copier?.images || copier.images.length === 0) return ["/copier.png"];
    return copier.images;
  }, [copier]);

  useEffect(() => {
    setActiveImage(0);
  }, [images]);

  useEffect(() => {
    const fetchCopier = async () => {
      try {
        setIsLoading(true);
        const res = await http.get("/products", {
          params: {
            ids: id,
          },
        });

        const found = res?.data?.data?.[0] ?? null;
        if (found) {
          setCopier(found);
          setError("");
        } else {
          setCopier(null);
          setError(t("product.notFound"));
        }
      } catch (err) {
        setError(err.message || t("product.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCopier();
    }
  }, [id, t]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-500">{t("product.loading")}</p>
      </div>
    );
  }

  if (!copier) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-sm text-red-600 font-semibold mb-4">
          {error || t("product.notFound")}
        </p>
        <Link
          to="/copiers"
          className="inline-flex items-center rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white"
        >
          {t("product.backToListings")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/copiers"
          className="text-sm font-semibold text-[#00294D] hover:underline"
        >
          &larr; {t("product.backToListings")}
        </Link>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            copier.inStock ? "bg-[#1B5E20] text-white" : "bg-[#E53935] text-white"
          }`}
        >
          {copier.inStock ? t("product.inStock") : t("product.outOfStock")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-md p-6">
        {/* Carousel */}
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl bg-[#F8FAFC] p-6 flex items-center justify-center">
            <img
              src={images[activeImage]}
              alt={copier.name}
              className="h-80 w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[#00294D] shadow"
                >
                  {t("product.prev")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[#00294D] shadow"
                >
                  {t("product.next")}
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-20 rounded-lg border bg-white p-2 shadow-sm ${
                    index === activeImage
                      ? "border-[#00294D]"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${copier.name} ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00294D]">
              {copier.name}
            </h1>
            {copier.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{copier.subtitle}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-lg font-bold text-[#00294D]">
              {t("product.price")}:{" "}
              <span className="font-extrabold">
                {formatCOP(copier.purchasePrice)}
              </span>
            </div>
            {copier.rentable && copier.rentPrice && (
              <div className="text-sm font-semibold text-[#555] mt-1">
                {t("product.rent")}:{" "}
                <span className="font-bold text-[#00294D]">
                  {formatCOP(copier.rentPrice)}
                </span>
              </div>
            )}
          </div>

          {copier.description && (
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: copier.description }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button className="w-full bg-[#00294D] hover:bg-[#003B66] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm">
              {t("product.buyNow")}
            </button>
            {copier.rentable && (
              <button className="w-full bg-[#FFCB05] hover:bg-[#F2B700] text-[#00294D] px-5 py-2 rounded-lg text-sm font-semibold shadow-sm">
                {t("product.rent")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
