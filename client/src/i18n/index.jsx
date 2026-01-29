import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import es from "./es-419.json";

const translations = {
  en,
  "es-419": es,
};

const I18nContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);

const interpolate = (value, vars) => {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  );
};

const detectLanguage = () => {
  try {
    const stored = window.localStorage.getItem("lang");
    if (stored && translations[stored]) return stored;
  } catch {
    // ignore storage errors
  }

  const browserLang =
    typeof navigator !== "undefined"
      ? navigator.language || navigator.languages?.[0] || ""
      : "";

  const normalized = browserLang.toLowerCase();

  if (normalized.startsWith("es")) return "es-419";
  if (normalized.startsWith("en")) return "en";

  return "es-419";
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem("lang", lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key, vars) => {
      const table = translations[lang] || translations.en;
      const fallback = translations.en;
      const value =
        getNestedValue(table, key) ?? getNestedValue(fallback, key) ?? key;
      if (typeof value !== "string") return key;
      return interpolate(value, vars);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
