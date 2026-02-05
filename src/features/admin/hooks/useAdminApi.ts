import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssignApplicationRequest,
  CreateOfficerRequest,
  UpdateOfficerRequest,
} from "@/types/api";
import {
  assignApplication,
  createOfficer,
  deactivateOfficer,
  getAdminDashboard,
  getAuditLogs,
  getOfficerDetail,
  getOfficersList,
  getOfficerWorkload,
  updateOfficer,
} from "../api/adminApi";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminQueryKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminQueryKeys.all, "dashboard"] as const,
  officers: () => [...adminQueryKeys.all, "officers"] as const,
  officersList: (filters?: { active?: boolean; department?: string }) =>
    [...adminQueryKeys.officers(), "list", filters] as const,
  officerDetail: (id: string) =>
    [...adminQueryKeys.officers(), "detail", id] as const,
  auditLogs: (filters?: {
    action?: string;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }) => [...adminQueryKeys.all, "audit-logs", filters] as const,
  workload: () => [...adminQueryKeys.all, "workload"] as const,
};

// ============================================================================
// DASHBOARD HOOK
// ============================================================================

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: async () => {
      const response = await getAdminDashboard();
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch dashboard");
      }
      return response.data!;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// OFFICERS HOOKS
// ============================================================================

export function useOfficersList(filters?: {
  active?: boolean;
  department?: string;
}) {
  return useQuery({
    queryKey: adminQueryKeys.officersList(filters),
    queryFn: async () => {
      const response = await getOfficersList(filters);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch officers");
      }
      return response.data!;
    },
  });
}

export function useOfficerDetail(officerId: string) {
  return useQuery({
    queryKey: adminQueryKeys.officerDetail(officerId),
    queryFn: async () => {
      const response = await getOfficerDetail(officerId);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch officer details");
      }
      return response.data!;
    },
    enabled: !!officerId,
  });
}

export function useCreateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfficerRequest) => createOfficer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officers() });
    },
  });
}

export function useUpdateOfficer(officerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOfficerRequest) => updateOfficer(officerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officers() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.officerDetail(officerId),
      });
    },
  });
}

export function useDeactivateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (officerId: string) => deactivateOfficer(officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officers() });
    },
  });
}

// ============================================================================
// AUDIT LOGS HOOK
// ============================================================================

export function useAuditLogs(filters?: {
  action?: string;
  limit?: number;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: adminQueryKeys.auditLogs(filters),
    queryFn: async () => {
      const response = await getAuditLogs(filters);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch audit logs");
      }
      return response.data!;
    },
  });
}

// ============================================================================
// WORKLOAD HOOK
// ============================================================================

export function useOfficerWorkload() {
  return useQuery({
    queryKey: adminQueryKeys.workload(),
    queryFn: async () => {
      const response = await getOfficerWorkload();
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch workload");
      }
      return response.data!;
    },
  });
}

// ============================================================================
// APPLICATION ASSIGNMENT HOOK
// ============================================================================

export function useAssignApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: AssignApplicationRequest;
    }) => assignApplication(applicationId, data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.workload() });
    },
  });
}
