import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
  requiredPermission?: string;
}

// Nav items with permission-based visibility
// Matches ADMIN_PERMISSIONS from backend:
// 'create_loan_officer', 'manage_loan_officers', 'manage_users',
// 'view_analytics', 'view_logs', 'manage_system'
const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    label: "Loan Officers",
    icon: Users,
    href: "/admin/officers",
    requiredPermission: "manage_loan_officers",
  },
  {
    label: "Admins",
    icon: UserCog,
    href: "/admin/admins",
    superAdminOnly: true,
  },
  {
    label: "Applications",
    icon: ClipboardList,
    href: "/admin/applications",
  },
  {
    label: "Loan Products",
    icon: Package,
    href: "/admin/products",
    requiredPermission: "manage_system",
  },
  {
    label: "Audit Logs",
    icon: FileText,
    href: "/admin/audit-logs",
    requiredPermission: "view_logs",
  },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  onNavigate,
}: AdminSidebarProps) {
  const { user } = useAuthStore();
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  // Filter based on permissions
  const visibleNavItems = navItems.filter((item) => {
    if (user?.role !== "admin") return false;

    const adminUser = user as { superAdmin?: boolean; permissions?: string[] };

    // Super admin sees everything
    if (adminUser.superAdmin) {
      return true;
    }

    // Regular admin: hide superAdminOnly items
    if (item.superAdminOnly) {
      return false;
    }

    // Check permission-based access
    if (item.requiredPermission) {
      return adminUser.permissions?.includes(item.requiredPermission) ?? false;
    }

    // Items without requiredPermission are visible to all admins (Dashboard, Settings)
    return true;
  });

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border">
        {!collapsed ? (
          <span className="text-lg font-semibold text-sidebar-foreground">
            MSME Portal
          </span>
        ) : (
          <span className="text-lg font-bold text-sidebar-foreground">M</span>
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
                <TooltipTrigger asChild>
                  <div className="relative">{linkContent}</div>
                </TooltipTrigger>
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
