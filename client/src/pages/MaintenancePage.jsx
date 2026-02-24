import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { http } from "../utils/axios";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";

export default function MaintenancePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [copiers, setCopiers] = useState([]);
  const [selectedCopierId, setSelectedCopierId] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formModel, setFormModel] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b };
  }, []);

  const OTHER_COPIER_ID = "other";

  useEffect(() => {
    const fetchCopiers = async () => {
      try {
        setIsLoading(true);
        const res = await http.get("/products", {
          params: { category: "copier", visibility: "active" },
        });
        setCopiers(res?.data?.data ?? []);
        setError("");
      } catch (_err) {
        setError(t("maintenancePage.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCopiers();
  }, [t]);

  const selectedCopier = useMemo(
    () => copiers.find((copier) => copier._id === selectedCopierId) || null,
    [copiers, selectedCopierId]
  );

  useEffect(() => {
    if (!selectedCopierId) {
      setFormModel("");
      return;
    }
    if (selectedCopierId === OTHER_COPIER_ID) {
      setFormModel("");
      return;
    }
    const modelValue =
      selectedCopier?.model || selectedCopier?.name || "";
    setFormModel(modelValue);
  }, [selectedCopierId, selectedCopier]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl pb-2 font-extrabold text-[#00294D]">
            {t("maintenancePage.title")}
          </h1>
          <p className="text-sm text-gray-500">{t("maintenancePage.subtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 w-full">
          <div className="relative w-full sm:w-96">
            <label className="block text-sm font-semibold text-[#00294D] mb-2">
              {t("maintenancePage.selectLabel")}
            </label>
            <button
              type="button"
              onClick={() => setSelectorOpen(true)}
              className="w-full bg-[#FFCB05] text-[#00294D] font-semibold px-4 py-2 rounded-md focus:outline-none text-left"
            >
              {selectedCopier
                ? `${selectedCopier.name}${
                    selectedCopier.model ? ` (${selectedCopier.model})` : ""
                  }`
                : selectedCopierId === OTHER_COPIER_ID
                  ? t("maintenancePage.otherOption")
                : t("maintenancePage.selectPlaceholder")}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">{t("maintenancePage.loading")}</p>
      ) : error ? (
        <p className="text-sm text-red-600 font-semibold">{error}</p>
      ) : !selectedCopierId ? (
        <p className="text-sm text-gray-500">{t("maintenancePage.selectPrompt")}</p>
      ) : (
        <>
          {selectedCopier && selectedCopierId !== OTHER_COPIER_ID && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#00294D] mb-3">
                {t("maintenancePage.selectedLabel")}
              </p>
              <div className="max-w-xs">
                <ProductCard
                  {...selectedCopier}
                  showPrice={false}
                  showStock={false}
                  images={
                    selectedCopier.images && selectedCopier.images.length > 0
                      ? selectedCopier.images
                      : ["/copier.png"]
                  }
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-[#00294D] mb-2">
              {t("maintenancePage.formTitle")}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {t("maintenancePage.formSubtitle")}
            </p>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (Number(captchaAnswer) !== captcha.a + captcha.b) {
                  setCaptchaError(t("maintenancePage.form.captchaError"));
                  return;
                }
                setCaptchaError("");
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
                  <option value="email">
                    {t("common.contactMethods.email")}
                  </option>
                  <option value="whatsappText">
                    {t("common.contactMethods.whatsappText")}
                  </option>
                  <option value="whatsappCall">
                    {t("common.contactMethods.whatsappCall")}
                  </option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("maintenancePage.form.contactValue")}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder={t("maintenancePage.form.contactPlaceholder")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("maintenancePage.form.model")}
                </label>
                <input
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder={t("maintenancePage.form.modelPlaceholder")}
                  className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("maintenancePage.form.issue")}
                </label>
                <textarea
                  rows="4"
                  className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder={t("maintenancePage.form.issuePlaceholder")}
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("maintenancePage.form.needs")}
                </label>
                <textarea
                  rows="3"
                  className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder={t("maintenancePage.form.needsPlaceholder")}
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("maintenancePage.form.captchaLabel", { a: captcha.a, b: captcha.b })}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {captchaError && (
                  <p className="mt-1 text-xs text-red-600">{captchaError}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-600 transition"
                >
                  {t("maintenancePage.form.send")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {selectorOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectorOpen(false)}
          />
          <div
            className="absolute inset-0 grid place-items-center p-4"
            onClick={() => setSelectorOpen(false)}
          >
            <div
              className="w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-bold text-[#00294D]">
                  {t("maintenancePage.selectTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectorOpen(false)}
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label={t("maintenancePage.close")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 overflow-y-auto flex-1">
                {copiers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {t("maintenancePage.noCopiers")}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {copiers.map((copier) => (
                      <button
                        key={copier._id}
                        type="button"
                        onClick={() => {
                          setSelectedCopierId(copier._id);
                          setSelectorOpen(false);
                        }}
                        className="text-left"
                      >
                        <ProductCard
                          {...copier}
                          showPrice={false}
                          showStock={false}
                          images={
                            copier.images && copier.images.length > 0
                              ? copier.images
                              : ["/copier.png"]
                          }
                        />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCopierId(OTHER_COPIER_ID);
                        setSelectorOpen(false);
                      }}
                      className="text-left"
                    >
                      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-[#FFCB05]/20 flex items-center justify-center text-[#00294D] font-bold text-xl mb-3">
                          ?
                        </div>
                        <h3 className="text-lg font-extrabold text-[#00294D]">
                          {t("maintenancePage.otherOption")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          {t("maintenancePage.otherSubtitle")}
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
