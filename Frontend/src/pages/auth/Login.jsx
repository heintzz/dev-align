import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import authService from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logoKiri from "@/assets/img/logokiribaru.png";
import logoKecil from "@/assets/img/loginkanan.png";
import { toast } from "@/lib/toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        toast("Login successfully", {
          type: "success",
          position: "top-center",
          duration: 5000,
        });
        const { token, role, id, name, email } = response.data;
        login(token, role, id, name, email);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      toast(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
        {
          type: "error",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Left Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 via-blue-700 to-cyan-600 text-white flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src={logoKiri}
              alt="DevAlign Illustration"
              className="w-[500px] h-[500px] object-contain drop-shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-cyan-100">
            Empower Your Team with AI
          </h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Smart workforce analytics and intelligent project allocation to
            align every employee with the right opportunity.
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl">
                <img src={logoKecil} alt="DevAlign" className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                DevAlign
              </h1>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to your account to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loadingState}
                    className="pl-11 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loadingState}
                    className="pl-11 pr-11 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loadingState}
                className="w-full h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                {loadingState ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
