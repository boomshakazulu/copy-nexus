import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { http } from "../utils/axios";
import Auth from "../utils/auth";
import { useI18n } from "../i18n";

export default function SignupModal({ isOpen, onClose, showLogin }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (Auth.loggedIn()) {
      onClose();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailField = e.target.querySelector('input[type="email"]');
    const passwordField = e.target.querySelector('input[name="password"]');
    const confirmField = e.target.querySelector(
      'input[name="confirmPassword"]'
    );

    // Always clear any lingering validity before checks
    emailField.setCustomValidity("");
    passwordField.setCustomValidity("");
    confirmField.setCustomValidity("");

    if (!emailField.validity.valid) {
      emailField.reportValidity();
      return;
    }

    if (password.length < 8) {
      passwordField.setCustomValidity(t("auth.errors.passwordLength"));
      passwordField.reportValidity();
      return;
    }

    if (confirmPassword !== password) {
      confirmField.setCustomValidity(t("auth.errors.passwordMismatch"));
      confirmField.reportValidity();
      return;
    }

    try {
      const { data } = await http.post("/users/create", { email, password });
      Auth.login(data.token);
      onClose();
    } catch (err) {
      console.error(err);

      const msg = err.message || "";

      if (msg.includes("email already registered")) {
        emailField.setCustomValidity(t("auth.errors.emailTaken"));
        emailField.reportValidity();
        return;
      }

      // fallback for other unknown errors
      emailField.setCustomValidity(t("auth.errors.signupProblem"));
      emailField.reportValidity();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <img
          src="/logo-cropped.png"
          alt={t("common.logoAlt")}
          className="h-20 mx-auto mb-6"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#00294D] mb-6">
          {t("auth.signupTitle")}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              {t("auth.emailAddress")}
            </label>
            <input
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder")}
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setEmail(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              {t("auth.password")}
            </label>
            <input
              type="password"
              name="password"
              placeholder={t("auth.passwordPlaceholder")}
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setPassword(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setConfirmPassword(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
          >
            {t("auth.signupButton")}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="mt-4 text-center text-sm text-[#00294D]">
          {t("auth.haveAccount")}{" "}
          <button onClick={showLogin} className="font-semibold hover:underline">
            {t("auth.loginLink")}
          </button>
        </p>
      </div>
    </div>
  );
}
