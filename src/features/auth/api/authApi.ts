import apiClient from "@/shared/api/client";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiResponse,
  LoanOfficerLoginRequest,
  LoanOfficerLoginResponse,
  LogoutRequest,
} from "@/types/api";

// ============================================================================
// LOAN OFFICER AUTH API
// ============================================================================

/**
 * Login as a loan officer
 * POST /api/auth/loan-officer/login/
 */
export async function loginLoanOfficer(
  credentials: LoanOfficerLoginRequest,
): Promise<ApiResponse<LoanOfficerLoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoanOfficerLoginResponse>>(
    "/api/auth/loan-officer/login/",
    credentials,
  );
  return response.data;
}

/**
 * Logout as a loan officer
 * POST /api/auth/loan-officer/logout/
 */
export async function logoutLoanOfficer(
  refreshToken: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/loan-officer/logout/",
    { refresh_token: refreshToken } as LogoutRequest,
  );
  return response.data;
}

// ============================================================================
// ADMIN AUTH API
// ============================================================================

/**
 * Login as an admin
 * POST /api/auth/admin/login/
 */
export async function loginAdmin(
  credentials: AdminLoginRequest,
): Promise<ApiResponse<AdminLoginResponse>> {
  const response = await apiClient.post<ApiResponse<AdminLoginResponse>>(
    "/api/auth/admin/login/",
    credentials,
  );
  return response.data;
}

/**
 * Logout as an admin
 * POST /api/auth/admin/logout/
 */
export async function logoutAdmin(
  refreshToken: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/admin/logout/",
    { refresh_token: refreshToken } as LogoutRequest,
  );
  return response.data;
}

// ============================================================================
// GENERIC LOGOUT (detects role from stored user)
// ============================================================================

/**
 * Generic logout function that calls the appropriate endpoint based on user role
 */
export async function logout(
  refreshToken: string,
  role: "loan_officer" | "admin",
): Promise<ApiResponse<null>> {
  if (role === "admin") {
    return logoutAdmin(refreshToken);
  }
  return logoutLoanOfficer(refreshToken);
}
