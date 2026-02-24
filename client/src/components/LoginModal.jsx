import { Mail, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { http } from "../utils/axios";
import Auth from "../utils/auth";
import { useI18n } from "../i18n";
import SmartImage from "./SmartImage";

export default function LoginModal({ isOpen, onClose, showSignup }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [resetStatus, setResetStatus] = useState("idle");
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (Auth.loggedIn()) {
      onClose();
    }
  }, [isOpen, onClose]);

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
  }, [isOpen, mode]);

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

    if (mode === "forgot") {
      try {
        await http.post("/users/forgot-password", { email });
        setResetStatus("sent");
      } catch (_err) {
        setResetStatus("error");
      }
      return;
    }

    const passwordField = e.target.querySelector('input[name="password"]');

    passwordField.setCustomValidity("");

    if (email && password) {
      try {
        const { data } = await http.post("/users/login", { email, password });
        if (data.token) {
          Auth.login(data.token);
        }
      } catch (err) {
        const msg = err.message || "";
        const code = err.code || "";

        if (code === "unauthorized" || msg.includes("Invalid credentials")) {
          passwordField.setCustomValidity(t("auth.errors.invalidCredentials"));
          passwordField.reportValidity();
          return;
        }

        passwordField.setCustomValidity(t("auth.errors.loginProblem"));
        passwordField.reportValidity();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative mx-auto flex h-full w-full max-w-md items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          aria-describedby="login-modal-description"
          className="relative w-full bg-white rounded-lg shadow-xl p-8"
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
          id="login-modal-title"
          className="text-3xl font-bold text-[#00294D] text-center mb-6"
        >
          {mode === "forgot" ? t("auth.forgotTitle") : t("auth.loginTitle")}
        </h1>
        <p id="login-modal-description" className="sr-only">
          {t("auth.loginModalDescription")}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-[#00294D] font-semibold mb-1">
            {t("auth.emailAddress")}
          </label>
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              name="email"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder={t("auth.emailPlaceholder")}
              onChange={(event) => setEmail(event.target.value)}
              ref={firstFieldRef}
            />
          </div>

          {mode === "login" && (
            <>
              <label className="block text-[#00294D] font-semibold mb-1">
                {t("auth.password")}
              </label>
              <input
                type="password"
                name="password"
                className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder={t("auth.passwordMask")}
                onChange={(event) => setPassword(event.target.value)}
                onInput={(e) => e.target.setCustomValidity("")}
              />
              <div className="mb-6 text-right">
                <button
                  type="button"
                  className="text-sm font-semibold text-[#00294D] hover:underline"
                  onClick={() => {
                    setMode("forgot");
                    setResetStatus("idle");
                  }}
                >
                  {t("auth.forgotLink")}
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
          >
            {mode === "forgot"
              ? t("auth.forgotButton")
              : t("auth.loginButton")}
          </button>

          {mode === "forgot" ? (
            <>
              {resetStatus === "sent" && (
                <p className="mt-3 text-center text-sm text-green-700">
                  {t("auth.forgotSent")}
                </p>
              )}
              {resetStatus === "error" && (
                <p className="mt-3 text-center text-sm text-red-600">
                  {t("auth.forgotFailed")}
                </p>
              )}
              <p className="mt-4 text-center text-sm text-gray-700">
                <button
                  type="button"
                  className="text-[#00294D] font-bold"
                  onClick={() => setMode("login")}
                >
                  {t("auth.backToLogin")}
                </button>
              </p>
            </>
          ) : (
            <p className="mt-4 text-center text-sm text-gray-700">
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                className="text-[#00294D] font-bold"
                onClick={showSignup}
              >
                {t("auth.signUpLink")}
              </button>
            </p>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}
