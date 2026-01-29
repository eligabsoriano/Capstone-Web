import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DisburseApplicationRequest,
  ReviewApplicationRequest,
} from "@/types/api";
import {
  disburseApplication,
  getOfficerApplicationDetail,
  getOfficerApplications,
  reviewApplication,
} from "../api/applicationsApi";

/**
 * Hook for fetching officer applications list
 */
export function useOfficerApplications(status: string = "pending") {
  return useQuery({
    queryKey: ["officer-applications", status],
    queryFn: () => getOfficerApplications(status),
    select: (response) =>
      response.status === "success"
        ? response.data
        : { applications: [], total: 0 },
  });
}

/**
 * Hook for fetching single application detail
 */
export function useOfficerApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: ["officer-application", applicationId],
    queryFn: () => getOfficerApplicationDetail(applicationId),
    enabled: !!applicationId,
    select: (response) =>
      response.status === "success" ? response.data : null,
  });
}

/**
 * Hook for reviewing (approve/reject) an application
 */
export function useReviewApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ReviewApplicationRequest;
    }) => reviewApplication(applicationId, data),
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ["officer-applications"] });
      queryClient.invalidateQueries({ queryKey: ["officer-application"] });
    },
  });
}

/**
 * Hook for disbursing an approved application
 */
export function useDisburseApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: DisburseApplicationRequest;
    }) => disburseApplication(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-applications"] });
      queryClient.invalidateQueries({ queryKey: ["officer-application"] });
    },
  });
}
