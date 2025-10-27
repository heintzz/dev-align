import { useState } from "react";

import logoKiri from "../../assets/img/loginkiri.png";
import logoKecil from "../../assets/img/loginkanan.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset password for:", email);
    setIsSubmitted(true);
    // TODO: Hubungkan ke endpoint backend
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo Section */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#2C3F48' }}>
        <img 
          src={logoKiri} 
          alt="DevAlign Logo" 
          className="w-full h-screen object-cover"
        />
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
              <h1 className="text-2xl font-bold" style={{ color: '#2C3F48' }}>DevAlign</h1>
            </div>
            <p className="text-slate-600 text-sm">Welcome to DevAlign</p>
          </div>

          {/* Forgot Password Title */}
          <h2 className="text-3xl font-semibold mb-3" style={{ color: '#2C3F48' }}>Forgot Password</h2>
          <p className="text-slate-600 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                Reset link has been sent to your email. Please check your inbox.
              </p>
            </div>
          ) : null}

          {/* Forgot Password Form */}
          <div className="space-y-6">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: '#2C3F48' }}
            >
              Send Reset Link
            </button>

            <div className="text-center">
              <a 
                href="/login" 
                className="text-sm hover:underline"
                style={{ color: '#2C3F48' }}
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