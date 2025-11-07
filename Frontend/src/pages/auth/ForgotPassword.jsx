import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck, Mail } from "lucide-react";
import logoKiri from "@/assets/img/logokiribaru.png";
import logoKecil from "@/assets/img/loginkanan.png";
import authService from "@/services/auth.service";
import Loading from "@/components/Loading";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLoadingText("Sending forgot password email...");

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Loading status={isLoading} fullscreen text={loadingText} />
      {/* ===== Left Side ===== */}
      <div className="hidden md:flex md:w-1/2 bg-[#2C3F48] flex-col items-center justify-center px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3F48] to-[#1f2e35] opacity-95"></div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <img
            src={logoKiri}
            alt="DevAlign Illustration"
            className="w-[480px] h-[480px] object-contain mb-6"
          />
          <h3 className="text-2xl font-semibold text-white mb-2">
            Secure Your Access with DevAlign
          </h3>
          <p className="text-white/80 max-w-md">
            Forgot your password? No worries. We’ll help you regain access
            quickly and securely.
          </p>
        </div>
      </div>

      {/* ===== Right Side ===== */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 sm:px-10 py-12">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 sm:p-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logoKecil} alt="DevAlign" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-[#2C3F48]">DevAlign</h1>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-[#2C3F48]">
              Forgot Password
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div className="text-center bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex justify-center mb-3">
                <MailCheck className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-green-800 font-medium text-lg mb-1">
                Reset Link Sent!
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Please check your inbox for instructions to reset your password.
              </p>
              <Link
                to="/login"
                className="text-[#2C3F48] text-sm font-medium hover:underline"
              >
                Back to Login
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {!isSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>

                <Mail
                  className="absolute left-3 top-10 text-gray-400"
                  size={18}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3F48] focus:outline-none disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-[#2C3F48] text-white py-3 rounded-lg font-medium hover:bg-[#1f2e35] transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#2C3F48] hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
