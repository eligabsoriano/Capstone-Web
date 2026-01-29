import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecordPaymentRequest } from "@/types/api";
import { recordPayment } from "../api/paymentsApi";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) => recordPayment(data),
    onSuccess: () => {
      // Invalidate any loan-related queries
      queryClient.invalidateQueries({ queryKey: ["officer", "applications"] });
    },
  });
}
