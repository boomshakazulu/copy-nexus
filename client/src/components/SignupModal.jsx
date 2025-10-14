import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { http } from "../utils/axios";
import Auth from "../utils/auth";

export default function SignupModal({ isOpen, onClose, showLogin }) {
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
      passwordField.setCustomValidity(
        "Password must be at least 8 characters long."
      );
      passwordField.reportValidity();
      return;
    }

    if (confirmPassword !== password) {
      confirmField.setCustomValidity("Passwords do not match.");
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
        emailField.setCustomValidity("This email is already registered.");
        emailField.reportValidity();
        return;
      }

      // fallback for other unknown errors
      emailField.setCustomValidity(
        "There was a problem creating your account."
      );
      emailField.reportValidity();
    }
  };

  return (
    // <!-- Modal Overlay -->
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* <!-- Modal Box --> */}
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-8 relative">
        {/* <!-- Close Button --> */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* <!-- Logo --> */}
        <img
          src="/logo-cropped.png"
          alt="Copy Nexus Logo"
          className="h-20 mx-auto mb-6"
        />

        {/* <!-- Title --> */}
        <h1 className="text-3xl font-bold text-center text-[#00294D] mb-6">
          Sign Up
        </h1>

        {/* <!-- Form --> */}
        <form onSubmit={handleSubmit}>
          {/* <!-- Email --> */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setEmail(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* <!-- Password --> */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setPassword(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* <!-- Confirm Password --> */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setConfirmPassword(event.target.value)}
              onInput={(e) => e.target.setCustomValidity("")}
            />
          </div>

          {/* <!-- Submit Button --> */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
          >
            Sign up
          </button>
        </form>

        {/* <!-- Switch to Login --> */}
        <p className="mt-4 text-center text-sm text-[#00294D]">
          Already have an account?
          <button onClick={showLogin} className="font-semibold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
