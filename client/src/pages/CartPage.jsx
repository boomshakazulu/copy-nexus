import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { formatCOP } from "../utils/helpers";
import { useI18n } from "../i18n";
import { http } from "../utils/axios";
import coDepsCities from "../utils/coDepsCities.json";

const POLICY_VERSION = import.meta.env.VITE_PRIVACY_POLICY_VERSION || "1.0";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneCountryCode: "+57",
    phone: "",
    idType: "",
    idNumber: "",
    preferredContactMethod: "",
    streetAddress: "",
    neighborhood: "",
    city: "",
    department: "",
    postalCode: "",
    notes: "",
    consent: false,
  });
  const phoneCountryOptions = [
    { code: "+57", label: "CO (+57)" },
    { code: "+1", label: "US/CA (+1)" },
    { code: "+52", label: "MX (+52)" },
    { code: "+34", label: "ES (+34)" },
  ];
  const departments = coDepsCities?.departments ?? [];
  const selectedDepartment = departments.find(
    (dep) => dep.name === form.department
  );
  const cities = selectedDepartment?.cities ?? [];
  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item?.purchasePrice) || 0) * (Number(item?.quantity) || 1),
    0
  );
  const totalItems = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 1),
    0
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };
  const handleDepartmentChange = (event) => {
    const nextDepartment = event.target.value;
    setForm((prev) => ({
      ...prev,
      department: nextDepartment,
      city: "",
      neighborhood: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!items.length) {
      setSubmitError(t("cart.form.noItems"));
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPhone = form.phone.trim();
    const trimmedIdType = form.idType.trim();
    const trimmedIdNumber = form.idNumber.trim();
    const trimmedContact = form.preferredContactMethod.trim();
    const trimmedStreet = form.streetAddress.trim();
    const trimmedCity = form.city.trim();
    const trimmedDepartment = form.department.trim();

    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const isValidPhone = phoneDigits.length >= 7 && phoneDigits.length <= 15;

    if (
      !trimmedName ||
      !isValidEmail ||
      !isValidPhone ||
      !trimmedIdType ||
      !trimmedIdNumber ||
      !trimmedContact ||
      !trimmedStreet ||
      !trimmedCity ||
      !trimmedDepartment ||
      !form.consent
    ) {
      setSubmitError(t("cart.form.validationError"));
      return;
    }

    const payload = {
      customer: {
        name: trimmedName,
        email: trimmedEmail,
        phone: `${form.phoneCountryCode} ${phoneDigits}`.trim(),
        idType: trimmedIdType,
        idNumber: trimmedIdNumber,
        preferredContactMethod: trimmedContact,
      },
      shippingAddress: {
        streetAddress: trimmedStreet,
        neighborhood: form.neighborhood.trim(),
        city: trimmedCity,
        department: trimmedDepartment,
        postalCode: form.postalCode.trim(),
      },
      items: items.map((item) => ({
        product: item._id ?? item.id,
        name: item.name,
        model: item.model || item.subtitle || "",
        qty: Number(item.quantity) || 1,
        unitAmount: Number(item.purchasePrice) || 0,
        IsRented: item.cartMode === "rent",
      })),
      notes: form.notes.trim(),
      consent: !!form.consent,
      consentMeta: {
        policyVersion: POLICY_VERSION,
      },
    };

    setIsSubmitting(true);
    try {
      await http.post("/orders", payload);
      sessionStorage.setItem(
        "orderConfirmation",
        JSON.stringify({
          email: payload.customer.email,
          preferredContactMethod: payload.customer.preferredContactMethod,
        }),
      );
      setSubmitSuccess(true);
      setShowForm(false);
      clearCart();
      setForm({
        name: "",
        email: "",
        phoneCountryCode: "+57",
        phone: "",
        idType: "",
        idNumber: "",
        preferredContactMethod: "",
        streetAddress: "",
        neighborhood: "",
        city: "",
        department: "",
        postalCode: "",
        notes: "",
        consent: false,
      });
      navigate("/order-confirmation");
    } catch (err) {
      setSubmitError(t("cart.form.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl pb-2 font-extrabold text-[#00294D]">
            {t("cart.title")}
          </h1>
          <p className="text-sm text-gray-500">{t("cart.subtitle")}</p>
        </div>
        <Link to="/parts" className="text-sm font-semibold text-[#00294D]">
          {t("cart.keepShopping")}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-md">
          {t("cart.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemId = item?._id ?? item?.id ?? item?.name;
              const image =
                item?.images && item.images.length > 0
                  ? item.images[0]
                  : "/part.png";
              const rentCostPerPrint = Number(item?.rentCostPerPrint) || 0;
              const rentCostPerScan = Number(item?.rentCostPerScan) || 0;
              const showRentCosts =
                item?.cartMode === "rent" &&
                (rentCostPerPrint > 0 || rentCostPerScan > 0);
              return (
                <div
                  key={itemId}
                  className="flex flex-col sm:flex-row gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-24 w-24 rounded-lg bg-[#F8FAFC] grid place-items-center shrink-0">
                    <img
                      src={image}
                      alt={item?.name || t("cart.item")}
                      className="h-16 object-contain"
                    />
                  </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#00294D]">
                        {item?.name}
                      </h2>
                      {item?.subtitle && (
                        <p className="text-sm text-gray-500">
                          {item.subtitle}
                        </p>
                      )}
                      <span className="mt-2 inline-flex items-center rounded-full bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#00294D]">
                        {item?.cartMode === "rent"
                          ? t("cart.rental")
                          : t("cart.purchase")}
                      </span>
                    </div>
                    {item?.purchasePrice && (
                      <span className="text-sm font-semibold text-[#00294D]">
                        {formatCOP(item.purchasePrice)}
                        {item?.cartMode === "rent"
                          ? ` ${t("product.perMonth")}`
                          : ""}
                      </span>
                    )}
                  </div>
                  {showRentCosts && (
                    <div className="mt-2 space-y-1 text-sm text-[#555]">
                      {rentCostPerPrint > 0 && (
                        <div>
                          {t("product.pricePerCopy")}: {" "}
                          <span className="font-semibold text-[#00294D]">
                            {formatCOP(rentCostPerPrint)}
                          </span>
                        </div>
                      )}
                      {rentCostPerScan > 0 && (
                        <div>
                          {t("product.pricePerScan")}: {" "}
                          <span className="font-semibold text-[#00294D]">
                            {formatCOP(rentCostPerScan)}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("product.rentalOnlyNote")}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-gray-500">
                        {t("cart.quantity")}
                      </label>
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              itemId,
                              Math.max(1, (item.quantity || 1) - 1)
                            )
                          }
                          className="h-8 w-8 text-sm font-semibold text-[#00294D] hover:bg-gray-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            updateQuantity(itemId, e.target.value)
                          }
                          className="h-8 w-12 text-center text-sm font-semibold text-[#00294D] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(itemId, (item.quantity || 1) + 1)
                          }
                          className="h-8 w-8 text-sm font-semibold text-[#00294D] hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(itemId)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-[#00294D] mb-4">
              {t("cart.summary")}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{t("cart.items")}</span>
              <span className="font-semibold text-[#00294D]">
                {totalItems}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>{t("cart.total")}</span>
              <span className="font-semibold text-[#00294D]">
                {formatCOP(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-lg bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66]"
            >
              {t("cart.checkout")}
            </button>
            <p className="mt-3 text-xs text-gray-500">
              {t("cart.checkoutHint")}
            </p>
            {submitSuccess && (
              <p className="mt-3 text-xs font-semibold text-green-600">
                {t("cart.form.submitSuccess")}
              </p>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="text-2xl font-extrabold text-[#00294D] mb-2">
            {t("cart.form.title")}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t("cart.form.subtitle")}
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.name")}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.phone")}
              </label>
              <div className="flex gap-2">
                <select
                  value={form.phoneCountryCode}
                  onChange={handleChange("phoneCountryCode")}
                  className="w-32 border border-gray-300 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label={t("cart.form.phoneCountryCode")}
                >
                  {phoneCountryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{7,15}"
                  title={t("cart.form.phoneHint")}
                  value={form.phone}
                  onChange={handleChange("phone")}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.idType")}
              </label>
              <select
                value={form.idType}
                onChange={handleChange("idType")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">{t("cart.form.idTypePlaceholder")}</option>
                <option value="CC">{t("cart.form.idTypes.cc")}</option>
                <option value="CE">{t("cart.form.idTypes.ce")}</option>
                <option value="NIT">{t("cart.form.idTypes.nit")}</option>
                <option value="TI">{t("cart.form.idTypes.ti")}</option>
                <option value="PAS">{t("cart.form.idTypes.pas")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.idNumber")}
              </label>
              <input
                type="text"
                value={form.idNumber}
                onChange={handleChange("idNumber")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("common.contactMethodLabel")}
              </label>
              <select
                value={form.preferredContactMethod}
                onChange={handleChange("preferredContactMethod")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">
                  {t("common.contactMethodPlaceholder")}
                </option>
                <option value="email">
                  {t("common.contactMethods.email")}
                </option>
                <option value="whatsappCall">
                  {t("common.contactMethods.whatsappCall")}
                </option>
                <option value="whatsappText">
                  {t("common.contactMethods.whatsappText")}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.street")}
              </label>
              <input
                type="text"
                value={form.streetAddress}
                onChange={handleChange("streetAddress")}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.department")}
              </label>
              <select
                value={form.department}
                onChange={handleDepartmentChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">{t("cart.form.departmentPlaceholder")}</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.name}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.city")}
              </label>
              <select
                value={form.city}
                onChange={handleChange("city")}
                required
                disabled={!form.department}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
              >
                <option value="">{t("cart.form.cityPlaceholder")}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.neighborhood")}
              </label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={handleChange("neighborhood")}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.postalCode")}
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={handleChange("postalCode")}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#00294D] mb-1">
                {t("cart.form.notes")}
              </label>
              <textarea
                value={form.notes}
                onChange={handleChange("notes")}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      consent: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  required
                />
                <span>
                  {t("cart.form.consent")}{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-[#00294D] underline"
                  >
                    {t("cart.form.privacyLink")}
                  </Link>
                  .
                </span>
              </label>
            </div>

            {submitError && (
              <div className="md:col-span-2 text-sm font-semibold text-red-600">
                {submitError}
              </div>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#00294D] hover:bg-[#003B66]"
                }`}
              >
                {isSubmitting ? t("cart.form.submitting") : t("cart.form.submit")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-[#00294D] hover:bg-gray-50"
              >
                {t("cart.form.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
