import React, { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";

export default function ChangePasswordPage() {
  const { token } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setLoadingState(true);
    setLoadingText("Changing Password...");
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to change password");
      } else {
        setSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
      setLoadingState(false);
      setLoadingText("");
    }
  };

  return (
    <AppLayout>
      <Loading status={loadingState} fullscreen text={loadingText} />

      <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-[#2C3F48]">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-[#2C3F48] text-white py-2 rounded hover:bg-[#1F2E35] transition"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
