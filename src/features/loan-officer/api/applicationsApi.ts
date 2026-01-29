import { apiClient } from "@/shared/api/client";
import type {
  ApiResponse,
  DisburseApplicationRequest,
  DisburseApplicationResponse,
  OfficerApplicationDetail,
  OfficerApplicationListItem,
  ReviewApplicationRequest,
  ReviewApplicationResponse,
} from "@/types/api";

/**
 * Get list of applications for loan officer
 * @param status - Filter by status: 'pending', 'mine', or specific status
 */
export async function getOfficerApplications(
  status: string = "pending",
): Promise<
  ApiResponse<{ applications: OfficerApplicationListItem[]; total: number }>
> {
  const response = await apiClient.get("/api/loans/officer/applications/", {
    params: { status },
  });
  return response.data;
}

/**
 * Get application detail by ID
 */
export async function getOfficerApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<OfficerApplicationDetail>> {
  const response = await apiClient.get(
    `/api/loans/officer/applications/${applicationId}/`,
  );
  return response.data;
}

/**
 * Review (approve or reject) an application
 */
export async function reviewApplication(
  applicationId: string,
  data: ReviewApplicationRequest,
): Promise<ApiResponse<ReviewApplicationResponse>> {
  const response = await apiClient.put(
    `/api/loans/officer/applications/${applicationId}/review/`,
    data,
  );
  return response.data;
}

/**
 * Disburse an approved loan
 */
export async function disburseApplication(
  applicationId: string,
  data: DisburseApplicationRequest,
): Promise<ApiResponse<DisburseApplicationResponse>> {
  const response = await apiClient.post(
    `/api/loans/officer/applications/${applicationId}/disburse/`,
    data,
  );
  return response.data;
}
