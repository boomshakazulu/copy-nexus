import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { http } from "../utils/axios";
import Auth from "../utils/auth";

export default function SignupModal({ isOpen, onClose, showLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (Auth.loggedIn()) {
      onClose();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (confirmPassword !== password) {
      setErrorMessage("Passwords don't match, Please try again");
      console.log(errorMessage);
    } else {
      try {
        const { data } = await http.post("/users/create", {
          email: email,
          password: password,
        });
        console.log(data);
        const token = data.token;
        Auth.login(token);
        setErrorMessage(null);
        onClose();
      } catch (err) {
        console.log(err);
        setErrorMessage(
          "there was a problem creating your account please try again"
        );
      }
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
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {/* <!-- Password --> */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {/* <!-- Confirm Password --> */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#00294D] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring focus:ring-red-100"
              onChange={(event) => setConfirmPassword(event.target.value)}
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
