import apiClient from "@/shared/api/client";
import type {
  ApiResponse,
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationMarkReadResponse,
  NotificationUnreadCountResponse,
} from "@/types/api";

export interface NotificationsQueryParams {
  page?: number;
  page_size?: number;
  unread?: boolean;
  channel?: string;
}

export async function getNotifications(
  params?: NotificationsQueryParams,
): Promise<ApiResponse<NotificationListResponse>> {
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined),
      )
    : {};

  const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
    "/api/notifications/",
    { params: cleanParams },
  );

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<
  ApiResponse<NotificationUnreadCountResponse>
> {
  const response = await apiClient.get<
    ApiResponse<NotificationUnreadCountResponse>
  >("/api/notifications/unread-count/");

  return response.data;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<ApiResponse<NotificationMarkReadResponse>> {
  const response = await apiClient.post<
    ApiResponse<NotificationMarkReadResponse>
  >(`/api/notifications/${notificationId}/read/`);

  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<
  ApiResponse<NotificationMarkAllReadResponse>
> {
  const response = await apiClient.post<
    ApiResponse<NotificationMarkAllReadResponse>
  >("/api/notifications/mark-all-read/");

  return response.data;
}
