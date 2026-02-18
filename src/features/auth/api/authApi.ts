import apiClient from "@/shared/api/client";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiResponse,
  LoanOfficerLoginRequest,
  LoanOfficerLoginResponse,
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
export async function logoutLoanOfficer(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/loan-officer/logout/",
    {},
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
export async function logoutAdmin(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/admin/logout/",
    {},
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
  role: "loan_officer" | "admin",
): Promise<ApiResponse<null>> {
  if (role === "admin") {
    return logoutAdmin();
  }
  return logoutLoanOfficer();
}

// ============================================================================
// REFRESH TOKEN
// ============================================================================

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh-token/
 */
export async function refreshAccessToken(): Promise<
  ApiResponse<{ access: string; refresh: string }>
> {
  const response = await apiClient.post<
    ApiResponse<{ access: string; refresh: string }>
  >("/api/auth/refresh-token/", {});
  return response.data;
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ============================================================================

/**
 * Verify 2FA code during login
 * POST /api/auth/2fa/verify/
 */
export async function verify2FA(data: {
  temp_token: string;
  code: string;
}): Promise<
  ApiResponse<{
    access: string;
    refresh: string;
    user:
      | import("@/types/api").LoanOfficerUser
      | import("@/types/api").AdminUser;
  }>
> {
  const response = await apiClient.post<
    ApiResponse<{
      access: string;
      refresh: string;
      user:
        | import("@/types/api").LoanOfficerUser
        | import("@/types/api").AdminUser;
    }>
  >("/api/auth/2fa/verify/", data);
  return response.data;
}

/**
 * Setup 2FA (get QR code)
 * POST /api/auth/2fa/setup/
 */
export async function setup2FA(): Promise<
  ApiResponse<{
    provisioning_uri: string;
    manual_entry_key: string;
    message: string;
  }>
> {
  const response = await apiClient.post<
    ApiResponse<{
      provisioning_uri: string;
      manual_entry_key: string;
      message: string;
    }>
  >("/api/auth/2fa/setup/");
  return response.data;
}

/**
 * Confirm 2FA setup
 * POST /api/auth/2fa/confirm/
 */
export async function confirm2FASetup(data: { code: string }): Promise<
  ApiResponse<{
    backup_codes: string[];
    message: string;
  }>
> {
  const response = await apiClient.post<
    ApiResponse<{
      backup_codes: string[];
      message: string;
    }>
  >("/api/auth/2fa/confirm/", data);
  return response.data;
}

/**
 * Get 2FA status
 * GET /api/auth/2fa/status/
 */
export async function get2FAStatus(): Promise<
  ApiResponse<{
    two_factor_enabled: boolean;
    backup_codes_remaining: number;
  }>
> {
  const response = await apiClient.get<
    ApiResponse<{
      two_factor_enabled: boolean;
      backup_codes_remaining: number;
    }>
  >("/api/auth/2fa/status/");
  return response.data;
}

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable/
 */
export async function disable2FA(data: {
  password: string;
}): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/2fa/disable/",
    data,
  );
  return response.data;
}

/**
 * Generate new backup codes
 * POST /api/auth/2fa/backup-codes/
 */
export async function generateBackupCodes(data: { password: string }): Promise<
  ApiResponse<{
    backup_codes: string[];
    message: string;
  }>
> {
  const response = await apiClient.post<
    ApiResponse<{
      backup_codes: string[];
      message: string;
    }>
  >("/api/auth/2fa/backup-codes/", data);
  return response.data;
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

/**
 * Change password for authenticated user (Customer or LoanOfficer)
 * POST /api/auth/change-password/
 */
export async function changePassword(data: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/change-password/",
    data,
  );
  return response.data;
}

/**
 * Initiate forgot password flow - sends OTP to email
 * POST /api/auth/forgot-password/
 */
export async function forgotPassword(data: {
  email: string;
}): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/forgot-password/",
    data,
  );
  return response.data;
}

/**
 * Verify the password reset OTP
 * POST /api/auth/verify-reset-otp/
 */
export async function verifyResetOTP(data: {
  email: string;
  otp: string;
}): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/verify-reset-otp/",
    data,
  );
  return response.data;
}

/**
 * Reset password using verified OTP
 * POST /api/auth/reset-password/
 */
export async function resetPassword(data: {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/reset-password/",
    data,
  );
  return response.data;
}
