import apiClient from "@/shared/api/client";
import type {
  AdminDashboardData,
  AdminDetail,
  AdminListItem,
  ApiResponse,
  AssignApplicationRequest,
  AssignApplicationResponse,
  AuditLogsResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  CreateOfficerRequest,
  CreateOfficerResponse,
  CreateProductRequest,
  LoanOfficerDetail,
  LoanOfficerListItem,
  LoanProduct,
  OfficerWorkload,
  UpdateAdminRequest,
  UpdateOfficerRequest,
  UpdatePermissionsRequest,
  UpdateProductRequest,
} from "@/types/api";

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

/**
 * Get admin dashboard analytics
 * GET /api/analytics/admin/
 */
export async function getAdminDashboard(): Promise<
  ApiResponse<AdminDashboardData>
> {
  const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
    "/api/analytics/admin/",
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
export async function getOfficersList(params?: {
  active?: boolean;
  department?: string;
}): Promise<
  ApiResponse<{ loan_officers: LoanOfficerListItem[]; total: number }>
> {
  const response = await apiClient.get<
    ApiResponse<{ loan_officers: LoanOfficerListItem[]; total: number }>
  >("/api/auth/admin/loan-officers/", { params });
  return response.data;
}

/**
 * Get loan officer details
 * GET /api/auth/admin/loan-officers/:id/
 */
export async function getOfficerDetail(
  officerId: string,
): Promise<ApiResponse<LoanOfficerDetail>> {
  const response = await apiClient.get<ApiResponse<LoanOfficerDetail>>(
    `/api/auth/admin/loan-officers/${officerId}/`,
  );
  return response.data;
}

/**
 * Create a new loan officer
 * POST /api/auth/admin/loan-officers/
 */
export async function createOfficer(
  data: CreateOfficerRequest,
): Promise<ApiResponse<CreateOfficerResponse>> {
  const response = await apiClient.post<ApiResponse<CreateOfficerResponse>>(
    "/api/auth/admin/loan-officers/",
    data,
  );
  return response.data;
}

/**
 * Update loan officer details
 * PUT /api/auth/admin/loan-officers/:id/
 */
export async function updateOfficer(
  officerId: string,
  data: UpdateOfficerRequest,
): Promise<ApiResponse<LoanOfficerListItem>> {
  const response = await apiClient.put<ApiResponse<LoanOfficerListItem>>(
    `/api/auth/admin/loan-officers/${officerId}/`,
    data,
  );
  return response.data;
}

/**
 * Deactivate loan officer (soft delete)
 * DELETE /api/auth/admin/loan-officers/:id/
 */
export async function deactivateOfficer(
  officerId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/auth/admin/loan-officers/${officerId}/`,
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
export async function getAuditLogs(params?: {
  action?: string;
  limit?: number;
  date_from?: string;
  date_to?: string;
}): Promise<ApiResponse<AuditLogsResponse>> {
  const response = await apiClient.get<ApiResponse<AuditLogsResponse>>(
    "/api/analytics/audit-logs/",
    { params },
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
  data: AssignApplicationRequest,
): Promise<ApiResponse<AssignApplicationResponse>> {
  const response = await apiClient.post<ApiResponse<AssignApplicationResponse>>(
    `/api/loans/admin/applications/${applicationId}/assign/`,
    data,
  );
  return response.data;
}

// ============================================================================
// LOAN PRODUCTS MANAGEMENT
// ============================================================================

/**
 * List all loan products (including inactive)
 * GET /api/loans/admin/products/
 */
export async function getProducts(params?: {
  active?: boolean;
}): Promise<ApiResponse<{ products: LoanProduct[]; total: number }>> {
  const response = await apiClient.get<
    ApiResponse<{ products: LoanProduct[]; total: number }>
  >("/api/loans/admin/products/", { params });
  return response.data;
}

/**
 * Get loan product detail
 * GET /api/loans/admin/products/:id/
 */
export async function getProductDetail(
  productId: string,
): Promise<ApiResponse<LoanProduct>> {
  const response = await apiClient.get<ApiResponse<LoanProduct>>(
    `/api/loans/admin/products/${productId}/`,
  );
  return response.data;
}

/**
 * Create a new loan product
 * POST /api/loans/admin/products/
 */
export async function createProduct(
  data: CreateProductRequest,
): Promise<ApiResponse<{ id: string; code: string; name: string }>> {
  const response = await apiClient.post<
    ApiResponse<{ id: string; code: string; name: string }>
  >("/api/loans/admin/products/", data);
  return response.data;
}

/**
 * Update loan product
 * PUT /api/loans/admin/products/:id/
 */
export async function updateProduct(
  productId: string,
  data: UpdateProductRequest,
): Promise<ApiResponse<{ id: string }>> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(
    `/api/loans/admin/products/${productId}/`,
    data,
  );
  return response.data;
}

/**
 * Delete (deactivate) loan product
 * DELETE /api/loans/admin/products/:id/
 */
export async function deleteProduct(
  productId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/loans/admin/products/${productId}/`,
  );
  return response.data;
}

// ============================================================================
// ADMIN MANAGEMENT (Super Admin Only)
// ============================================================================

/**
 * List all admins
 * GET /api/auth/admin/admins/
 */
export async function getAdminsList(params?: {
  active?: boolean;
}): Promise<ApiResponse<{ admins: AdminListItem[]; total: number }>> {
  const response = await apiClient.get<
    ApiResponse<{ admins: AdminListItem[]; total: number }>
  >("/api/auth/admin/admins/", { params });
  return response.data;
}

/**
 * Get admin details
 * GET /api/auth/admin/admins/:id/
 */
export async function getAdminDetail(
  adminId: string,
): Promise<ApiResponse<AdminDetail>> {
  const response = await apiClient.get<ApiResponse<AdminDetail>>(
    `/api/auth/admin/admins/${adminId}/`,
  );
  return response.data;
}

/**
 * Create a new admin
 * POST /api/auth/admin/admins/
 */
export async function createAdmin(
  data: CreateAdminRequest,
): Promise<ApiResponse<CreateAdminResponse>> {
  const response = await apiClient.post<ApiResponse<CreateAdminResponse>>(
    "/api/auth/admin/admins/",
    data,
  );
  return response.data;
}

/**
 * Update admin details
 * PUT /api/auth/admin/admins/:id/
 */
export async function updateAdmin(
  adminId: string,
  data: UpdateAdminRequest,
): Promise<ApiResponse<{ id: string }>> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(
    `/api/auth/admin/admins/${adminId}/`,
    data,
  );
  return response.data;
}

/**
 * Deactivate admin (soft delete)
 * DELETE /api/auth/admin/admins/:id/
 */
export async function deactivateAdmin(
  adminId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/auth/admin/admins/${adminId}/`,
  );
  return response.data;
}

/**
 * Update admin permissions
 * PUT /api/auth/admin/admins/:id/permissions/
 */
export async function updateAdminPermissions(
  adminId: string,
  data: UpdatePermissionsRequest,
): Promise<ApiResponse<{ id: string }>> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(
    `/api/auth/admin/admins/${adminId}/permissions/`,
    data,
  );
  return response.data;
}
