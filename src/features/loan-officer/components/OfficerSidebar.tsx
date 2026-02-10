import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLogout } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

interface OfficerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  queueCount?: number;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

export function OfficerSidebar({
  collapsed,
  onToggle,
  onNavigate,
  queueCount = 0,
}: OfficerSidebarProps) {
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/officer" },
    {
      label: "Application Queue",
      icon: ClipboardList,
      href: "/officer/applications",
      badge: queueCount > 0 ? queueCount : undefined,
    },
    { label: "Documents", icon: FileText, href: "/officer/documents" },
    { label: "Payments", icon: CreditCard, href: "/officer/payments" },
    { label: "Settings", icon: Settings, href: "/officer/settings" },
  ];

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
        {navItems.map((item) => {
          const Icon = item.icon;
          const linkContent = (
            <NavLink
              to={item.href}
              end={item.href === "/officer"}
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
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">{linkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                  {item.badge !== undefined && ` (${item.badge})`}
                </TooltipContent>
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
