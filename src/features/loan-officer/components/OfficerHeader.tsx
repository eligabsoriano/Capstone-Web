import { ClipboardList, LogOut, Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store/authStore";

interface OfficerHeaderProps {
    onMenuClick: () => void;
    queueCount?: number;
}

export function OfficerHeader({ onMenuClick, queueCount = 0 }: OfficerHeaderProps) {
    const { user } = useAuthStore();
    const { handleLogout, isLoading: isLoggingOut } = useLogout();
    const navigate = useNavigate();

    // Get user initials for avatar
    const getInitials = () => {
        if (!user) return "LO";
        if ("fullName" in user && user.fullName) {
            const names = user.fullName.split(" ");
            return names
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
        }
        if ("username" in user) {
            return user.username.slice(0, 2).toUpperCase();
        }
        return "LO";
    };

    const getDisplayName = () => {
        if (!user) return "Loan Officer";
        if ("fullName" in user && user.fullName) {
            return user.fullName;
        }
        if ("username" in user) {
            return user.username;
        }
        return "Loan Officer";
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-gray-600 hover:text-teal-700 hover:bg-teal-50"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>

                    {/* Page Title with Queue Status */}
                    <div className="hidden sm:flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-gray-900">
                            Loan Officer Portal
                        </h1>
                        {queueCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
                                <ClipboardList className="h-4 w-4 text-teal-600" />
                                <span className="text-sm font-medium text-teal-700">
                                    {queueCount} pending
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Mobile Queue Counter */}
                    {queueCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="sm:hidden flex items-center gap-1.5 text-teal-700 hover:bg-teal-50"
                            onClick={() => navigate("/officer/applications")}
                        >
                            <ClipboardList className="h-4 w-4" />
                            <span className="font-medium">{queueCount}</span>
                        </Button>
                    )}

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-teal-600 text-white">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {getDisplayName()}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || "officer@system.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/officer/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
