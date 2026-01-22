import apiClient from "@/shared/api/client";
import type {
  ApiResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyResetOTPRequest,
} from "@/types/api";

// ============================================================================
// PASSWORD MANAGEMENT API
// ============================================================================

/**
 * Change password for authenticated user
 * POST /api/auth/change-password/
 */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/change-password/",
    data,
  );
  return response.data;
}

/**
 * Request password reset (sends OTP to email)
 * POST /api/auth/forgot-password/
 */
export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/forgot-password/",
    data,
  );
  return response.data;
}

/**
 * Verify OTP for password reset
 * POST /api/auth/verify-reset-otp/
 */
export async function verifyResetOTP(
  data: VerifyResetOTPRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/verify-reset-otp/",
    data,
  );
  return response.data;
}

/**
 * Reset password with OTP
 * POST /api/auth/reset-password/
 */
export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    "/api/auth/reset-password/",
    data,
  );
  return response.data;
}
