# System Analysis & Manual Testing Checklist

**Document Version:** 1.0  
**Last Updated:** 2025-01-29  
**Application:** Loan Management System (Web Portal)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Feature Hierarchy](#feature-hierarchy)
3. [Manual Testing Checklist](#manual-testing-checklist)
   - [Module 1: Authentication](#module-1-authentication)
   - [Module 2: Dashboard & Layout](#module-2-dashboard--layout)
   - [Module 3: User Management](#module-3-user-management)
   - [Module 4: Loan Products](#module-4-loan-products)
   - [Module 5: Loan Applications](#module-5-loan-applications)
   - [Module 6: Document Management](#module-6-document-management)
   - [Module 7: Payment Management](#module-7-payment-management)
   - [Module 8: Analytics & Reporting](#module-8-analytics--reporting)
   - [Module 9: AI Assistant](#module-9-ai-assistant)
   - [Module 10: Profile Management](#module-10-profile-management)
   - [Module 11: Notifications](#module-11-notifications)
4. [Edge Cases & Error Handling](#edge-cases--error-handling)
5. [Test Environment Setup](#test-environment-setup)

---

## System Overview

### Technology Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, TanStack Query, Zustand, React Router 7, shadcn/ui |
| **Backend** | Django REST Framework, Python 3.12 |
| **Database** | MongoDB (via Djongo/PyMongo) |
| **Authentication** | JWT (Access + Refresh Tokens), 2FA (TOTP) |
| **Real-time** | Socket.io (notifications) |

### User Roles
| Role | Access Level | Platform |
|------|--------------|----------|
| **Customer** | Apply for loans, upload documents, view status | Mobile App Only |
| **Loan Officer** | Review applications, verify documents, record payments | Web Portal |
| **Admin** | Manage officers, loan products, view analytics, audit logs | Web Portal |
| **Super Admin** | All Admin permissions + manage other admins | Web Portal |

### API Base URL Structure
```
/api/auth/          → Authentication & Account Management
/api/profile/       → Customer & Business Profiles
/api/documents/     → Document Upload & Verification
/api/ai/            → AI Assistant & Chatbot
/api/loans/         → Loan Products & Applications
/api/analytics/     → Dashboards & Audit Logs
```

---

## Feature Hierarchy

### 1. Authentication
```
├── 1.1 Customer Authentication
│   ├── 1.1.1 Login (Email/Password)
│   ├── 1.1.2 Logout
│   ├── 1.1.3 Token Refresh
│   └── 1.1.4 Session Management
│
├── 1.2 Loan Officer Authentication
│   ├── 1.2.1 Login (Email/Password)
│   ├── 1.2.2 Logout
│   ├── 1.2.3 Token Refresh
│   └── 1.2.4 Session Management
│
├── 1.3 Admin Authentication
│   ├── 1.3.1 Login (Email/Password)
│   ├── 1.3.2 Logout
│   ├── 1.3.3 Token Refresh
│   └── 1.3.4 Session Management
│
├── 1.4 Two-Factor Authentication (2FA)
│   ├── 1.4.1 Enable 2FA (Generate QR Code)
│   ├── 1.4.2 Verify 2FA Setup
│   ├── 1.4.3 Disable 2FA
│   ├── 1.4.4 Verify 2FA on Login
│   ├── 1.4.5 Generate Backup Codes
│   └── 1.4.6 Verify with Backup Code
│
└── 1.5 Password Management
    ├── 1.5.1 Change Password (Authenticated)
    ├── 1.5.2 Request Password Reset
    ├── 1.5.3 Confirm Password Reset
    └── 1.5.4 Password Validation Rules
```

### 2. Dashboard & Layout
```
├── 2.1 Admin Dashboard
│   ├── 2.1.1 Statistics Cards (Users, Loans, Documents)
│   ├── 2.1.2 Recent Activity Feed
│   ├── 2.1.3 Charts & Visualizations
│   └── 2.1.4 Quick Action Buttons
│
├── 2.2 Officer Dashboard
│   ├── 2.2.1 Assigned Applications Count
│   ├── 2.2.2 Pending Reviews Count
│   ├── 2.2.3 Today's Tasks
│   └── 2.2.4 Recent Activity
│
├── 2.3 Navigation
│   ├── 2.3.1 Sidebar Navigation
│   ├── 2.3.2 Breadcrumbs
│   └── 2.3.3 Mobile Responsive Menu
│
└── 2.4 UI Features
    ├── 2.4.1 Dark/Light Theme Toggle
    ├── 2.4.2 Sidebar Collapse/Expand
    └── 2.4.3 Profile Dropdown Menu
```

### 3. User Management
```
├── 3.1 Loan Officer Management (Admin)
│   ├── 3.1.1 List Officers (with pagination)
│   ├── 3.1.2 Search Officers (by name/email)
│   ├── 3.1.3 Filter Officers (All/Active/Inactive)
│   ├── 3.1.4 Sort Officers (name/email/date)
│   ├── 3.1.5 Create Officer
│   ├── 3.1.6 Edit Officer
│   ├── 3.1.7 Deactivate Officer
│   └── 3.1.8 Activate Officer
│
├── 3.2 Admin Management (Super Admin)
│   ├── 3.2.1 List Admins (with pagination)
│   ├── 3.2.2 Search Admins
│   ├── 3.2.3 Filter Admins (All/Active/Inactive)
│   ├── 3.2.4 Create Admin
│   ├── 3.2.5 Edit Admin
│   ├── 3.2.6 Deactivate Admin
│   └── 3.2.7 Activate Admin
│
└── 3.3 Officer Workload Management
    ├── 3.3.1 View Workload Distribution
    ├── 3.3.2 Application Assignment
    └── 3.3.3 Reassign Applications
```

### 4. Loan Products
```
├── 4.1 Product CRUD
│   ├── 4.1.1 List Products
│   ├── 4.1.2 Create Product
│   ├── 4.1.3 Edit Product
│   ├── 4.1.4 Deactivate Product
│   └── 4.1.5 Activate Product
│
└── 4.2 Product Configuration
    ├── 4.2.1 Interest Rate Settings
    ├── 4.2.2 Term Length Options
    ├── 4.2.3 Minimum/Maximum Amounts
    └── 4.2.4 Eligibility Requirements
```

### 5. Loan Applications
```
├── 5.1 Customer Applications (Mobile)
│   ├── 5.1.1 Pre-Qualification Check
│   ├── 5.1.2 Submit Application
│   ├── 5.1.3 View Application Status
│   └── 5.1.4 Application History
│
├── 5.2 Admin Application Management
│   ├── 5.2.1 List All Applications
│   ├── 5.2.2 View Application Details
│   ├── 5.2.3 Assign to Officer
│   └── 5.2.4 Override Status (if needed)
│
├── 5.3 Officer Application Review
│   ├── 5.3.1 View Assigned Applications
│   ├── 5.3.2 Review Application Details
│   ├── 5.3.3 Approve Application
│   ├── 5.3.4 Reject Application
│   ├── 5.3.5 Request Additional Documents
│   └── 5.3.6 Add Review Notes
│
└── 5.4 Disbursement
    ├── 5.4.1 View Approved Applications
    ├── 5.4.2 Process Disbursement
    ├── 5.4.3 Record Disbursement Details
    └── 5.4.4 Generate Repayment Schedule
```

### 6. Document Management
```
├── 6.1 Document Upload (Customer/Mobile)
│   ├── 6.1.1 Upload ID Documents
│   ├── 6.1.2 Upload Business Proof
│   ├── 6.1.3 Upload Income Proof
│   └── 6.1.4 Upload Other Documents
│
├── 6.2 Document Listing
│   ├── 6.2.1 View All Documents
│   ├── 6.2.2 Filter by Type
│   ├── 6.2.3 Filter by Status
│   └── 6.2.4 View Document Preview
│
├── 6.3 Document Verification (Officer)
│   ├── 6.3.1 View Pending Documents
│   ├── 6.3.2 Verify Document (Accept)
│   ├── 6.3.3 Reject Document
│   └── 6.3.4 Request Re-upload
│
└── 6.4 ML Document Analysis
    ├── 6.4.1 Auto-Classification
    ├── 6.4.2 Quality Assessment
    └── 6.4.3 Fraud Detection Flags
```

### 7. Payment Management
```
├── 7.1 Payment Recording (Officer)
│   ├── 7.1.1 Search Active Loans
│   ├── 7.1.2 View Loan Details
│   ├── 7.1.3 Record Payment
│   ├── 7.1.4 Select Payment Method
│   └── 7.1.5 Enter Reference Number
│
├── 7.2 Repayment Schedule
│   ├── 7.2.1 View Schedule by Loan
│   ├── 7.2.2 Installment Breakdown
│   ├── 7.2.3 Overdue Indicators
│   └── 7.2.4 Remaining Balance
│
└── 7.3 Payment History
    ├── 7.3.1 View All Payments
    ├── 7.3.2 Filter by Date Range
    ├── 7.3.3 Filter by Status
    └── 7.3.4 Export Payment Records
```

### 8. Analytics & Reporting
```
├── 8.1 Admin Dashboard Analytics
│   ├── 8.1.1 Total Users Count
│   ├── 8.1.2 Active Loans Count
│   ├── 8.1.3 Pending Applications
│   ├── 8.1.4 Document Statistics
│   ├── 8.1.5 Loan Status Bar Chart
│   └── 8.1.6 Products Pie Chart
│
├── 8.2 Officer Dashboard Analytics
│   ├── 8.2.1 Assigned Count
│   ├── 8.2.2 Completed Reviews
│   ├── 8.2.3 Pending Tasks
│   └── 8.2.4 Performance Metrics
│
└── 8.3 Audit Logs
    ├── 8.3.1 View All Logs
    ├── 8.3.2 Filter by Action Type
    ├── 8.3.3 Filter by User
    ├── 8.3.4 Filter by Date Range
    ├── 8.3.5 Search Logs
    └── 8.3.6 Export Logs (CSV/Excel)
```

### 9. AI Assistant
```
├── 9.1 Chatbot
│   ├── 9.1.1 Send Message
│   ├── 9.1.2 Receive AI Response
│   ├── 9.1.3 View Chat History
│   └── 9.1.4 Clear Conversation
│
├── 9.2 Smart Suggestions
│   ├── 9.2.1 Pre-Qualification Suggestions
│   ├── 9.2.2 Document Recommendations
│   └── 9.2.3 Next Step Guidance
│
└── 9.3 Educational Content
    ├── 9.3.1 Financial Tips
    ├── 9.3.2 FAQ Responses
    └── 9.3.3 Loan Product Explanations
```

### 10. Profile Management
```
├── 10.1 Customer Profile
│   ├── 10.1.1 View Profile
│   ├── 10.1.2 Update Personal Info
│   └── 10.1.3 Contact Information
│
├── 10.2 Business Profile
│   ├── 10.2.1 Business Details
│   ├── 10.2.2 Revenue Information
│   └── 10.2.3 Business Documents
│
└── 10.3 Alternative Data
    ├── 10.3.1 Social Media Links
    ├── 10.3.2 Reference Contacts
    └── 10.3.3 Additional Verification
```

### 11. Notifications
```
├── 11.1 In-App Notifications
│   ├── 11.1.1 View Notifications List
│   ├── 11.1.2 Mark as Read
│   ├── 11.1.3 Mark All as Read
│   └── 11.1.4 Real-time Updates
│
└── 11.2 Notification Types
    ├── 11.2.1 Application Status Updates
    ├── 11.2.2 Document Verification Alerts
    ├── 11.2.3 Payment Reminders
    └── 11.2.4 System Announcements
```

---

## Manual Testing Checklist

### Module 1: Authentication

#### 1.1 Login/Logout

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AUTH-001 | Admin Login - Valid | 1. Navigate to `/login` <br> 2. Select "Admin" role <br> 3. Enter valid credentials <br> 4. Click Login | Redirects to `/admin` dashboard | ✔️ |
| AUTH-002 | Admin Login - Invalid Password | 1. Navigate to `/login` <br> 2. Enter valid email, wrong password <br> 3. Click Login | Shows "Invalid credentials" error | ✔️ | 
| AUTH-003 | Admin Login - Nonexistent Email | 1. Navigate to `/login` <br> 2. Enter non-registered email <br> 3. Click Login | Shows "Invalid credentials" error | ✔️ | 
| AUTH-004 | Admin Login - Empty Fields | 1. Navigate to `/login` <br> 2. Click Login without entering data | Shows validation errors for required fields | ✔️ |
| AUTH-005 | Officer Login - Valid | 1. Navigate to `/login` <br> 2. Select "Loan Officer" role <br> 3. Enter valid credentials | Redirects to `/officer` dashboard | ✔️ |
| AUTH-006 | Officer Login - Deactivated Account | 1. Login with deactivated officer account | Shows "Account deactivated" error | ✔️ |
| AUTH-007 | Admin Logout | 1. Login as Admin <br> 2. Click profile dropdown <br> 3. Click Logout | Redirects to `/login`, clears session | ✔️ |
| AUTH-008 | Officer Logout | 1. Login as Officer <br> 2. Click profile dropdown <br> 3. Click Logout | Redirects to `/login`, clears session | ✔️ |
| AUTH-009 | Token Refresh | 1. Login <br> 2. Wait for access token to near expiry <br> 3. Make API request | Token auto-refreshes, request succeeds | ✔️ |
| AUTH-010 | Session Expiry | 1. Login <br> 2. Wait for refresh token to expire <br> 3. Make API request | Redirects to login page | ✔️ |

#### 1.2 Two-Factor Authentication (2FA)

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| 2FA-001 | Enable 2FA | 1. Go to Settings <br> 2. Click "Enable 2FA" <br> 3. Scan QR code with authenticator app | QR code displayed, setup instructions shown | ✔️ |
| 2FA-002 | Verify 2FA Setup | 1. Enable 2FA <br> 2. Enter 6-digit code from app <br> 3. Submit | 2FA enabled, backup codes displayed | ☐ |
| 2FA-003 | 2FA Setup - Wrong Code | 1. Enable 2FA <br> 2. Enter wrong 6-digit code | Shows "Invalid code" error | ✔️ |
| 2FA-004 | Login with 2FA | 1. Login with email/password (2FA enabled) <br> 2. Enter 2FA code | Successfully logged in | ✔️ |
| 2FA-005 | Login with 2FA - Wrong Code | 1. Login with email/password <br> 2. Enter wrong 2FA code | Shows "Invalid code" error | ✔️ |
| 2FA-006 | Login with Backup Code | 1. Login with email/password <br> 2. Click "Use backup code" <br> 3. Enter backup code | Successfully logged in, backup code consumed | ✔️ |
| 2FA-007 | Disable 2FA | 1. Go to Settings <br> 2. Click "Disable 2FA" <br> 3. Confirm action | 2FA disabled, login no longer requires code | ✔️ |
| 2FA-008 | Regenerate Backup Codes | 1. Go to Settings <br> 2. Click "Generate new backup codes" | Old codes invalidated, new codes shown | ✔️ |

#### 1.3 Password Management

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PWD-001 | Change Password - Valid | 1. Go to Settings <br> 2. Enter current password <br> 3. Enter new password (meets requirements) <br> 4. Confirm new password | Password changed, success message | ✔️ |
| PWD-002 | Change Password - Wrong Current | 1. Go to Settings <br> 2. Enter wrong current password <br> 3. Enter new password | Shows "Current password incorrect" error | ✔️ |
| PWD-003 | Change Password - Mismatch | 1. Go to Settings <br> 2. Enter different values for new and confirm | Shows "Passwords don't match" error | ✔️ |
| PWD-004 | Change Password - Weak Password | 1. Go to Settings <br> 2. Enter password without special char | Shows password requirement errors "An error occurred. Please try again." | ✔️ |
| PWD-005 | Request Password Reset | 1. Go to Login page <br> 2. Click "Forgot Password" <br> 3. Enter registered email | Shows "Reset link sent" message | ✔️ |
| PWD-006 | Reset Password - Valid Link | 1. Click reset link from email <br> 2. Enter new password <br> 3. Confirm | Password reset, redirects to login | ✔️ |
| PWD-007 | Reset Password - Expired Link | 1. Click expired reset link | Shows "Link expired" error | ✔️ |

---

### Module 2: Dashboard & Layout

#### 2.1 Admin Dashboard

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| DASH-001 | Dashboard Stats Load | 1. Login as Admin <br> 2. View dashboard | Stats cards display user counts, loan stats | ✔️ |
| DASH-002 | Charts Render | 1. Login as Admin <br> 2. View dashboard charts | StatusBarChart and ProductsPieChart render correctly | ✔️ |
| DASH-003 | Recent Activity | 1. Login as Admin <br> 2. View recent activity section | Shows recent system activities | ✔️ |
| DASH-004 | Stats Accuracy | 1. Compare dashboard stats with actual database counts | Numbers match database records | ✔️ |

#### 2.2 Officer Dashboard

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| DASH-005 | Officer Stats Load | 1. Login as Officer <br> 2. View dashboard | Shows assigned applications, pending reviews | ✔️ |
| DASH-006 | Today's Tasks | 1. Login as Officer <br> 2. View tasks section | Shows tasks due today | ✔️ |

#### 2.3 Navigation & UI

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| NAV-001 | Sidebar Navigation | 1. Click each sidebar link | Navigates to correct page, active state shown | ✔️ |
| NAV-002 | Sidebar Collapse | 1. Click collapse button | Sidebar minimizes to icons only | ✔️ |
| NAV-003 | Sidebar Expand | 1. Collapse sidebar <br> 2. Click expand button | Sidebar expands to full width | ✔️ |
| NAV-004 | Breadcrumbs | 1. Navigate to nested page | Breadcrumbs show correct hierarchy | ✔️ |
| NAV-005 | Dark Mode Toggle | 1. Click theme toggle button | Theme switches, preference persisted | ✔️ |
| NAV-006 | Light Mode Toggle | 1. In dark mode, click theme toggle | Switches to light mode | ✔️ |
| NAV-007 | Profile Dropdown | 1. Click profile avatar | Shows dropdown with profile, settings, logout | ✔️ |
| NAV-008 | Mobile Responsive | 1. Resize to mobile width | Sidebar becomes hamburger menu | ✔️ |
| NAV-009 | Mobile Menu | 1. On mobile, click hamburger <br> 2. Click menu item | Menu opens, navigation works | ✔️ |

---

### Module 3: User Managementl

#### 3.1 Loan Officer Management

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| USER-001 | List Officers | 1. Login as Admin <br> 2. Navigate to Loan Officers | Table displays officers with pagination | ✅ |
| USER-002 | Search Officers - Name | 1. Type officer name in search box | Table filters to matching officers | ✅ |
| USER-003 | Search Officers - Email | 1. Type officer email in search box | Table filters to matching officers | ✅ |
| USER-004 | Search Officers - No Results | 1. Search for non-existent name | Shows "No officers found" message | ✅ |
| USER-005 | Filter - All | 1. Select "All" from filter dropdown | Shows both active and inactive officers | ✅ |
| USER-006 | Filter - Active | 1. Select "Active" from filter dropdown | Shows only active officers | ✅ |
| USER-007 | Filter - Inactive | 1. Select "Inactive" from filter dropdown | Shows only inactive officers | ✅ |
| USER-008 | Sort by Name (Asc) | 1. Click "Name" column header | Officers sorted A-Z by name | ✅ |
| USER-009 | Sort by Name (Desc) | 1. Click "Name" column header twice | Officers sorted Z-A by name | ✅ |
| USER-010 | Sort by Date | 1. Click "Date Created" column header | Officers sorted by creation date | ✅ |
| USER-011 | Pagination - Next | 1. Click "Next" button | Shows next page of officers | ✅ |
| USER-012 | Pagination - Previous | 1. Go to page 2 <br> 2. Click "Previous" | Shows previous page | ✅ |
| USER-013 | Pagination - Direct | 1. Click page number button | Jumps to selected page | ✅ |
| USER-014 | Create Officer - Valid | 1. Click "Add Officer" <br> 2. Fill all fields correctly <br> 3. Submit | Officer created, appears in list | ✅ |
| USER-015 | Create Officer - Duplicate Email | 1. Click "Add Officer" <br> 2. Enter existing email | Shows "Email already exists" error | ✅ |
| USER-016 | Create Officer - Invalid Email | 1. Click "Add Officer" <br> 2. Enter invalid email format | Shows email validation error | ✅ |
| USER-017 | Create Officer - Missing Required | 1. Click "Add Officer" <br> 2. Leave required fields empty <br> 3. Submit | Shows validation errors for each field | ✅ |
| USER-018 | Edit Officer | 1. Click edit icon on officer row <br> 2. Modify fields <br> 3. Save | Changes saved, reflected in list | ✅ |
| USER-019 | Deactivate Officer | 1. Click deactivate button on active officer <br> 2. Confirm | Officer status changes to inactive | ✅ |
| USER-020 | Activate Officer | 1. Click activate button on inactive officer | Officer status changes to active | ✅ |

#### 3.2 Admin Management (Super Admin Only)

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| USER-021 | Admins Link Visible (Super Admin) | 1. Login as Super Admin <br> 2. Check sidebar | "Admins" link visible in sidebar | ✅ |
| USER-022 | Admins Link Hidden (Regular Admin) | 1. Login as Regular Admin <br> 2. Check sidebar | "Admins" link NOT visible | ✅ |
| USER-023 | List Admins | 1. Login as Super Admin <br> 2. Navigate to Admins | Table displays admins with pagination | ✅ |
| USER-024 | Create Admin - Valid | 1. Click "Add Admin" <br> 2. Fill all fields <br> 3. Set role (Admin/Super Admin) <br> 4. Submit | Admin created | ✅ |
| USER-025 | Edit Admin | 1. Click edit on admin row <br> 2. Modify fields <br> 3. Save | Changes saved | ✅ |
| USER-026 | Deactivate Admin | 1. Deactivate another admin | Admin deactivated | ✅ |
| USER-027 | Cannot Deactivate Self | 1. Try to deactivate own account | Shows error or button disabled | ✅ |

#### 3.3 Officer Workload

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| USER-028 | View Workload | 1. Navigate to Officer Workload | Shows officers with assigned application counts | ✅ |
| USER-029 | Assign Application | 1. Select unassigned application <br> 2. Choose officer <br> 3. Assign | Application assigned, officer count increases | ✅ |
| USER-030 | Reassign Application | 1. Select assigned application <br> 2. Choose different officer <br> 3. Reassign | Application moved to new officer | ✅ |

---

### Module 4: Loan Products

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PROD-001 | List Products | 1. Navigate to Loan Products | Table shows all products | ✅ |
| PROD-002 | Create Product - Valid | 1. Click "Add Product" <br> 2. Fill name, interest rate, terms <br> 3. Save | Product created, appears in list | ✅ |
| PROD-003 | Create Product - Duplicate Name | 1. Create product with existing name | Shows "Name already exists" error | ✅ |
| PROD-004 | Create Product - Invalid Rate | 1. Enter negative interest rate | Shows validation error | ✅ |
| PROD-005 | Edit Product | 1. Click edit on product row <br> 2. Modify fields <br> 3. Save | Changes saved | ✅ |
| PROD-006 | Deactivate Product | 1. Click deactivate on active product | Product marked inactive | ✅ |
| PROD-007 | Activate Product | 1. Click activate on inactive product | Product marked active | ✅ |
| PROD-008 | Product in Use | 1. Try to delete product with active loans | Shows error or prevents deletion | ✅ |

---

### Module 5: Loan Applications

#### 5.1 Admin Application View

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| APP-001 | List All Applications | 1. Login as Admin <br> 2. Navigate to Applications | Shows all applications with pagination | ✅ |
| APP-002 | Filter by Status | 1. Select status filter (Pending/Approved/Rejected) | Table filters accordingly | ✅ |
| APP-003 | View Application Details | 1. Click on application row | Shows full application details | ✅ |
| APP-004 | Assign to Officer | 1. Select unassigned application <br> 2. Click "Assign" <br> 3. Select officer | Application assigned to officer | ❌ |

#### 5.2 Officer Application Review

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| APP-005 | View Assigned Applications | 1. Login as Officer <br> 2. Navigate to Applications | Shows only assigned applications | ✅ |
| APP-006 | Review Application | 1. Click on assigned application | Shows application details with review options | ✅ |
| APP-007 | Approve Application | 1. Review application <br> 2. Click "Approve" <br> 3. Add notes (optional) <br> 4. Confirm | Application status changes to Approved | ✅ |
| APP-008 | Reject Application | 1. Review application <br> 2. Click "Reject" <br> 3. Add rejection reason (required) <br> 4. Confirm | Application status changes to Rejected, reason saved | ✅ |
| APP-009 | Request More Documents | 1. Review application <br> 2. Click "Request Documents" <br> 3. Specify what's needed | Request sent to customer, status updates | ❌ |
| APP-010 | Add Review Notes | 1. Open application <br> 2. Add internal notes <br> 3. Save | Notes saved, visible to other officers/admins | ⚠️ |

#### 5.3 Disbursement

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| APP-011 | View Approved for Disbursement | 1. Navigate to Disbursement page | Shows approved applications pending disbursement | ✅ |
| APP-012 | Process Disbursement | 1. Select approved application <br> 2. Enter disbursement details <br> 3. Confirm | Disbursement recorded, repayment schedule generated | ✅  |
| APP-013 | Disbursement Receipt | 1. After disbursement <br> 2. View/print receipt | Receipt shows all disbursement details | ❌ |

---

### Module 6: Document Management

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| DOC-001 | List Documents | 1. Navigate to Documents page | Shows all documents with status badges | ✅ |
| DOC-002 | Filter by Type | 1. Select document type filter | Shows only selected type | ✅ | 
| DOC-003 | Filter by Status | 1. Select status filter (Pending/Verified/Rejected) | Shows matching documents | ✅ |
| DOC-004 | View Document | 1. Click on document row | Opens document preview | ⚠️ |
| DOC-005 | Verify Document | 1. Open pending document <br> 2. Review content <br> 3. Click "Verify" | Document status changes to Verified | ✅ |
| DOC-006 | Reject Document | 1. Open pending document <br> 2. Click "Reject" <br> 3. Enter reason | Document status changes to Rejected, customer notified | ✅ | 
| DOC-007 | Request Re-upload | 1. Open document <br> 2. Click "Request Re-upload" <br> 3. Specify issue | Request sent to customer | ⚠️ | 
| DOC-008 | Document Status Badge | 1. View documents list | Status badges show correct colors (Pending=Yellow, Verified=Green, Rejected=Red) | ⚠️ | 

---

### Module 7: Payment Management

#### 7.1 Record Payment

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PAY-001 | Search Loans | 1. Navigate to Record Payment <br> 2. Search by customer name or loan ID | Shows matching active loans | ⚠️ |
| PAY-002 | Select Loan | 1. Search for loan <br> 2. Click on loan result | Shows loan details and payment form | ✅  |
| PAY-003 | Record Full Payment | 1. Select loan <br> 2. Enter full installment amount <br> 3. Select payment method <br> 4. Submit | Payment recorded, schedule updated | ✅  |
| PAY-004 | Record Partial Payment | 1. Select loan <br> 2. Enter partial amount <br> 3. Submit | Partial payment recorded, remaining balance shown | ✅  |
| PAY-005 | Payment Methods | 1. Open payment form <br> 2. Check available methods | Shows Cash, Bank Transfer, Mobile Money, etc. | ✅ |
| PAY-006 | Reference Number | 1. Select bank transfer <br> 2. Enter reference number | Reference number saved with payment | ✅ |
| PAY-007 | Payment Confirmation | 1. Submit payment | Shows confirmation with details | ✅  |
| PAY-008 | Duplicate Payment Prevention | 1. Try to record same payment twice | Shows warning or prevents duplicate | ⚠️   |

#### 7.2 Repayment Schedule

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PAY-009 | View Schedule | 1. Navigate to loan <br> 2. View repayment schedule | Shows all installments with dates and amounts | ✅ |
| PAY-010 | Overdue Indicator | 1. View schedule with overdue payment | Overdue row highlighted in red | ✅  |
| PAY-011 | Paid Indicator | 1. View schedule after payment | Paid rows marked with checkmark | ✅  |
| PAY-012 | Remaining Balance | 1. View schedule | Shows correct remaining balance | ✅  |

#### 7.3 Payment History

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PAY-013 | View History | 1. Navigate to Payment History | Shows all payments with pagination | ✅ |
| PAY-014 | Filter by Date | 1. Select date range | Shows payments in range | ⚠️  |
| PAY-015 | Filter by Status | 1. Filter by On-time/Late payments | Shows matching payments | ⚠️  |
| PAY-016 | Export History | 1. Click Export <br> 2. Select format | Downloads payment history file | ❌ |

---

### Module 8: Analytics & Reporting

#### 8.1 Admin Analytics

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| ANLY-001 | Stats Cards Accuracy | 1. View dashboard stats <br> 2. Compare with database | Numbers match actual counts | ✅ |
| ANLY-002 | Loan Status Chart | 1. View StatusBarChart | Shows correct distribution of loan statuses | ✅ |
| ANLY-003 | Products Chart | 1. View ProductsPieChart | Shows loan distribution by product type | ✅ |
| ANLY-004 | Chart Interactivity | 1. Hover over chart sections | Shows tooltips with details | ✅ |

#### 8.2 Audit Logs

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| ANLY-005 | View Audit Logs | 1. Navigate to Audit Logs | Shows all system audit entries | ✅ |
| ANLY-006 | Filter by Action | 1. Filter by action type (Login, Create, Update, Delete) | Shows matching logs | ✅  |
| ANLY-007 | Filter by User | 1. Select specific user | Shows only that user's actions | ❌ |
| ANLY-008 | Filter by Date Range | 1. Select date range | Shows logs within range | ☐ |
| ANLY-009 | Search Logs | 1. Enter search term | Finds matching log entries | ✅ |
| ANLY-010 | Export Logs CSV | 1. Click Export <br> 2. Select CSV | Downloads audit logs as CSV | ✅ |
| ANLY-011 | Export Logs Excel | 1. Click Export <br> 2. Select Excel | Downloads audit logs as Excel | ❌ |
| ANLY-012 | Log Details | 1. Click on log entry | Shows full details including IP, timestamp, changes | ❌ |

---

### Module 9: AI Assistant

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AI-001 | Open Chat | 1. Click AI Assistant button | Chat interface opens | ⁉️ |
| AI-002 | Send Message | 1. Type message <br> 2. Press Enter or click Send | Message sent, shows in chat | ⁉️ |
| AI-003 | Receive Response | 1. Send message <br> 2. Wait for response | AI response appears | ⁉️ |
| AI-004 | Chat History | 1. Close and reopen chat | Previous messages preserved | ⁉️ |
| AI-005 | Clear History | 1. Click "Clear conversation" | Chat history cleared | ⁉️ |
| AI-006 | Suggestions | 1. Open chat | Shows suggested questions/actions | ⁉️ |
| AI-007 | FAQ Queries | 1. Ask common question (e.g., "How to apply for loan?") | Returns relevant FAQ answer | ⁉️ |
| AI-008 | Educational Content | 1. Ask about financial terms | Returns educational explanation | ⁉️ |

---

### Module 10: Profile Management

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PROF-001 | View Own Profile | 1. Click profile in header | Shows user profile page | ✔ |
| PROF-002 | Update Profile | 1. Edit profile fields <br> 2. Save | Changes saved successfully | ✔ |
| PROF-003 | View Customer Profile | 1. Open customer's loan application <br> 2. Click customer name | Shows customer profile details | ✔ |
| PROF-004 | Business Profile | 1. View customer with business loan | Shows business details | ✔ |

---

### Module 11: Notifications

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| NOTIF-001 | Notification Bell | 1. View header | Shows notification bell with count badge | ⁉️ |
| NOTIF-002 | View Notifications | 1. Click notification bell | Shows notification dropdown/list | ⁉️ |
| NOTIF-003 | Mark as Read | 1. Click on notification | Notification marked as read, badge decreases | ⁉️ |
| NOTIF-004 | Mark All Read | 1. Click "Mark all as read" | All notifications marked as read | ⁉️ |
| NOTIF-005 | Real-time Update | 1. Have another user trigger notification <br> 2. Observe | New notification appears without refresh | ⁉️ |
| NOTIF-006 | Notification Link | 1. Click notification with action | Navigates to relevant page | ⁉️ |

---

## Edge Cases & Error Handling

### Network & Connectivity

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDGE-001 | Offline Mode | 1. Disconnect network <br> 2. Try to use app | Shows appropriate offline message | ⁉️ |
| EDGE-002 | Slow Connection | 1. Throttle network <br> 2. Load data-heavy page | Shows loading indicators, eventually loads | ⁉️ |
| EDGE-003 | Request Timeout | 1. Simulate server timeout | Shows timeout error message | ⁉️ |
| EDGE-004 | Reconnection | 1. Go offline <br> 2. Come back online | App recovers and syncs | ⁉️ |

### Authorization & Security

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDGE-005 | Access Admin as Officer | 1. Login as Officer <br> 2. Manually navigate to `/admin/` | Redirected or shows 403 | ✔ |
| EDGE-006 | Access Officer as Admin | 1. Login as Admin <br> 2. Navigate to `/officer/` | Appropriate handling (redirect or allow) | ✔ |
| EDGE-007 | Expired Token API Call | 1. Manually expire token <br> 2. Make API call | Redirects to login or refreshes token | ✔ |
| EDGE-008 | Tampered Token | 1. Modify JWT in storage <br> 2. Make API call | Shows authentication error | ✔ |

### Data Validation

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDGE-009 | XSS Prevention | 1. Enter `<script>alert('xss')</script>` in input <br> 2. Submit | Input sanitized, no script execution | ⚠️  |
| EDGE-010 | SQL/NoSQL Injection | 1. Enter malicious query in search | Query sanitized, no injection | ✔ |
| EDGE-011 | Large File Upload | 1. Try to upload file exceeding limit | Shows file size error | ⚠️ |
| EDGE-012 | Invalid File Type | 1. Try to upload unsupported file type | Shows file type error | ⚠️ |
| EDGE-013 | Special Characters in Name | 1. Enter name with special chars | Handles appropriately (saves or validation error) | ❌ |
| EDGE-014 | Empty Form Submission | 1. Submit form without required fields | Shows all validation errors | ✔ |
| EDGE-015 | Very Long Input | 1. Enter extremely long text in fields | Truncates or shows max length error | ❌ |

### Concurrent Operations

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDGE-016 | Simultaneous Edits | 1. User A opens edit form <br> 2. User B saves same record <br> 3. User A tries to save | Shows conflict or last-write-wins | ❌ |
| EDGE-017 | Double Submit | 1. Click submit button rapidly twice | Only one submission processed | ☐ |
| EDGE-018 | Stale Data | 1. View list <br> 2. Another user adds record <br> 3. Refresh | New record appears | ☐ |

### Browser & Device

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDGE-019 | Browser Back Button | 1. Navigate through pages <br> 2. Click back | Navigates correctly, state preserved | ☐ |
| EDGE-020 | Page Refresh | 1. In middle of workflow <br> 2. Refresh page | State recovered or graceful reset | ☐ |
| EDGE-021 | Multiple Tabs | 1. Open app in two tabs <br> 2. Logout in one | Both tabs reflect logout | ☐ |
| EDGE-022 | Print Page | 1. Try to print report/list | Prints with proper formatting | ☐ |

---

## Test Environment Setup

### Prerequisites

1. **Backend Server**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py runserver
   ```

2. **Frontend Dev Server**
   ```bash
   npm install
   npm run dev
   ```

3. **Database**
   - MongoDB running locally or MongoDB Atlas connection configured

### Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Super Admin | `superadmin@test.com` | `Test123!` | Can manage admins |
| Admin | `admin@test.com` | `Test123!` | Standard admin |
| Loan Officer | `officer@test.com` | `Test123!` | Standard officer |
| Inactive Officer | `inactive@test.com` | `Test123!` | For testing deactivated accounts |

### Testing Tools

- **Browser DevTools**: Network tab for API monitoring
- **React DevTools**: Component state inspection
- **Postman/Insomnia**: Direct API testing
- **MongoDB Compass**: Database verification

### Test Data Requirements

1. **Loan Products**: At least 3 active products with different terms
2. **Loan Applications**: Mix of statuses (Pending, Approved, Rejected, Disbursed)
3. **Documents**: Various types with different verification statuses
4. **Payments**: History with on-time and overdue payments
5. **Audit Logs**: Variety of action types for filtering tests

---

## Testing Progress Tracker

| Module | Total Tests | Passed | Failed | Blocked | Completion |
|--------|-------------|--------|--------|---------|------------|
| 1. Authentication | 25 | ☐ | ☐ | ☐ | 0% |
| 2. Dashboard & Layout | 15 | ☐ | ☐ | ☐ | 0% |
| 3. User Management | 30 | ☐ | ☐ | ☐ | 0% |
| 4. Loan Products | 8 | ☐ | ☐ | ☐ | 0% |
| 5. Loan Applications | 13 | ☐ | ☐ | ☐ | 0% |
| 6. Document Management | 8 | ☐ | ☐ | ☐ | 0% |
| 7. Payment Management | 16 | ☐ | ☐ | ☐ | 0% |
| 8. Analytics & Reporting | 12 | ☐ | ☐ | ☐ | 0% |
| 9. AI Assistant | 8 | ☐ | ☐ | ☐ | 0% |
| 10. Profile Management | 4 | ☐ | ☐ | ☐ | 0% |
| 11. Notifications | 6 | ☐ | ☐ | ☐ | 0% |
| Edge Cases | 22 | ☐ | ☐ | ☐ | 0% |
| **TOTAL** | **167** | **0** | **0** | **0** | **0%** |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-29 | System Analysis | Initial comprehensive document |

---

*End of Document*
