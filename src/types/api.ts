// Standard API response from Django backend
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ============================================================================
// LOAN OFFICER AUTH TYPES
// ============================================================================

export interface LoanOfficerLoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoanOfficerUser {
  id: string;
  email: string;
  full_name: string;
  department: string;
  employee_id: string;
  role: "loan_officer";
}

export interface LoanOfficerLoginResponse {
  access_token: string;
  refresh_token: string;
  user: LoanOfficerUser;
  must_change_password: boolean;
  requires_2fa?: boolean;
  temp_token?: string;
}

// ============================================================================
// ADMIN AUTH TYPES
// ============================================================================

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "admin";
  permissions: string[];
  super_admin: boolean;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  user: AdminUser;
  requires_2fa?: boolean;
  temp_token?: string;
}

// ============================================================================
// 2FA TYPES
// ============================================================================

export interface Verify2FARequest {
  temp_token: string;
  code: string;
}

export interface Verify2FAResponse {
  access_token: string;
  refresh_token: string;
  user: LoanOfficerUser | AdminUser;
}

// ============================================================================
// LOGOUT TYPES
// ============================================================================

export interface LogoutRequest {
  refresh_token: string;
}

// Generic login response union type
export type LoginResponse = LoanOfficerLoginResponse | AdminLoginResponse;
