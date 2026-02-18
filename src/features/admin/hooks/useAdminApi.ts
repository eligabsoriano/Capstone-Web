import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminSearchParams,
  CreateAdminRequest,
  CreateOfficerRequest,
  OfficerSearchParams,
  UpdateAdminRequest,
  UpdateOfficerRequest,
  UpdatePermissionsRequest,
} from "@/types/api";
import {
  createAdmin,
  createOfficer,
  deactivateAdmin,
  deactivateOfficer,
  getAdminDashboard,
  getAdminDetail,
  getAdminsList,
  getAuditLogDetail,
  getAuditLogs,
  getAuditLogUsers,
  getOfficerDetail,
  getOfficersList,
  updateAdmin,
  updateAdminPermissions,
  updateOfficer,
} from "../api/adminApi";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminQueryKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminQueryKeys.all, "dashboard"] as const,
  officers: () => [...adminQueryKeys.all, "officers"] as const,
  officersList: (params?: OfficerSearchParams) =>
    [...adminQueryKeys.officers(), "list", params] as const,
  officerDetail: (id: string) =>
    [...adminQueryKeys.officers(), "detail", id] as const,
  // Admin management keys (Super Admin only)
  admins: () => [...adminQueryKeys.all, "admins"] as const,
  adminsList: (params?: AdminSearchParams) =>
    [...adminQueryKeys.admins(), "list", params] as const,
  adminDetail: (id: string) =>
    [...adminQueryKeys.admins(), "detail", id] as const,
  auditLogs: (filters?: {
    action?: string;
    action_group?: "login" | "create" | "update" | "delete";
    user_id?: string;
    user_type?: "customer" | "loan_officer" | "admin";
    page?: number;
    page_size?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) => [...adminQueryKeys.all, "audit-logs", filters] as const,
  auditLogUsers: (search?: string) =>
    [...adminQueryKeys.all, "audit-log-users", search] as const,
  auditLogDetail: (id: string) =>
    [...adminQueryKeys.all, "audit-log-detail", id] as const,
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

export function useOfficersList(params?: OfficerSearchParams) {
  return useQuery({
    queryKey: adminQueryKeys.officersList(params),
    queryFn: async () => {
      const response = await getOfficersList(params);
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
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
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
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}

export function useDeactivateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (officerId: string) => deactivateOfficer(officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officers() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}

// ============================================================================
// AUDIT LOGS HOOK
// ============================================================================

export function useAuditLogs(filters?: {
  action?: string;
  action_group?: "login" | "create" | "update" | "delete";
  user_id?: string;
  user_type?: "customer" | "loan_officer" | "admin";
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
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

export function useAuditLogUsers(search = "") {
  return useQuery({
    queryKey: adminQueryKeys.auditLogUsers(search),
    queryFn: async () => {
      const response = await getAuditLogUsers({
        search: search || undefined,
        limit: 300,
      });
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch audit log users");
      }
      return response.data!;
    },
  });
}

export function useAuditLogDetail(logId: string, enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.auditLogDetail(logId),
    queryFn: async () => {
      const response = await getAuditLogDetail(logId);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch audit log detail");
      }
      return response.data!;
    },
    enabled: !!logId && enabled,
  });
}

// ============================================================================
// ADMIN MANAGEMENT HOOKS (Super Admin Only)
// ============================================================================

export function useAdminsList(params?: AdminSearchParams) {
  return useQuery({
    queryKey: adminQueryKeys.adminsList(params),
    queryFn: async () => {
      const response = await getAdminsList(params);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch admins");
      }
      return response.data!;
    },
  });
}

export function useAdminDetail(adminId: string) {
  return useQuery({
    queryKey: adminQueryKeys.adminDetail(adminId),
    queryFn: async () => {
      const response = await getAdminDetail(adminId);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch admin details");
      }
      return response.data!;
    },
    enabled: !!adminId,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminRequest) => createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}

export function useUpdateAdmin(adminId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAdminRequest) => updateAdmin(adminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.adminDetail(adminId),
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}

export function useDeactivateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => deactivateAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}

export function useUpdateAdminPermissions(adminId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePermissionsRequest) =>
      updateAdminPermissions(adminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.adminDetail(adminId),
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auditLogs() });
    },
  });
}
