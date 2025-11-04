import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifCountStore } from "@/store/useNotifCountStore";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

export default function AppNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotifCountStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <header className="flex justify-between sticky p-5 top-0 z-40 h-20 items-center gap-4 border-b bg-tersier shadow-sm">
      <SidebarTrigger className="text-gray-700 hover:text-sekunder cursor-pointer" />
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/team/reqapprove")}
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center ">
              <User className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              <a
                href="#profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a>
              <a
                href="#settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
              <hr className="my-1" />
              <div
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
