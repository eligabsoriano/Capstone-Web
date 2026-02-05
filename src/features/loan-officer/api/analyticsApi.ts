import apiClient from "@/shared/api/client";
import type { ApiResponse, OfficerDashboardData } from "@/types/api";

/**
 * Get officer dashboard analytics
 * GET /api/analytics/officer/
 */
export async function getOfficerDashboard(): Promise<
  ApiResponse<OfficerDashboardData>
> {
  const response = await apiClient.get<ApiResponse<OfficerDashboardData>>(
    "/api/analytics/officer/",
  );
  return response.data;
}
