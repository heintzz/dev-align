import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const {
    token,
    userId,
    name: storedName,
    email: storedEmail,
    role: storedRole,
  } = useAuthStore();
  const [profile, setProfile] = useState({
    name: storedName,
    email: storedEmail,
    role: storedRole,
    phoneNumber: "",
    placeOfBirth: "",
    dateOfBirth: null,
    position: { name: "" },
    skills: [],
    active: true,
    createdAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!userId || !token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3001"
          }/hr/employee/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(
          data.data || {
            name: storedName,
            email: storedEmail,
            role: storedRole,
            phoneNumber: "",
            placeOfBirth: "",
            dateOfBirth: null,
            position: { name: "" },
            skills: [],
            active: true,
            createdAt: null,
          }
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [userId, token]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-[#2C3F48]">Profile</h2>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-gray-500">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-red-500">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="block text-sm text-gray-500">Full Name</span>
                  <span className="block text-base font-medium text-gray-900">
                    {profile.name}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Email</span>
                  <span className="block text-base font-medium text-gray-900">
                    {profile.email}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">
                    Phone Number
                  </span>
                  <span className="block text-base font-medium text-gray-900">
                    {profile.phoneNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">
                    Place of Birth
                  </span>
                  <span className="block text-base font-medium text-gray-900">
                    {profile.placeOfBirth || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">
                    Date of Birth
                  </span>
                  <span className="block text-base font-medium text-gray-900">
                    {formatDate(profile.dateOfBirth)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Work Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="block text-sm text-gray-500">Role</span>
                  <span className="block text-base font-medium text-gray-900 capitalize">
                    {profile.role}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Position</span>
                  <span className="block text-base font-medium text-gray-900">
                    {profile.position?.name || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.skills?.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2C3F48] text-white"
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">
                    Joined Date
                  </span>
                  <span className="block text-base font-medium text-gray-900">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
