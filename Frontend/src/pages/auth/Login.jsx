import { useState } from "react";
import logoKiri from "../../assets/img/loginkiri.png";
import logoKecil from "../../assets/img/loginkanan.png";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);

    // TODO: Hubungkan ke endpoint backend
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo Section */}
      <div className="flex-1 overflow-hidden">
        {/* Ganti bagian ini dengan img tag */}
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
          <h2 className="text-3xl font-semibold text-slate-800 mb-8">Login</h2>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <Link
              to="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: "#2C3F48" }}
            >
              Forgot Password?
            </Link>

            <button
              onClick={handleSubmit}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: "#2C3F48" }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
