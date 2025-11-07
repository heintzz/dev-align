import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // 👈 icon import
import authService from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";
import logoKiri from "@/assets/img/logokiribaru.png";
import logoKecil from "@/assets/img/loginkanan.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoadingState(true);
      setLoadingText("Logging in...");
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response.success) {
        const { token, role, id, name, email } = response.data;
        login(token, role, id, name, email);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* ===== Left Illustration Section ===== */}
      <div className="hidden md:flex md:w-1/2 bg-[#2C3F48] text-white flex-col items-center justify-center px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3F48] to-[#1f2e35] opacity-95"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logoKiri}
            alt="Illustration"
            className="w-[500px] h-[500px] object-contain mb-6"
          />
          <h3 className="text-2xl font-semibold mb-2">
            Empower Your Team with AI-Powered HRIS
          </h3>
          <p className="text-white/80 max-w-md text-base">
            Smart workforce analytics and intelligent project allocation to
            align every employee with the right opportunity.
          </p>
        </div>
      </div>

      {/* ===== Right Login Section ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 sm:p-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoKecil} alt="DevAlign" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-[#2C3F48]">DevAlign</h1>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-[#2C3F48]">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">Login to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loadingState}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3F48] focus:outline-none disabled:bg-gray-100"
                required
              />
            </div>

            {/* Password Input with Toggle */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loadingState}
                className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3F48] focus:outline-none disabled:bg-gray-100"
                required
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-9 text-gray-500 hover:text-[#2C3F48] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#2C3F48] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loadingState}
              className="w-full bg-[#2C3F48] text-white py-3 rounded-lg font-medium hover:bg-[#1f2e35] transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loadingState ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
