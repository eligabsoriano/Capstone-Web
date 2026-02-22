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
  requires_2fa_setup?: boolean;
  temp_token?: string;
  provisioning_uri?: string;
  manual_entry_key?: string;
  qr_code_data_url?: string;
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
  requires_2fa_setup?: boolean;
  temp_token?: string;
  provisioning_uri?: string;
  manual_entry_key?: string;
  qr_code_data_url?: string;
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
  backup_codes?: string[];
}

export interface Setup2FAResponse {
  provisioning_uri: string;
  manual_entry_key: string;
  qr_code_data_url?: string;
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
  updated_at?: string;
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
  last_known_updated_at?: string;
}

// Search params for officers list
export interface OfficerSearchParams {
  search?: string;
  active?: boolean;
  department?: string;
  page?: number;
  page_size?: number;
  sort_by?: "created_at" | "full_name" | "email" | "employee_id" | "department";
  sort_order?: "asc" | "desc";
}

// Response type for officers list with pagination
export interface OfficersListResponse {
  loan_officers: LoanOfficerListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// ADMIN - ADMIN MANAGEMENT TYPES (Super Admin Only)
// ============================================================================

export interface AdminListItem {
  id: string;
  username: string;
  email: string;
  full_name: string;
  super_admin: boolean;
  permissions: string[];
  active: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AdminDetail extends AdminListItem {
  first_name: string;
  last_name: string;
  updated_at?: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  super_admin?: boolean;
  permissions?: string[];
}

export interface CreateAdminResponse {
  admin: AdminListItem;
  temporary_password: string;
  message: string;
}

export interface UpdateAdminRequest {
  first_name?: string;
  last_name?: string;
  active?: boolean;
  last_known_updated_at?: string;
}

export interface UpdatePermissionsRequest {
  super_admin?: boolean;
  permissions?: string[];
}

// Search params for admins list
export interface AdminSearchParams {
  search?: string;
  active?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: "created_at" | "full_name" | "email" | "username";
  sort_order?: "asc" | "desc";
}

// Response type for admins list with pagination
export interface AdminsListResponse {
  admins: AdminListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
    draft: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    disbursed: number;
    cancelled: number;
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
  user_email?: string;
  action: string;
  description: string;
  resource_type: string;
  resource_id: string | null;
  details?: Record<string, unknown>;
  ip_address: string;
  timestamp: string;
}

export interface AuditLogUserOption {
  user_id: string;
  user_type: string;
  user_email: string;
  label: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AuditLogUsersResponse {
  users: AuditLogUserOption[];
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

export interface ApplicationInternalNote {
  content: string;
  author_id: string | null;
  author_role: string | null;
  created_at: string | null;
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

export interface ReassignApplicationRequest {
  officer_id: string;
}

export interface ReassignApplicationResponse {
  application_id: string;
  assigned_officer: string;
  officer_name: string;
  status: string;
}

// ============================================================================
// ADMIN - OFFICER WORKLOAD TYPES
// ============================================================================

export interface OfficerWorkloadParams {
  search?: string;
  page?: number;
  page_size?: number;
  pending_search?: string;
  pending_page?: number;
  pending_page_size?: number;
  assigned_search?: string;
  assigned_page?: number;
  assigned_page_size?: number;
}

export interface OfficerWorkload {
  id: string;
  name: string;
  email: string;
  current_applications: number;
  completed_today: number;
  employee_id?: string;
  pending_count?: number;
  active?: boolean;
}

export interface OfficerWorkloadResponse {
  officers: OfficerWorkload[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  pending_applications: PendingApplication[];
  pending_count: number;
  pending_page?: number;
  pending_page_size?: number;
  pending_total_pages?: number;
  assigned_applications?: PendingApplication[];
  assigned_count?: number;
  assigned_page?: number;
  assigned_page_size?: number;
  assigned_total_pages?: number;
}

/**
 * Pending application summary for admin assignment view
 */
export interface PendingApplication {
  id: string;
  customer_id: string;
  requested_amount: number;
  term_months: number;
  status: string;
  eligibility_score: number | null;
  risk_category: string | null;
  assigned_officer: string | null;
  submitted_at: string | null;
  internal_notes_count?: number;
  latest_internal_note?: ApplicationInternalNote | null;
}

// ============================================================================
// ADMIN - LOAN PRODUCTS TYPES
// ============================================================================

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_term_months: number;
  max_term_months: number;
  required_documents: string[];
  min_business_months?: number;
  min_monthly_income?: number;
  business_types?: string[];
  target_description?: string;
  active: boolean;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  code: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_term_months: number;
  max_term_months: number;
  required_documents?: string[];
  min_business_months?: number;
  min_monthly_income?: number;
  business_types?: string[];
  target_description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  min_amount?: number;
  max_amount?: number;
  interest_rate?: number;
  min_term_months?: number;
  max_term_months?: number;
  required_documents?: string[];
  min_business_months?: number;
  min_monthly_income?: number;
  business_types?: string[];
  target_description?: string;
  active?: boolean;
}

// ============================================================================
// LOAN OFFICER - APPLICATIONS TYPES
// ============================================================================

/**
 * Application status values (from backend: loans/models/application.py)
 * Flow: draft → submitted → under_review → approved/rejected → disbursed
 */
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed"
  | "cancelled";

/**
 * Risk category values (from backend: loans/services/qualification.py)
 * - low: score 75-100
 * - medium: score 50-74
 * - high: score 0-49
 */
export type RiskCategory = "low" | "medium" | "high";

/**
 * AI Recommendation object structure returned by qualification service
 */
export interface AIRecommendation {
  eligible: boolean;
  eligibility_score: number;
  risk_category: RiskCategory;
  recommended_amount: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  missing_requirements: string[];
}

export interface OfficerApplicationListItem {
  id: string;
  customer_id: string;
  product_name: string;
  requested_amount: number;
  recommended_amount: number;
  term_months: number;
  status: ApplicationStatus;
  eligibility_score: number;
  risk_category: RiskCategory;
  submitted_at: string | null;
  internal_notes_count?: number;
  latest_internal_note?: ApplicationInternalNote | null;
}

export interface OfficerApplicationDetail {
  id: string;
  customer_id: string;
  product: {
    id: string | null;
    name: string;
    code: string | null;
    required_documents?: string[];
  };
  requested_amount: number;
  recommended_amount: number;
  approved_amount?: number;
  term_months: number;
  purpose: string;
  status: ApplicationStatus;
  eligibility_score: number;
  risk_category: RiskCategory;
  ai_recommendation: AIRecommendation | null;
  assigned_officer: string | null;
  officer_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  decision_date: string | null;
  disbursed_amount?: number | null;
  disbursement_method?: string | null;
  disbursement_reference?: string | null;
  disbursed_at?: string | null;
  internal_notes?: ApplicationInternalNote[];
  internal_notes_count?: number;
  latest_internal_note?: ApplicationInternalNote | null;
  missing_documents_requested?: string[];
  missing_documents_reason?: string | null;
  missing_documents_requested_at?: string | null;
  // Complete customer data
  customer?: {
    customer_id: string;
    email: string | null;
    personal_profile: {
      first_name: string | null;
      last_name: string | null;
      phone_number: string | null;
      civil_status: string | null;
      city_municipality: string | null;
      province: string | null;
      barangay: string | null;
      street_address: string | null;
      emergency_contact_name: string | null;
      emergency_contact_phone: string | null;
      profile_completed: boolean;
      completion_percentage: number;
    };
    business_profile: {
      business_name: string | null;
      business_type: string | null;
      business_address: string | null;
      years_in_operation: number | null;
      is_registered: boolean;
      income_range: string | null;
      estimated_monthly_income: number | null;
      number_of_employees: number | null;
      business_description: string | null;
    };
    alternative_data: {
      education_level: string | null;
      employment_status: string | null;
      housing_status: string | null;
      years_at_residence: number | null;
      has_bank_account: boolean;
      has_ewallet: boolean;
      ewallet_usage: string | null;
      has_existing_loans: boolean;
      utility_payment_history: string | null;
      risk_score: number | null;
      risk_category: string | null;
    };
  };
  // Customer documents
  documents?: Array<{
    id: string;
    document_type: string;
    filename: string;
    file_url: string | null;
    file_size: number | null;
    status: string;
    verified: boolean;
    verified_at: string | null;
    reupload_requested: boolean;
    reupload_reason: string | null;
    ai_analysis: {
      quality_score?: number;
      quality_issues?: string[];
    } | null;
    uploaded_at: string | null;
  }>;
}

export interface ReviewApplicationRequest {
  action: "approve" | "reject";
  approved_amount?: number;
  rejection_reason?: string;
  notes?: string;
}

export interface ReviewApplicationResponse {
  id: string;
  status: string;
  approved_amount: number | null;
}

export interface DisburseApplicationRequest {
  amount?: number;
  method: string;
  reference: string;
}

export interface DisburseApplicationResponse {
  id: string;
  status: string;
  disbursed_amount: number;
  disbursement_method: string;
  disbursement_reference: string;
  disbursed_at: string | null;
  schedule?: {
    monthly_payment: number;
    total_amount: number;
    term_months: number;
  };
}

export interface RequestMissingDocumentsRequest {
  missing_documents: string[];
  reason?: string;
}

export interface RequestMissingDocumentsResponse {
  id: string;
  status: string;
  missing_documents_requested: string[];
  missing_documents_reason: string;
  missing_documents_requested_at: string | null;
}

export interface AddApplicationInternalNoteRequest {
  note: string;
}

export interface AddApplicationInternalNoteResponse {
  id: string;
  status: string;
  internal_notes_count: number;
  latest_internal_note: ApplicationInternalNote | null;
}

// ============================================================================
// LOAN OFFICER - PAYMENTS TYPES
// ============================================================================

export interface RecordPaymentRequest {
  loan_id: string;
  installment_number: number;
  amount: number;
  payment_method: string;
  reference: string;
  notes?: string;
}

export interface RecordPaymentResponse {
  payment_id: string;
  loan_id: string;
  installment_number: number;
  amount: number;
  installment_status: string;
  remaining_balance: number;
  reference: string; // Auto-generated payment reference
}

// ============================================================================
// REPAYMENT SCHEDULE & PAYMENT HISTORY
// ============================================================================

export interface Installment {
  number: number;
  due_date: string | null;
  principal: number;
  interest: number;
  total_amount: number;
  status: "pending" | "paid" | "overdue" | "partial";
  paid_amount: number;
}

export interface RepaymentSchedule {
  loan_id: string;
  principal: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  total_amount: number;
  total_interest: number;
  paid_count: number;
  remaining_balance: number;
  next_payment: Installment | null;
  installments: Installment[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  payment_method: string;
  reference: string;
  installment_number: number;
  notes: string | null;
  recorded_at: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentRecord[];
  total_paid: number;
  count: number;
}

// ============================================================================
// LOAN OFFICER ANALYTICS/DASHBOARD TYPES
// ============================================================================

export interface OfficerDashboardData {
  my_reviews: {
    total_approved: number;
    total_rejected: number;
    approved_today: number;
    rejected_today: number;
  };
  queue: {
    pending_total: number;
    assigned_to_me: number;
  };
  performance: {
    total_reviewed: number;
    approval_rate: string;
  };
}

// ============================================================================
// NOTIFICATIONS TYPES
// ============================================================================

export interface NotificationItem {
  id: string;
  notification_type: string;
  subject: string;
  message: string;
  related_type: string | null;
  related_id: string | null;
  channel: string;
  status: string;
  is_read: boolean;
  created_at: string | null;
  sent_at: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unread_count: number;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface NotificationUnreadCountResponse {
  unread_count: number;
}

export interface NotificationMarkReadResponse {
  notification_id: string;
  status: "read";
}

export interface NotificationMarkAllReadResponse {
  marked_count: number;
}
