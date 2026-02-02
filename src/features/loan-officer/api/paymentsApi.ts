import apiClient from "@/shared/api/client";
import type {
  ApiResponse,
  RecordPaymentRequest,
  RecordPaymentResponse,
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
