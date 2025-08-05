import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white w-full">
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Logo */}
        <img
          src="/logo-cropped.png"
          alt="Copy Nexus Logo"
          className="h-12 sm:h-16 md:h-20 w-auto object-contain"
        />
        <div className="flex gap-2 sm:gap-4 md:gap-6 pl-6 sm:pl-0 text-black font-medium text-sm">
          {/* Top Navigation - always visible */}
          <nav className="flex gap-2 sm:gap-4 md:gap-6 text-black font-medium text-sm">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/products">Products</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          {/* Hamburger menu - always visible */}
          <button onClick={() => setMenuOpen(true)} className="text-black">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

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
            {/* <div className="flex justify-end">
              <button onClick={() => setMenuOpen(false)} className="text-black">
                <Menu className="w-6 h-6" />
              </button>
            </div> */}
            <nav className="flex flex-col gap-4 text-black font-medium text-base">
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                Signup
              </Link>
              <Link to="/biling" onClick={() => setMenuOpen(false)}>
                Billing
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
