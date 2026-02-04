import apiClient from "@/shared/api/client";
import type {
  ApiResponse,
  PaymentHistoryResponse,
  RecordPaymentRequest,
  RecordPaymentResponse,
  RepaymentSchedule,
} from "@/types/api";

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
