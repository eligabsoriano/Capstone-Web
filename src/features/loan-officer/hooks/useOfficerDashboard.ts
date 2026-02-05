import { useQuery } from "@tanstack/react-query";
import { getOfficerDashboard } from "../api/analyticsApi";

export const officerQueryKeys = {
  all: ["officer"] as const,
  dashboard: () => [...officerQueryKeys.all, "dashboard"] as const,
};

/**
 * Hook to fetch officer dashboard analytics
 * Uses GET /api/analytics/officer/
 */
export function useOfficerDashboard() {
  return useQuery({
    queryKey: officerQueryKeys.dashboard(),
    queryFn: async () => {
      const response = await getOfficerDashboard();
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch dashboard");
      }
      return response.data!;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
