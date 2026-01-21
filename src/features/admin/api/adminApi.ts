import apiClient from "@/shared/api/client";
import type {
    ApiResponse,
    LoanOfficerListItem,
    LoanOfficerDetail,
    CreateOfficerRequest,
    CreateOfficerResponse,
    UpdateOfficerRequest,
    AdminDashboardData,
    AuditLogsResponse,
    OfficerWorkload,
    AssignApplicationRequest,
    AssignApplicationResponse,
} from "@/types/api";

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

/**
 * Get admin dashboard analytics
 * GET /api/analytics/admin/
 */
export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
        "/api/analytics/admin/"
    );
    return response.data;
}

// ============================================================================
// LOAN OFFICER MANAGEMENT
// ============================================================================

/**
 * List all loan officers
 * GET /api/auth/admin/loan-officers/
 */
export async function getOfficersList(
    params?: { active?: boolean; department?: string }
): Promise<ApiResponse<{ loan_officers: LoanOfficerListItem[]; total: number }>> {
    const response = await apiClient.get<ApiResponse<{ loan_officers: LoanOfficerListItem[]; total: number }>>(
        "/api/auth/admin/loan-officers/",
        { params }
    );
    return response.data;
}

/**
 * Get loan officer details
 * GET /api/auth/admin/loan-officers/:id/
 */
export async function getOfficerDetail(
    officerId: string
): Promise<ApiResponse<LoanOfficerDetail>> {
    const response = await apiClient.get<ApiResponse<LoanOfficerDetail>>(
        `/api/auth/admin/loan-officers/${officerId}/`
    );
    return response.data;
}

/**
 * Create a new loan officer
 * POST /api/auth/admin/loan-officers/
 */
export async function createOfficer(
    data: CreateOfficerRequest
): Promise<ApiResponse<CreateOfficerResponse>> {
    const response = await apiClient.post<ApiResponse<CreateOfficerResponse>>(
        "/api/auth/admin/loan-officers/",
        data
    );
    return response.data;
}

/**
 * Update loan officer details
 * PUT /api/auth/admin/loan-officers/:id/
 */
export async function updateOfficer(
    officerId: string,
    data: UpdateOfficerRequest
): Promise<ApiResponse<LoanOfficerListItem>> {
    const response = await apiClient.put<ApiResponse<LoanOfficerListItem>>(
        `/api/auth/admin/loan-officers/${officerId}/`,
        data
    );
    return response.data;
}

/**
 * Deactivate loan officer (soft delete)
 * DELETE /api/auth/admin/loan-officers/:id/
 */
export async function deactivateOfficer(
    officerId: string
): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
        `/api/auth/admin/loan-officers/${officerId}/`
    );
    return response.data;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/**
 * Get audit logs
 * GET /api/analytics/audit-logs/
 */
export async function getAuditLogs(
    params?: { action?: string; limit?: number }
): Promise<ApiResponse<AuditLogsResponse>> {
    const response = await apiClient.get<ApiResponse<AuditLogsResponse>>(
        "/api/analytics/audit-logs/",
        { params }
    );
    return response.data;
}

// ============================================================================
// OFFICER WORKLOAD
// ============================================================================

/**
 * Get officer workload stats
 * GET /api/loans/admin/officers/workload/
 */
export async function getOfficerWorkload(): Promise<
    ApiResponse<{ officers: OfficerWorkload[]; total: number }>
> {
    const response = await apiClient.get<
        ApiResponse<{ officers: OfficerWorkload[]; total: number }>
    >("/api/loans/admin/officers/workload/");
    return response.data;
}

// ============================================================================
// APPLICATION ASSIGNMENT
// ============================================================================

/**
 * Assign application to officer
 * POST /api/loans/admin/applications/:id/assign/
 */
export async function assignApplication(
    applicationId: string,
    data: AssignApplicationRequest
): Promise<ApiResponse<AssignApplicationResponse>> {
    const response = await apiClient.post<ApiResponse<AssignApplicationResponse>>(
        `/api/loans/admin/applications/${applicationId}/assign/`,
        data
    );
    return response.data;
}
