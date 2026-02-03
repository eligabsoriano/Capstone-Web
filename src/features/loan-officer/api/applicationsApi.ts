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

// ============================================================================
// ACTIVE LOANS (for payment recording)
// ============================================================================

/**
 * Active loan with repayment schedule info
 */
export interface ActiveLoan {
  loan_id: string;
  schedule_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  product_name: string;
  disbursed_amount: number;
  monthly_payment: number;
  remaining_balance: number;
  paid_installments: number;
  total_installments: number;
  next_due_installment: number | null;
  next_due_date: string | null;
  next_due_amount: number | null;
}

/**
 * Search active (disbursed) loans for payment recording
 * @param search - Customer name, phone, or ID
 */
export async function searchActiveLoans(
  search: string,
): Promise<ApiResponse<{ loans: ActiveLoan[]; total: number }>> {
  const response = await apiClient.get("/api/loans/officer/active-loans/", {
    params: { search },
  });
  return response.data;
}
