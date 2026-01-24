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

export interface Setup2FAResponse {
  provisioning_uri: string;
  manual_entry_key: string;
  message: string;
}

export interface Confirm2FASetupRequest {
  code: string;
}

export interface Confirm2FASetupResponse {
  backup_codes: string[];
  message: string;
}

export interface Disable2FARequest {
  password: string;
}

export interface Get2FAStatusResponse {
  two_factor_enabled: boolean;
  backup_codes_remaining: number;
}

export interface BackupCodesRequest {
  password: string; // Password to verify identity
}

export interface BackupCodesResponse {
  backup_codes: string[];
  message: string;
}

// ============================================================================
// LOGOUT TYPES
// ============================================================================

export interface LogoutRequest {
  refresh_token: string;
}

// ============================================================================
// REFRESH TOKEN TYPES
// ============================================================================

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// Generic login response union type
export type LoginResponse = LoanOfficerLoginResponse | AdminLoginResponse;

// ============================================================================
// ADMIN - LOAN OFFICER MANAGEMENT TYPES
// ============================================================================

export interface LoanOfficerListItem {
  id: string;
  employee_id: string;
  email: string;
  full_name: string;
  department: string;
  active: boolean;
  created_at: string;
  two_factor_enabled: boolean;
}

export interface LoanOfficerDetail extends LoanOfficerListItem {
  first_name: string;
  last_name: string;
  phone: string;
  verified: boolean;
  must_change_password: boolean;
}

export interface CreateOfficerRequest {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
}

export interface CreateOfficerResponse {
  loan_officer: LoanOfficerListItem;
  temporary_password: string;
  message: string;
}

export interface UpdateOfficerRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  active?: boolean;
}

// ============================================================================
// ADMIN - DASHBOARD TYPES
// ============================================================================

export interface AdminDashboardData {
  users: {
    customers: number;
    loan_officers: number;
    admins: number;
    total: number;
  };
  loans: {
    total: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  documents: {
    total: number;
    pending: number;
    verified: number;
  };
  ai_usage: {
    sessions_last_7_days: number;
  };
  products: Array<{
    name: string;
    applications: number;
    approved: number;
    approval_rate: string;
  }>;
  recent_activity: Array<{
    action: string;
    user_type: string;
    description: string;
    timestamp: string;
  }>;
}

// ============================================================================
// ADMIN - AUDIT LOGS TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  user_id: string;
  user_type: string;
  action: string;
  description: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

// ============================================================================
// ADMIN - APPLICATIONS TYPES
// ============================================================================

export interface ApplicationListItem {
  id: string;
  customer_id: string;
  product_name: string;
  requested_amount: number;
  recommended_amount: number;
  term_months: number;
  status: string;
  eligibility_score: number;
  risk_category: string;
  assigned_officer: string | null;
  submitted_at: string;
}

export interface AssignApplicationRequest {
  officer_id: string;
}

export interface AssignApplicationResponse {
  application_id: string;
  assigned_officer: string;
  officer_name: string;
  status: string;
}

// ============================================================================
// ADMIN - OFFICER WORKLOAD TYPES
// ============================================================================

export interface OfficerWorkload {
  id: string;
  name: string;
  email: string;
  current_applications: number;
  completed_today: number;
}
