import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layouts/AppSidebar";

import AppNavbar from "@/components/layouts/AppNavbar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0">
          <AppNavbar />
          <main className="flex-1 overflow-y-auto bg-gray-50 px-7 py-3">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
