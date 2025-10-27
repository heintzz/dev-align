import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logoKiri from "../../assets/img/loginkiri.png";
import logoKecil from "../../assets/img/loginkanan.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Ambil token dari URL
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Reset password:", formData);
    console.log("Token:", token);
    // TODO: Kirim ke backend
    // await resetPasswordAPI(token, formData.newPassword);

    setIsSubmitted(true);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo Section */}
      <div
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: "#2C3F48" }}
      >
        <img
          src={logoKiri}
          alt="DevAlign Logo"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Side - Reset Password Form */}
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

          {/* Reset Password Title */}
          <h2
            className="text-3xl font-semibold mb-3"
            style={{ color: "#2C3F48" }}
          >
            Reset Password
          </h2>
          <p className="text-slate-600 text-sm mb-8">
            Enter your new password below.
          </p>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm font-medium mb-1">
                Password reset successful!
              </p>
              <p className="text-green-700 text-sm">
                Redirecting to login page...
              </p>
            </div>
          ) : null}

          {/* Reset Password Form */}
          <div className="space-y-6">
            <div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#2C3F48" }}
            >
              {isSubmitted ? "Password Reset!" : "Reset Password"}
            </button>

            <div className="text-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Navigate to login");
                }}
                className="text-sm hover:underline cursor-pointer"
                style={{ color: "#2C3F48" }}
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
