import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import logoIcon from "@/assets/img/LogoDevAlign.png";

export default function AppSidebar() {
  const { state } = useSidebar();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/menu/getMenu`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();

        setMenus(data?.data?.menuList || []);
      } catch (err) {
        console.error("❌ Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const toggleMenu = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
        <SidebarHeader className="border-b border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center justify-center h-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      {/* Header */}
      <SidebarHeader
        className={`border-b ${
          isCollapsed ? "py-7.5" : "py-6"
        } border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <img
              src={logoIcon}
              alt="DevAlign Logo"
              className={`relative transition-all duration-300 
                ${isCollapsed ? "h-8 w-8" : "h-10 w-10"} drop-shadow-md`}
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DevAlign
              </h1>
              <p className="text-xs text-gray-500">Team Management</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={isCollapsed ? "mt-5" : "px-3 py-4 "}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? "space-y-2" : "space-y-1"}>
              {menus.map((item) => {
                const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openMenu === item._id;
                const isActive = location.pathname.startsWith(item.path || "");
                const activeChildrenCount = hasChildren
                  ? item.children.filter((child) =>
                      location.pathname.startsWith(child.path || "")
                    ).length
                  : 0;

                // Collapsed sidebar with children - use Popover
                if (isCollapsed && hasChildren) {
                  return (
                    <SidebarMenuItem key={item._id}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={`relative w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
                              isActive || activeChildrenCount > 0
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200/50"
                                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600"
                            }`}
                            title={item.title}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="right"
                          align="start"
                          sideOffset={8}
                          className="w-56 p-2 bg-white border border-gray-200 shadow-2xl rounded-xl animate-in fade-in-0 zoom-in-95"
                        >
                          <div className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white rounded-md shadow-sm">
                                <Icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="font-semibold text-sm text-gray-900">
                                {item.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.children.map((child) => {
                              const ChildIcon =
                                LucideIcons[child.icon] || LucideIcons.Circle;
                              const isChildActive =
                                location.pathname.startsWith(child.path || "");
                              return (
                                <Link
                                  key={child._id}
                                  to={child.path || "#"}
                                  onClick={() => document.activeElement?.blur()}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] ${
                                    isChildActive
                                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                                  }`}
                                >
                                  <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="flex-1">{child.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </SidebarMenuItem>
                  );
                }

                // Collapsed sidebar without children - direct link
                if (isCollapsed && !hasChildren) {
                  return (
                    <SidebarMenuItem key={item._id}>
                      <Link
                        to={item.path || "#"}
                        className={`relative w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200/50"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600"
                        }`}
                        title={item.title}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </SidebarMenuItem>
                  );
                }

                // Expanded sidebar
                return (
                  <SidebarMenuItem key={item._id}>
                    <SidebarMenuButton
                      onClick={() =>
                        hasChildren ? toggleMenu(item._id) : null
                      }
                      asChild={!hasChildren}
                      className={`h-11 rounded-xl transition-all duration-200 ${
                        isActive || activeChildrenCount > 0
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                      }`}
                      tooltip={item.title}
                    >
                      {hasChildren ? (
                        <div
                          className="w-full flex items-center justify-between cursor-pointer select-none px-1.5"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && toggleMenu(item._id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            {!isCollapsed && (
                              <span className="font-medium">{item.title}</span>
                            )}
                          </div>
                          {!isCollapsed && (
                            <div className="flex items-center gap-2">
                              {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.path || "#"}
                          className="w-full flex items-center gap-3 px-4"
                        >
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && (
                            <span className="font-medium">{item.title}</span>
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>

                    {/* Submenu */}
                    {hasChildren && isOpen && !isCollapsed && (
                      <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                        {item.children.map((child) => {
                          const ChildIcon =
                            LucideIcons[child.icon] || LucideIcons.Circle;
                          const isChildActive = location.pathname.startsWith(
                            child.path || ""
                          );
                          return (
                            <Link
                              key={child._id}
                              to={child.path || "#"}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isChildActive
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span>{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      {/* {!isCollapsed && (
        <SidebarFooter className="border-t border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {name}
              </p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          </div>
        </SidebarFooter>
      )} */}
    </Sidebar>
  );
}
