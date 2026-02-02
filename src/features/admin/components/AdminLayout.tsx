import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Breadcrumbs } from "@/components/common";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-default"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
            // Desktop
            "hidden lg:block",
            sidebarCollapsed ? "lg:w-16" : "lg:w-64",
            // Mobile
            mobileMenuOpen && "block w-64",
          )}
        >
          {/* Mobile Close Button */}
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </aside>

        {/* Main Content Area */}
        <div
          className={cn(
            "min-h-screen transition-all duration-300 ease-in-out",
            "lg:ml-64",
            sidebarCollapsed && "lg:ml-16",
          )}
        >
          {/* Header */}
          <AdminHeader onMenuClick={toggleMobileMenu} />

          {/* Page Content */}
          <main className="p-6">
            <Breadcrumbs className="mb-4" />
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
