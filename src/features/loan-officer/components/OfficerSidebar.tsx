import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Settings,
    Wallet,
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
        { label: "Disbursements", icon: Wallet, href: "/officer/disbursements" },
        { label: "Payments", icon: CreditCard, href: "/officer/payments" },
    ];

    const handleNavClick = () => {
        if (onNavigate) {
            onNavigate();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-4 border-b border-gray-200">
                {!collapsed ? (
                    <span className="text-lg font-semibold text-teal-700">
                        🏦 Loan Portal
                    </span>
                ) : (
                    <span className="text-lg font-bold text-teal-700 mx-auto">🏦</span>
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    "text-gray-600 hover:text-teal-700 hover:bg-teal-50",
                                    isActive && "bg-teal-50 text-teal-700 border border-teal-200",
                                    collapsed && "justify-center px-2",
                                )
                            }
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && (
                                <span className="flex-1">{item.label}</span>
                            )}
                            {!collapsed && item.badge !== undefined && (
                                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-teal-600 text-white">
                                    {item.badge}
                                </span>
                            )}
                            {collapsed && item.badge !== undefined && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-teal-600 text-white">
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
            <div className="border-t border-gray-200 p-2 space-y-1">
                {/* Settings */}
                {collapsed ? (
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <NavLink
                                to="/officer/settings"
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        "text-gray-600 hover:text-teal-700 hover:bg-teal-50",
                                        isActive && "bg-teal-50 text-teal-700 border border-teal-200",
                                    )
                                }
                            >
                                <Settings className="h-5 w-5" />
                            </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>
                ) : (
                    <NavLink
                        to="/officer/settings"
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                "text-gray-600 hover:text-teal-700 hover:bg-teal-50",
                                isActive && "bg-teal-50 text-teal-700 border border-teal-200",
                            )
                        }
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </NavLink>
                )}

                {/* Collapse Toggle (Desktop only) */}
                <div className="hidden lg:block">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className={cn(
                            "w-full justify-start text-gray-600 hover:text-teal-700 hover:bg-teal-50",
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
                                className="w-full justify-center text-gray-600 hover:text-red-600 hover:bg-red-50"
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
                        className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        <span>Logout</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
