import { apiClient } from "@/shared/api/client";
import type {
  AddApplicationInternalNoteRequest,
  AddApplicationInternalNoteResponse,
  ApiResponse,
  DisburseApplicationRequest,
  DisburseApplicationResponse,
  OfficerApplicationDetail,
  OfficerApplicationListItem,
  RequestMissingDocumentsRequest,
  RequestMissingDocumentsResponse,
  ReviewApplicationRequest,
  ReviewApplicationResponse,
} from "@/types/api";

// ============================================================================
// APPLICATION SEARCH TYPES
// ============================================================================

/**
 * Search/filter parameters for applications
 */
export interface ApplicationSearchParams {
  status?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  risk_category?: "low" | "medium" | "high";
  page?: number;
  page_size?: number;
  sort_by?: "submitted_at" | "requested_amount" | "eligibility_score";
  sort_order?: "asc" | "desc";
}

/**
 * Paginated response for applications
 */
export interface ApplicationSearchResponse {
  applications: OfficerApplicationListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Get list of applications for loan officer with advanced search/filter
 */
export async function getOfficerApplications(
  params: ApplicationSearchParams = { status: "pending" },
): Promise<ApiResponse<ApplicationSearchResponse>> {
  // Clean undefined params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );

  const response = await apiClient.get("/api/loans/officer/applications/", {
    params: cleanParams,
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
 * Request missing documents that were never uploaded
 */
export async function requestMissingDocuments(
  applicationId: string,
  data: RequestMissingDocumentsRequest,
): Promise<ApiResponse<RequestMissingDocumentsResponse>> {
  const response = await apiClient.post(
    `/api/loans/officer/applications/${applicationId}/request-missing-documents/`,
    data,
  );
  return response.data;
}

/**
 * Add standalone internal note to an application
 */
export async function addApplicationInternalNote(
  applicationId: string,
  data: AddApplicationInternalNoteRequest,
): Promise<ApiResponse<AddApplicationInternalNoteResponse>> {
  const response = await apiClient.post(
    `/api/loans/officer/applications/${applicationId}/notes/`,
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
 * @param search - Customer name, phone, customer ID, or loan/application ID
 */
export async function searchActiveLoans(
  search: string,
): Promise<ApiResponse<{ loans: ActiveLoan[]; total: number }>> {
  const response = await apiClient.get("/api/loans/officer/active-loans/", {
    params: { search },
  });
  return response.data;
}
