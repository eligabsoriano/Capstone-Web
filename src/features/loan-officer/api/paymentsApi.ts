import apiClient from "@/shared/api/client";
import type {
  ApiResponse,
  PaymentHistoryResponse,
  RecordPaymentRequest,
  RecordPaymentResponse,
  RepaymentSchedule,
} from "@/types/api";

// ============================================================================
// PAYMENT SEARCH TYPES
// ============================================================================

/**
 * Search/filter parameters for payments
 */
export interface PaymentSearchParams {
  search?: string;
  loan_id?: string;
  customer_id?: string;
  disbursed_only?: boolean;
  payment_method?:
    | "cash"
    | "bank_transfer"
    | "gcash"
    | "maya"
    | "check"
    | "other";
  min_amount?: number;
  max_amount?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  page?: number;
  page_size?: number;
  sort_by?: "recorded_at" | "amount" | "installment_number";
  sort_order?: "asc" | "desc";
}

/**
 * Payment search result item
 */
export interface PaymentSearchItem {
  id: string;
  loan_id: string;
  customer_id: string;
  customer_name: string;
  product_name: string;
  installment_number: number;
  amount: number;
  payment_method: string;
  reference: string;
  notes: string;
  recorded_by: string;
  recorded_at: string | null;
}

/**
 * Paginated response for payments search
 */
export interface PaymentSearchResponse {
  payments: PaymentSearchItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: {
    total_amount: number;
    count: number;
  };
}

/**
 * Search payments with advanced filtering
 * GET /api/loans/officer/payments/search/
 */
export async function searchPayments(
  params: PaymentSearchParams = {},
): Promise<ApiResponse<PaymentSearchResponse>> {
  // Clean undefined params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );

  const response = await apiClient.get<ApiResponse<PaymentSearchResponse>>(
    "/api/loans/officer/payments/search/",
    { params: cleanParams },
  );
  return response.data;
}

/**
 * Record a payment for a loan
 * POST /api/loans/officer/payments/
 */
export async function recordPayment(
  data: RecordPaymentRequest,
): Promise<ApiResponse<RecordPaymentResponse>> {
  const response = await apiClient.post<ApiResponse<RecordPaymentResponse>>(
    "/api/loans/officer/payments/",
    data,
  );
  return response.data;
}

/**
 * Get repayment schedule for a loan (Officer endpoint)
 * GET /api/loans/officer/applications/{loanId}/schedule/
 */
export async function getRepaymentSchedule(
  loanId: string,
): Promise<ApiResponse<RepaymentSchedule>> {
  const response = await apiClient.get<ApiResponse<RepaymentSchedule>>(
    `/api/loans/officer/applications/${loanId}/schedule/`,
  );
  return response.data;
}

/**
 * Get payment history for a loan (Officer endpoint)
 * GET /api/loans/officer/applications/{loanId}/payments/
 */
export async function getPaymentHistory(
  loanId: string,
): Promise<ApiResponse<PaymentHistoryResponse>> {
  const response = await apiClient.get<ApiResponse<PaymentHistoryResponse>>(
    `/api/loans/officer/applications/${loanId}/payments/`,
  );
  return response.data;
}
