import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecordPaymentRequest } from "@/types/api";
import {
  type PaymentSearchParams,
  recordPayment,
  searchPayments,
} from "../api/paymentsApi";

/**
 * Hook for recording a payment
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) => recordPayment(data),
    onSuccess: () => {
      // Invalidate any loan-related queries
      queryClient.invalidateQueries({ queryKey: ["officer", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["officer-payments"] });
    },
  });
}

/**
 * Hook for searching payments with advanced filters
 */
export function usePaymentSearch(params: PaymentSearchParams = {}) {
  return useQuery({
    queryKey: ["officer-payments", params],
    queryFn: () => searchPayments(params),
    select: (response) =>
      response.status === "success"
        ? response.data
        : {
            payments: [],
            total: 0,
            page: 1,
            page_size: 20,
            total_pages: 0,
            summary: { total_amount: 0, count: 0 },
          },
  });
}
