import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck, Mail, Send, ArrowLeft } from "lucide-react";
import logoKiri from "@/assets/img/logokiribaru.png";
import logoKecil from "@/assets/img/loginkanan.png";
import authService from "@/services/auth.service";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLoadingText("Sending reset link...");

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
    <div className="flex min-h-screen">
      <Loading status={isLoading} fullscreen text={loadingText} />

      {/* Left Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src={logoKiri}
              alt="DevAlign Illustration"
              className="w-[480px] h-[480px] object-contain drop-shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
            Secure Your Access
          </h2>
          <p className="text-lg text-purple-100 max-w-md leading-relaxed">
            Forgot your password? No worries. We'll help you regain access
            quickly and securely.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <img src={logoKecil} alt="DevAlign" className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DevAlign
              </h1>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isSubmitted
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <MailCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-green-900 font-bold text-lg mb-2">
                  Reset Link Sent!
                </h3>
                <p className="text-green-700 text-sm mb-4 leading-relaxed">
                  We've sent password reset instructions to{" "}
                  <span className="font-semibold">{email}</span>
                  . Please check your inbox and follow the link to reset your
                  password.
                </p>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-11 h-12 border-gray-300 focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
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
