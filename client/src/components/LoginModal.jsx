import { Mail, X } from "lucide-react";

export default function LoginModal({ isOpen, onClose, showSignup }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-xl p-8">
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
          alt="Copy Nexus Logo"
          className="h-20 mx-auto mb-6"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#00294D] text-center mb-6">
          Login
        </h1>

        {/* Form */}
        <form>
          <label className="block text-[#00294D] font-semibold mb-1">
            Email address
          </label>
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
            />
          </div>

          <label className="block text-[#00294D] font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full mb-6 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="••••••••"
          />

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
          >
            Log in
          </button>

          <p className="mt-4 text-center text-sm text-gray-700">
            Don’t have an account?{" "}
            <button className="text-[#00294D] font-bold" onClick={showSignup}>
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
