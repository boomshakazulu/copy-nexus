import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import Auth from "../utils/auth";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <img
          src="/logo-cropped.png"
          alt="Copy Nexus Logo"
          className="h-16 md:h-20 w-auto object-contain"
        />
        <div className="flex gap-2 sm:gap-4 md:gap-6 pl-6 sm:pl-0 text-black font-medium text-sm">
          {/* Top Navigation - always visible */}
          <nav className="flex gap-2 sm:gap-4 md:gap-6 text-black font-medium text-sm">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/contact">Contact</Link>
          </nav>

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
              <Link to="/about">About Us</Link>
              {!loggedIn ? (
                <div className="flex flex-col gap-4 text-black font-medium text-base">
                  <button
                    className="text-left"
                    onClick={() => showLoginModal()}
                  >
                    Login
                  </button>
                  <button
                    className="text-left"
                    onClick={() => showSignupModal()}
                  >
                    Signup
                  </button>
                </div>
              ) : (
                <button className="text-left" onClick={() => Auth.logout()}>
                  Logout
                </button>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={(e) => {
                    (e.stopPropagation(), setMenuOpen(false));
                  }}
                >
                  Admin
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
