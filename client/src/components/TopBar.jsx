import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import Auth from "../utils/auth";
import { useI18n } from "../i18n";

export default function TopBar() {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (Auth.loggedIn()) {
      if (Auth.isAdmin()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      return setLoggedIn(true);
    }
    setLoggedIn(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //shows login and closes menu on click
  const showLoginModal = () => {
    setShowLogin(true);
    setMenuOpen(false);
  };

  //shows signup and closes menu on click
  const showSignupModal = () => {
    setShowSignup(true);
    setMenuOpen(false);
  };

  //function for switching from login to signup modal or visa versa
  const switchLoginSignup = () => {
    setShowLogin(!showLogin);
    setShowSignup(!showSignup);
  };

  return (
    <header className="bg-white w-full">
      <div className="flex items-center justify-between px-2 sm:px-6 py-2 sm:py-4 max-w-6xl mx-auto">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src="/logo-sas.png"
            alt={t("common.logoAlt")}
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>
        <div className="flex gap-2 sm:gap-4 md:gap-6 pl-6 sm:pl-0 text-black font-medium text-sm">
          {/* Top Navigation - always visible */}
          <nav className="flex gap-2 sm:gap-4 md:gap-6 text-black font-medium text-sm">
            <Link to="/">{t("nav.home")}</Link>
            <Link to="/copiers">{t("nav.copiers")}</Link>
            <Link to="/contact">{t("nav.contact")}</Link>
          </nav>

          <div className="relative" ref={langRef}>
            <button
              type="button"
              aria-label={t("language.label")}
              onClick={() => setLangOpen((open) => !open)}
              className="flex h-8 w-10 items-center justify-center rounded-md border border-gray-300 bg-white"
            >
              {lang === "es-419" ? <ColombiaFlag /> : <UsaFlag />}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-24 rounded-md border border-gray-200 bg-white shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <UsaFlag />
                  <span className="text-xs">EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("es-419");
                    setLangOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <ColombiaFlag />
                  <span className="text-xs">ES</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger menu - always visible */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-black">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <>
        {/* LoginModal */}
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          showSignup={() => switchLoginSignup()}
        />

        {/* SignupModal */}
        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          showLogin={() => switchLoginSignup()}
        />
      </>

      {/* Side Menu (overlay) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-17 right-0 w-64 h-full bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-4 text-black font-medium text-base">
              <Link to="/about">{t("nav.about")}</Link>
              {!loggedIn ? (
                <div className="flex flex-col gap-4 text-black font-medium text-base">
                  <button
                    className="text-left"
                    onClick={() => showLoginModal()}
                  >
                    {t("nav.login")}
                  </button>
                  <button
                    className="text-left"
                    onClick={() => showSignupModal()}
                  >
                    {t("nav.signup")}
                  </button>
                </div>
              ) : (
                <button className="text-left" onClick={() => Auth.logout()}>
                  {t("nav.logout")}
                </button>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={(e) => {
                    (e.stopPropagation(), setMenuOpen(false));
                  }}
                >
                  {t("nav.admin")}
                </Link>
              )}
              {/* <Link to="/billing" onClick={() => setMenuOpen(false)}>
                Billing
              </Link> */}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function UsaFlag() {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 22 14"
      aria-hidden="true"
      className="rounded-sm border border-gray-200"
    >
      <rect width="22" height="14" fill="#B22234" />
      <rect y="2" width="22" height="2" fill="#FFFFFF" />
      <rect y="6" width="22" height="2" fill="#FFFFFF" />
      <rect y="10" width="22" height="2" fill="#FFFFFF" />
      <rect width="9" height="8" fill="#3C3B6E" />
    </svg>
  );
}

function ColombiaFlag() {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 22 14"
      aria-hidden="true"
      className="rounded-sm border border-gray-200"
    >
      <rect width="22" height="7" fill="#FCD116" />
      <rect y="7" width="22" height="3.5" fill="#003893" />
      <rect y="10.5" width="22" height="3.5" fill="#CE1126" />
    </svg>
  );
}
