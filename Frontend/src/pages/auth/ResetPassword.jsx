import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import logoKiri from "../../assets/img/logokiribaru.png";
import logoKecil from "../../assets/img/loginkanan.png";
import authService from "../../services/auth.service";
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
import { toast } from "@/lib/toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    if (error) setError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    if (!token || !userId) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    setLoadingText("Resetting password...");
    try {
      await authService.resetPassword(
        userId,
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      setIsSubmitted(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setError(error.message || "Failed to reset password. Please try again.");
      toast(error.message || "Failed to reset password. Please try again.", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Loading status={isLoading} fullscreen text={loadingText} />

      {/* Left Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-600 text-white flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src={logoKiri}
              alt="DevAlign Illustration"
              className="w-[500px] h-[500px] object-contain drop-shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
            Create a New Password
          </h2>
          <p className="text-lg text-teal-100 max-w-md leading-relaxed">
            Smart workforce analytics and intelligent project allocation,
            aligning every employee with the right opportunity for impact.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                <img src={logoKecil} alt="DevAlign" className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                DevAlign
              </h1>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Reset Password
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isSubmitted
                  ? "Your password has been reset successfully"
                  : "Enter your new password below"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-green-900 font-bold text-lg mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-green-700 text-sm mb-1">
                  Your password has been changed successfully.
                </p>
                <p className="text-green-600 text-xs">
                  Redirecting to login page...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !isSubmitted && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            {!isSubmitted && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`pl-11 pr-11 h-12 ${
                        errors.newPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`pl-11 pr-11 h-12 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
