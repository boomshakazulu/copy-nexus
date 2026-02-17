import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { http } from "../utils/axios";
import Auth from "../utils/auth";
import { useI18n } from "../i18n";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const email = searchParams.get("email") || "";

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      if (!email) setStatus("missing");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await http.post("/users/verify-email", {
          email,
          token,
        });
        if (data?.token) {
          Auth.login(data.token);
        }
        setStatus("success");
      } catch (_err) {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams]);

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (!email || !code.trim()) {
      setSubmitError(t("auth.verifyCodeMissing"));
      return;
    }
    try {
      setStatus("loading");
      const { data } = await http.post("/users/verify-email", {
        email,
        code: code.trim(),
      });
      if (data?.token) {
        Auth.login(data.token);
      }
      setStatus("success");
    } catch (_err) {
      setStatus("error");
      setSubmitError(t("auth.verifyFailed"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-3xl font-extrabold text-[#00294D] mb-3">
          {t("auth.verifyTitle")}
        </h1>
        {status === "loading" && (
          <p className="text-sm text-gray-600">{t("auth.verifyLoading")}</p>
        )}
        {status === "missing" && (
          <p className="text-sm text-red-600">{t("auth.verifyMissing")}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">{t("auth.verifyFailed")}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-700">{t("auth.verifySuccess")}</p>
        )}
        {status !== "success" && (
          <form
            className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            onSubmit={handleCodeSubmit}
          >
            <label className="block text-sm font-semibold text-[#00294D] mb-2">
              {t("auth.verifyCodeLabel")}
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder={t("auth.verifyCodePlaceholder")}
              />
              <button
                type="submit"
                className="rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66]"
              >
                {t("auth.verifyCodeButton")}
              </button>
            </div>
            {submitError && (
              <p className="mt-2 text-sm text-red-600">{submitError}</p>
            )}
          </form>
        )}

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-[#00294D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003B66]"
          >
            {t("orderConfirmation.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
