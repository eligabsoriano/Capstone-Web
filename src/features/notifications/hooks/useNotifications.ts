import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from "@/types/api";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationsQueryParams,
} from "../api/notificationsApi";

const POLL_INTERVAL_MS = 30000;

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsQueryKeys.all, "list"] as const,
  list: (params?: NotificationsQueryParams) =>
    [...notificationsQueryKeys.lists(), params] as const,
  unreadCount: () => [...notificationsQueryKeys.all, "unread-count"] as const,
};

interface UseNotificationsOptions {
  enabled?: boolean;
}

type NotificationListContext = {
  previousLists: Array<
    readonly [readonly unknown[], NotificationListResponse | undefined]
  >;
  previousUnreadCount?: NotificationUnreadCountResponse;
};

function applyReadStateToList(
  list: NotificationListResponse,
  notificationId: string,
): NotificationListResponse {
  let didChange = false;

  const notifications = list.notifications.map((notification) => {
    if (notification.id !== notificationId || notification.is_read) {
      return notification;
    }

    didChange = true;
    return {
      ...notification,
      is_read: true,
      status: "read",
    };
  });

  if (!didChange) {
    return list;
  }

  return {
    ...list,
    notifications,
    unread_count: Math.max(0, list.unread_count - 1),
  };
}

function applyAllReadStateToList(
  list: NotificationListResponse,
): NotificationListResponse {
  const notifications = list.notifications.map((notification) => {
    if (notification.is_read) {
      return notification;
    }
    return {
      ...notification,
      is_read: true,
      status: "read",
    };
  });

  return {
    ...list,
    notifications,
    unread_count: 0,
  };
}

export function useNotifications(
  params?: NotificationsQueryParams,
  options: UseNotificationsOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: notificationsQueryKeys.list(params),
    queryFn: async () => {
      const response = await getNotifications(params);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch notifications");
      }
      return response.data!;
    },
    enabled,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount(),
    queryFn: async () => {
      const response = await getUnreadNotificationCount();
      if (response.status === "error") {
        throw new Error(
          response.message || "Failed to fetch unread notification count",
        );
      }
      return response.data!;
    },
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onMutate: async (notificationId): Promise<NotificationListContext> => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationsQueryKeys.lists() }),
        queryClient.cancelQueries({
          queryKey: notificationsQueryKeys.unreadCount(),
        }),
      ]);

      const previousLists =
        queryClient.getQueriesData<NotificationListResponse>({
          queryKey: notificationsQueryKeys.lists(),
        });
      const previousUnreadCount =
        queryClient.getQueryData<NotificationUnreadCountResponse>(
          notificationsQueryKeys.unreadCount(),
        );

      for (const [key, data] of previousLists) {
        if (!data) continue;
        queryClient.setQueryData(
          key,
          applyReadStateToList(data, notificationId),
        );
      }

      if (previousUnreadCount) {
        queryClient.setQueryData<NotificationUnreadCountResponse>(
          notificationsQueryKeys.unreadCount(),
          {
            unread_count: Math.max(0, previousUnreadCount.unread_count - 1),
          },
        );
      }

      return { previousLists, previousUnreadCount };
    },
    onError: (_, __, context) => {
      if (!context) return;

      for (const [key, data] of context.previousLists) {
        queryClient.setQueryData(key, data);
      }

      if (context.previousUnreadCount) {
        queryClient.setQueryData(
          notificationsQueryKeys.unreadCount(),
          context.previousUnreadCount,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.unreadCount(),
        }),
      ]);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onMutate: async (): Promise<NotificationListContext> => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationsQueryKeys.lists() }),
        queryClient.cancelQueries({
          queryKey: notificationsQueryKeys.unreadCount(),
        }),
      ]);

      const previousLists =
        queryClient.getQueriesData<NotificationListResponse>({
          queryKey: notificationsQueryKeys.lists(),
        });
      const previousUnreadCount =
        queryClient.getQueryData<NotificationUnreadCountResponse>(
          notificationsQueryKeys.unreadCount(),
        );

      for (const [key, data] of previousLists) {
        if (!data) continue;
        queryClient.setQueryData(key, applyAllReadStateToList(data));
      }

      if (previousUnreadCount) {
        queryClient.setQueryData<NotificationUnreadCountResponse>(
          notificationsQueryKeys.unreadCount(),
          { unread_count: 0 },
        );
      }

      return { previousLists, previousUnreadCount };
    },
    onError: (_, __, context) => {
      if (!context) return;

      for (const [key, data] of context.previousLists) {
        queryClient.setQueryData(key, data);
      }

      if (context.previousUnreadCount) {
        queryClient.setQueryData(
          notificationsQueryKeys.unreadCount(),
          context.previousUnreadCount,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.unreadCount(),
        }),
      ]);
    },
  });
}

export function hasNotificationLink(notification: NotificationItem): boolean {
  return !!notification.related_type && !!notification.related_id;
}
