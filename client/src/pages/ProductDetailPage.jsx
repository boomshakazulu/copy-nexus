import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../utils/axios";
import { formatCOP } from "../utils/helpers";
import { useI18n } from "../i18n";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import SmartImage from "../components/SmartImage";

export default function ProductDetailPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, removeItem } = useCart();
  const [copier, setCopier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartMode, setCartMode] = useState("buy");
  const [supportModel, setSupportModel] = useState("");
  const [supportParts, setSupportParts] = useState([]);
  const [supportToners, setSupportToners] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");

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
        if (err?.status === 404) {
          setError(t("product.notFound"));
        } else {
          setError(t("product.loadFailed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCopier();
    }
  }, [id, t]);

  useEffect(() => {
    if (!copier) return;
    const modelValue =
      copier.model || copier.subtitle || copier.name || "";
    setSupportModel(modelValue);
  }, [copier]);

  useEffect(() => {
    if (!copier) return;
    const fetchSupportItems = async () => {
      try {
        setSupportLoading(true);
        setSupportError("");
        const matcher = copier?._id || copier?.id || copier?.model || "";
        const [partsRes, tonerRes] = await Promise.all([
          http.get("/products", {
            params: { category: "part", model: matcher, visibility: "active" },
          }),
          http.get("/products", {
            params: { category: "toner", model: matcher, visibility: "active" },
          }),
        ]);
        setSupportParts(partsRes?.data?.data ?? []);
        setSupportToners(tonerRes?.data?.data ?? []);
      } catch (_err) {
        setSupportError(t("product.supportLoadFailed"));
        setSupportParts([]);
        setSupportToners([]);
      } finally {
        setSupportLoading(false);
      }
    };

    fetchSupportItems();
  }, [copier, t]);

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

  const handleAddToCart = (mode) => {
    const itemId = copier?._id ?? copier?.id;
    if (!itemId) return;
    removeItem(itemId);
    addItem({
      _id: itemId,
      name: copier.name,
      subtitle: copier.subtitle,
      model: copier.model,
      purchasePrice: mode === "rent" ? copier.rentPrice : copier.purchasePrice,
      rentPrice: copier.rentPrice,
      rentCostPerScan: copier.rentCostPerScan,
      rentCostPerPrint: copier.rentCostPerPrint,
      inStock: copier.inStock,
      images: copier.images,
      rentable: copier.rentable,
      description: copier.description,
      cartMode: mode,
      quantity: 1,
    });
    setCartMode(mode);
    setCartModalOpen(true);
  };

  const rentCostPerScan = Number(copier?.rentCostPerScan) || 0;
  const rentCostPerPrint = Number(copier?.rentCostPerPrint) || 0;
  const showRentCosts =
    copier?.rentable && (rentCostPerScan > 0 || rentCostPerPrint > 0);

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
            <SmartImage
              src={images[activeImage]}
              alt={copier.name}
              fallbackSrc="/copier.png"
              priority
              className="h-80 w-full"
              imgClassName="h-80 w-full object-contain"
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
                  <SmartImage
                    src={img}
                    alt={`${copier.name} ${index + 1}`}
                    fallbackSrc="/copier.png"
                    className="h-full w-full"
                    imgClassName="h-full w-full object-contain"
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
              {t("product.price")}: {" "}
              <span className="font-extrabold">
                {formatCOP(copier.purchasePrice)}
              </span>
            </div>
            {copier.rentable && copier.rentPrice && (
              <div className="text-sm font-semibold text-[#555] mt-1">
                {t("product.rent")}: {" "}
                <span className="font-bold text-[#00294D]">
                  {formatCOP(copier.rentPrice)} {t("product.perMonth")}
                </span>
              </div>
            )}
            {showRentCosts && (
              <div className="mt-2 space-y-1 text-sm text-[#555]">
                {rentCostPerPrint > 0 && (
                  <div>
                    {t("product.pricePerCopy")}: {" "}
                    <span className="font-bold text-[#00294D]">
                      {formatCOP(rentCostPerPrint)}
                    </span>
                  </div>
                )}
                {rentCostPerScan > 0 && (
                  <div>
                    {t("product.pricePerScan")}: {" "}
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

          {copier.description && (
            <div
              className="ql-editor ql-display text-gray-600"
              dangerouslySetInnerHTML={{ __html: copier.description }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleAddToCart("buy")}
              className="w-full bg-[#00294D] hover:bg-[#003B66] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              {t("product.buyNow")}
            </button>
            {copier.rentable && (
              <button
                type="button"
                onClick={() => handleAddToCart("rent")}
                className="w-full bg-[#FFCB05] hover:bg-[#F2B700] text-[#00294D] px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
              >
                {t("product.rent")}
              </button>
            )}
          </div>
        </div>
      </div>

      {cartModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartModalOpen(false)}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#00294D] mb-2">
                {t("cart.modalTitle")}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {cartMode === "rent"
                  ? t("cart.modalBodyRent")
                  : t("cart.modalBodyBuy")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCartModalOpen(false);
                    navigate("/cart");
                  }}
                  className="w-full rounded-lg bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66]"
                >
                  {t("cart.modalCheckout")}
                </button>
                <button
                  type="button"
                  onClick={() => setCartModalOpen(false)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-[#00294D] hover:bg-gray-50"
                >
                  {t("cart.modalContinue")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support */}
      <div className="mt-10 bg-white rounded-2xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-[#00294D]">
            {t("product.supportTitle")}
          </h2>
          <p className="text-sm text-gray-600">
            {t("product.supportSubtitle")}
          </p>
        </div>

        {supportError && (
          <p className="text-sm text-red-600 font-semibold mb-4">
            {supportError}
          </p>
        )}

        <div className="space-y-10">
          <section>
            <h3 className="text-xl font-bold text-[#00294D] mb-3">
              {t("product.supportPartsTitle")}
            </h3>
            {supportLoading ? (
              <p className="text-sm text-gray-500">
                {t("product.supportLoading")}
              </p>
            ) : supportToners.length === 0 && supportParts.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("product.supportEmpty")}
              </p>
            ) : (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-semibold text-[#00294D] mb-3">
                    {t("product.supportToner")}
                  </p>
                  {supportToners.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {t("product.supportNoToner")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {supportToners.map((toner) => (
                        <div key={toner._id} className="h-full">
                          <ProductCard
                            {...toner}
                            showPrice={false}
                            showStock={false}
                            images={
                              toner.images && toner.images.length > 0
                                ? toner.images
                                : ["/toner.png"]
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#00294D] mb-3">
                    {t("product.supportParts")}
                  </p>
                  {supportParts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {t("product.supportNoParts")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {supportParts.map((part) => (
                        <div key={part._id} className="h-full">
                          <ProductCard
                            {...part}
                            showPrice={true}
                            showStock={false}
                            showDescription={true}
                            showAddToCart={true}
                            images={
                              part.images && part.images.length > 0
                                ? part.images
                                : ["/part.png"]
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-xl font-bold text-[#00294D] mb-2">
                {t("product.supportPartsFormTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("product.supportPartsFormSubtitle")}
              </p>
              <form
                className="grid grid-cols-1 gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/request-confirmation?type=parts");
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("partsPage.form.name")}
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.contactMethodLabel")}
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    defaultValue="email"
                  >
                    <option value="email">{t("common.contactMethods.email")}</option>
                    <option value="whatsappText">
                      {t("common.contactMethods.whatsappText")}
                    </option>
                    <option value="whatsappCall">
                      {t("common.contactMethods.whatsappCall")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("partsPage.form.contactValue")}
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder={t("partsPage.form.contactPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("partsPage.form.model")}
                  </label>
                  <input
                    type="text"
                    value={supportModel}
                    onChange={(e) => setSupportModel(e.target.value)}
                    placeholder={t("partsPage.form.modelPlaceholder")}
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("partsPage.form.message")}
                  </label>
                  <textarea
                    rows="3"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-600 transition"
                >
                  {t("partsPage.form.send")}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-xl font-bold text-[#00294D] mb-2">
                {t("product.supportMaintenanceTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("product.supportMaintenanceSubtitle")}
              </p>
              <form
                className="grid grid-cols-1 gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/request-confirmation?type=maintenance");
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("maintenancePage.form.name")}
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.contactMethodLabel")}
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    defaultValue="email"
                  >
                    <option value="email">{t("common.contactMethods.email")}</option>
                    <option value="whatsappText">
                      {t("common.contactMethods.whatsappText")}
                    </option>
                    <option value="whatsappCall">
                      {t("common.contactMethods.whatsappCall")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("maintenancePage.form.contactValue")}
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder={t("maintenancePage.form.contactPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("maintenancePage.form.model")}
                  </label>
                  <input
                    type="text"
                    value={supportModel}
                    onChange={(e) => setSupportModel(e.target.value)}
                    placeholder={t("maintenancePage.form.modelPlaceholder")}
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("maintenancePage.form.issue")}
                  </label>
                  <textarea
                    rows="2"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder={t("maintenancePage.form.issuePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("maintenancePage.form.needs")}
                  </label>
                  <textarea
                    rows="2"
                    className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder={t("maintenancePage.form.needsPlaceholder")}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#00294D] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#003B66] transition"
                >
                  {t("maintenancePage.form.send")}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
