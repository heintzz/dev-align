import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logoKiri from "../../assets/img/loginkiri.png";
import logoKecil from "../../assets/img/loginkanan.png";
import authService from "../../services/auth.service";
import Loading from "@/components/Loading";
import { useAuthStore } from "@/store/useAuthStore";

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error saat user mengetik
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoadingState(true);
      setLoadingText("Login");
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response.success) {
        const { token, role, id } = response.data;
        login(token, role, id);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoadingText("");
      setLoadingState(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Left Side - Logo Section */}
      <div className="flex-1 overflow-hidden">
        <img
          src={logoKiri}
          alt="DevAlign Logo"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
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

          {/* Login Title */}
          <h2
            className="text-3xl font-semibold mb-8"
            style={{ color: "#2C3F48" }}
          >
            Login
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loadingState}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loadingState}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm hover:underline"
                style={{ color: "#2C3F48" }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loadingState}
              className="w-full text-white cursor-pointer font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#2C3F48" }}
            >
              {loadingState ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
