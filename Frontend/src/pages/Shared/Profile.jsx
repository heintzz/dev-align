import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Loader2,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Role color mapping
  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700 border-red-200",
      pm: "bg-blue-100 text-blue-700 border-blue-200",
      staff: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your personal information and work details
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        ) : error ? (
          // Error State
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="w-6 h-6" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white">
                    {getInitials(profile.name)}
                  </div>
                </div>
              </div>
              <CardContent className="pt-20 pb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {profile.name}
                    </h2>
                    <p className="text-lg text-gray-600 mb-3">
                      {profile.position?.name || "No Position"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={cn(
                          "px-3 py-1 border",
                          getRoleColor(profile.role)
                        )}
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        {profile.role?.toUpperCase()}
                      </Badge>
                      <Badge
                        className={cn(
                          "px-3 py-1",
                          profile.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {profile.active ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {profile.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className=" border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Your personal details and contact info
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Full Name
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Email Address
                      </span>
                      <span className="block text-base font-semibold text-gray-900 break-all">
                        {profile.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Phone Number
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.phoneNumber || (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Place of Birth
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.placeOfBirth || (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Date of Birth
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.dateOfBirth ? (
                          formatDate(profile.dateOfBirth)
                        ) : (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Work Information
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Your role, position, and professional details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Role
                      </span>
                      <Badge
                        className={cn(
                          "mt-1 px-3 py-1 text-sm font-semibold border",
                          getRoleColor(profile.role)
                        )}
                      >
                        {profile.role?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Award className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Position
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.position?.name || (
                          <span className="text-gray-400 font-normal">
                            No position assigned
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Award className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Skills
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills?.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1"
                            >
                              {skill.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No skills added
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Account Status
                      </span>
                      <Badge
                        className={cn(
                          "mt-1 px-3 py-1 text-sm font-semibold",
                          profile.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {profile.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Joined Date
                      </span>
                      <span className="block text-base font-semibold text-gray-900">
                        {profile.createdAt ? (
                          formatDate(profile.createdAt)
                        ) : (
                          <span className="text-gray-400 font-normal">
                            Unknown
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
