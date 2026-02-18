import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/authStore";
import { parseError } from "@/lib/errors";
import type { NotificationItem } from "@/types/api";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useNotifications";

function formatNotificationTime(isoDate: string | null): string {
  if (!isoDate) return "Just now";

  const createdAt = new Date(isoDate);
  if (Number.isNaN(createdAt.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return createdAt.toLocaleDateString();
}

function resolveNotificationLink(
  notification: NotificationItem,
  role: "admin" | "loan_officer" | null,
): string | null {
  if (!role) return null;

  if (role === "loan_officer") {
    if (
      notification.notification_type === "new_application" &&
      notification.related_id
    ) {
      return `/officer/applications/${notification.related_id}`;
    }

    if (notification.related_type === "document") {
      return "/officer/documents";
    }

    if (notification.related_type === "loan") {
      return notification.related_id
        ? `/officer/applications/${notification.related_id}`
        : "/officer/applications";
    }
  }

  if (role === "admin") {
    if (notification.related_type === "loan") {
      return "/admin/applications";
    }

    if (notification.related_type === "document") {
      return "/admin/applications";
    }
  }

  return null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useNotifications({ page: 1, page_size: 10 }, { enabled: open });
  const { data: unreadData } = useUnreadNotificationCount();

  const markReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.notifications ?? [];
  const unreadCount =
    unreadData?.unread_count ?? notificationsData?.unread_count ?? 0;

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.is_read) {
        await markReadMutation.mutateAsync(notification.id);
      }

      const href = resolveNotificationLink(notification, user?.role ?? null);
      if (href) {
        navigate(href);
        setOpen(false);
      }
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markAllMutation.isPending) {
      return;
    }

    try {
      await markAllMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full px-1.5 text-[10px] leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[360px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllMutation.isPending}
          >
            {markAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all as read
          </Button>
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const href = resolveNotificationLink(
                  notification,
                  user?.role ?? null,
                );

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left px-3 py-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {notification.subject || "Notification"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message || "No message"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 pt-0.5">
                        {!notification.is_read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                        {href && (
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
          Auto-refreshes every 30 seconds
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
