import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, LogOut, KeyRound, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifCountStore } from "@/store/useNotifCountStore";

export default function AppNavbar() {
  const { logout, name, role } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotifCountStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "hr":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-gradient-to-bl from-blue-50 via-purple-50 to-pink-50 backdrop-blur-lg shadow-sm py-3.5">
      <div className="flex h-16 items-center justify-between  px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition-all duration-200 hover:scale-105 cursor-pointer" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            onClick={() => navigate("/announcement")}
            className="relative rounded-xl p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 group cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute -bottom-8 right-0 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Announcements
            </span>
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 transition-all duration-200 group outline-none cursor-pointer">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
                    {getInitials(name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {name || "User Name"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${getRoleBadgeColor(
                        role
                      )}`}
                    >
                      {role || "User"}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block group-hover:text-blue-600 transition-colors" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 p-2 bg-white border border-gray-200 shadow-xl rounded-xl"
            >
              {/* User Info Header */}
              <div className="px-3 py-3 mb-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-base font-bold shadow-md">
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {name || "User Name"}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${getRoleBadgeColor(role)}`}
                    >
                      {role || "User"}
                    </Badge>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <UserCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Profile</p>
                    <p className="text-xs text-gray-500">View your profile</p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/change-password"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <KeyRound className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-xs text-gray-500">
                      Update your password
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                    <p className="text-xs text-red-500">
                      Sign out of your account
                    </p>
                  </div>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
