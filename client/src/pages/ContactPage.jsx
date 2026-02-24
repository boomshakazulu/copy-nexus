import { useState } from "react";
import { useI18n } from "../i18n";
import { http } from "../utils/axios";

export default function ContactPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    contactMethod: "email",
    contactValue: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    const payload = {
      name: form.name.trim(),
      contactMethod: form.contactMethod,
      contactValue: form.contactValue.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.contactValue || !payload.message) {
      setSubmitError(t("contact.validationError"));
      return;
    }

    try {
      setSubmitting(true);
      await http.post("/contact", payload);
      setSubmitSuccess(true);
      setForm({
        name: "",
        contactMethod: "email",
        contactValue: "",
        message: "",
      });
    } catch (_err) {
      setSubmitError(t("contact.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Left side */}
      <div>
        <h2 className="text-3xl font-semibold mb-2">{t("contact.title")}</h2>
        <p className="text-gray-600 mb-8">{t("contact.subtitle")}</p>

        {/* Address */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-yellow-400 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.22-2.25 6.2-5 9.88C9.25 15.2 7 11.22 7 9z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">
              {t("contact.addressLabel")}
            </h3>
            <p className="text-gray-700">{t("contact.addressValue")}</p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-green-500 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.84 11.84 0 0012 0C5.39 0 0 5.38 0 12c0 2.12.55 4.2 1.6 6.05L0 24l6.17-1.6A11.94 11.94 0 0012 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.48-8.52zm-8.52 18.3c-1.91 0-3.8-.51-5.46-1.48l-.39-.23-3.66.95.98-3.57-.26-.4A9.78 9.78 0 012.22 12c0-5.4 4.39-9.79 9.78-9.79 2.62 0 5.08 1.02 6.94 2.87A9.77 9.77 0 0121.8 12c0 5.39-4.4 9.78-9.8 9.78zm5.36-7.3c-.29-.14-1.72-.85-1.98-.95-.27-.1-.47-.14-.67.14-.2.29-.77.95-.95 1.15-.17.2-.35.22-.64.07-.29-.14-1.2-.44-2.3-1.41-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.14-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.14-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.58c-.2 0-.52.07-.8.37-.27.29-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.14.2 2.1 3.2 5.1 4.48.71.31 1.26.5 1.69.64.71.23 1.36.2 1.88.12.57-.09 1.72-.7 1.97-1.38.24-.67.24-1.25.17-1.38-.07-.12-.27-.2-.57-.34z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">
              {t("contact.phoneLabel")}
            </h3>
            <a
              href="https://wa.link/40aqd7"
              className="text-gray-700 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {t("contact.phoneValue")}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="bg-yellow-400 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4.99l-8 5.01-8-5.01V6l8 5 8-5v2.99z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">
              {t("contact.emailLabel")}
            </h3>
            <a
              href={`mailto:${t("contact.emailValue")}`}
              className="text-gray-700 hover:underline"
            >
              {t("contact.emailValue")}
            </a>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-start gap-4 mt-6">
          <div className="bg-[#00294D] p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 1.75A10.25 10.25 0 1022.25 12 10.26 10.26 0 0012 1.75zm0 18.5A8.25 8.25 0 1120.25 12 8.26 8.26 0 0112 20.25zm.75-12.5a.75.75 0 00-1.5 0v4.72c0 .2.08.39.22.53l3.06 3.06a.75.75 0 101.06-1.06l-2.84-2.84z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">
              {t("contact.hoursLabel")}
            </h3>
            <p className="text-gray-700">{t("contact.hoursValue")}</p>
          </div>
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 text-[#00294D]">
          {t("contact.formTitle")}
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("contact.name")}
            </label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.contactMethodLabel")}
            </label>
            <select
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.contactMethod}
              onChange={handleChange("contactMethod")}
            >
              <option value="email">{t("common.contactMethods.email")}</option>
              <option value="whatsappText">{t("common.contactMethods.whatsappText")}</option>
              <option value="whatsappCall">{t("common.contactMethods.whatsappCall")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("contact.contactValue")}
            </label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder={t("contact.contactPlaceholder")}
              value={form.contactValue}
              onChange={handleChange("contactValue")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("contact.message")}
            </label>
            <textarea
              rows="4"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.message}
              onChange={handleChange("message")}
              required
            />
          </div>
          {submitError && (
            <p className="text-sm font-semibold text-red-600">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-sm font-semibold text-green-600">
              {t("contact.submitSuccess")}
            </p>
          )}
          <button
            type="submit"
            className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
      </div>
    </div>
  );
}
