import { useState } from "react";
import { Link } from "react-router-dom";
import logoKiri from "../../assets/img/logokiribaru.png";
import logoKecil from "../../assets/img/loginkanan.png";
import authService from "../../services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Illustration + Text */}
      <div className="flex-1 overflow-hidden bg-[#2C3F48] flex flex-col items-center justify-center px-8 relative">
        <img
          src={logoKiri}
          alt="DevAlign Illustration"
          className="w-[700px] h-[700px] object-contain opacity-90 mb-3"
        />

        <div className="text-center -mt-4">
          <h3 className="text-white text-2xl font-semibold leading-tight mb-2">
            Empower Your Team with AI-Powered HRIS
          </h3>
          <p className="text-white/85 text-base max-w-md mx-auto">
            Smart workforce analytics and intelligent project allocation,
            aligning every employee with the right opportunity for impact.
          </p>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <img
                src={logoKecil}
                alt="DevAlign"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold" style={{ color: "#2C3F48" }}>
                DevAlign
              </h1>
            </div>
            <p className="text-slate-600 text-sm">Welcome to DevAlign</p>
          </div>

          {/* Forgot Password Title */}
          <h2
            className="text-3xl font-semibold mb-3"
            style={{ color: "#2C3F48" }}
          >
            Forgot Password
          </h2>
          <p className="text-slate-600 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {/* Success Message */}
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm font-medium mb-1">
                Reset link has been sent!
              </p>
              <p className="text-green-700 text-sm">
                Please check your email inbox and follow the link to reset your
                password.
              </p>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Forgot Password Form */}
          {!isSubmitted && (
            <div className="space-y-6">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !email}
                className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#2C3F48" }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm hover:underline"
                  style={{ color: "#2C3F48" }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Show back to login if submitted */}
          {isSubmitted && (
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-sm hover:underline"
                style={{ color: "#2C3F48" }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
