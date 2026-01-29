import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store/authStore";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  superAdminOnly?: boolean;
}

// Simplified nav - no granular permissions, only superAdminOnly distinction
const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Loan Officers", icon: Users, href: "/admin/officers" },
  {
    label: "Admins",
    icon: UserCog,
    href: "/admin/admins",
    superAdminOnly: true,
  },
  // NOTE: "Applications" removed - Loan Officers handle applications, not admins
  { label: "Officer Workload", icon: BarChart3, href: "/admin/workload" },
  { label: "Loan Products", icon: Package, href: "/admin/products" },
  { label: "Audit Logs", icon: FileText, href: "/admin/audit-logs" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  onNavigate,
}: AdminSidebarProps) {
  const { user } = useAuthStore();
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  // Simplified filter: Super Admin sees everything, regular Admin sees all except superAdminOnly
  const visibleNavItems = navItems.filter((item) => {
    // Super admin sees everything
    if (user?.role === "admin" && "superAdmin" in user && user.superAdmin) {
      return true;
    }
    // Regular admin: hide superAdminOnly items
    return !item.superAdminOnly;
  });

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed ? (
          <span className="text-lg font-semibold text-sidebar-foreground">
            MSME Portal
          </span>
        ) : (
          <span className="text-lg font-bold text-sidebar-foreground mx-auto">
            M
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const linkContent = (
            <NavLink
              to={item.href}
              end={item.href === "/admin"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-foreground",
                  collapsed && "justify-center px-2",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>

        {/* Logout Button */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-center text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </div>
  );
}
