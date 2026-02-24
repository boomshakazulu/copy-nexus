import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { http } from "../utils/axios";
import { useI18n } from "../i18n";
import SmartImage from "./SmartImage";

export default function SignupModal({ isOpen, onClose, showLogin }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current?.focus) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
    return () => clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
      await http.post("/users/signup-request", { email, password });
      setStatus("sent");
    } catch (err) {
      console.error(err);

      const msg = err.message || "";
      const code = err.code || "";

      if (code === "conflict" || msg.includes("email already registered")) {
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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div
        className="relative mx-auto flex h-full w-full max-w-md items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
          aria-describedby="signup-modal-description"
          className="relative w-full bg-white rounded-lg shadow-lg p-8"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <SmartImage
          src="/logo-sas.png"
          alt={t("common.logoAlt")}
          className="h-20 w-32 mx-auto mb-6"
          imgClassName="h-20 w-32 object-contain"
        />

        {/* Title */}
        <h1
          id="signup-modal-title"
          className="text-3xl font-bold text-center text-[#00294D] mb-6"
        >
          {t("auth.signupTitle")}
        </h1>
        <p id="signup-modal-description" className="sr-only">
          {t("auth.signupModalDescription")}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {status === "sent" && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {t("auth.signupVerifySent", { email })}
            </div>
          )}
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
              disabled={status === "sent"}
              ref={firstFieldRef}
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
              disabled={status === "sent"}
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
              disabled={status === "sent"}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition disabled:opacity-70"
            disabled={status === "sent"}
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
    </div>
  );
}
