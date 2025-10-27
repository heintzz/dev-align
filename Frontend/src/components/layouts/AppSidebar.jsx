import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { ChevronDown, ChevronRight } from "lucide-react";
import logoIcon from "@/assets/img/LogoDevAlign.png";

export default function AppSidebar() {
  const { state } = useSidebar();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("http://localhost:3400/menu/getMenu", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        console.log("✅ API raw data:", data);

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
      <Sidebar collapsible="icon" className="shadow-lg">
        <SidebarHeader>
          <div className="flex items-center py-5 justify-center text-primer">
            Loading...
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="shadow-lg">
      <SidebarHeader>
        <Link to="#" className="flex items-center py-5 space-x-1.5">
          <img
            src={logoIcon}
            alt="DevAlign Logo"
            className={`transition-all duration-300 ${
              isCollapsed ? "h-9" : "h-10 w-10"
            }`}
          />
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-primer">DevAlign</h1>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.map((item) => {
                const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openMenu === item._id;

                return (
                  <SidebarMenuItem key={item._id}>
                    {/* Parent Menu Button */}
                    <SidebarMenuButton
                      onClick={() =>
                        hasChildren ? toggleMenu(item._id) : null
                      }
                      asChild={!hasChildren}
                      className="text-primer hover:bg-primer hover:text-white flex items-center"
                    >
                      {hasChildren ? (
                        <button className="w-full flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>
                          {!isCollapsed &&
                            (isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            ))}
                        </button>
                      ) : (
                        <Link to={item.path || "#"}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>

                    {/* Collapsible Children */}
                    {hasChildren && isOpen && !isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon =
                            LucideIcons[child.icon] || LucideIcons.Circle;
                          return (
                            <Link
                              key={child._id}
                              to={child.path || "#"}
                              className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-1"
                            >
                              <ChildIcon className="h-3.5 w-3.5 text-primer" />
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
    </Sidebar>
  );
}
