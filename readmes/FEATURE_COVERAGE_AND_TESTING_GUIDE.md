# Feature Coverage and Testing Guide (Web + Backend)

Last updated: 2026-02-20

Purpose: concise source of truth for implemented features and how to verify them across this frontend and the backend APIs.

## 1. Coverage Matrix

| Feature Area | Web UI (this repo) | Backend API | Key routes/endpoints |
|---|---|---|---|
| Authentication, sessions, password reset, 2FA | Implemented for Admin and Loan Officer (`/login`, `/verify-2fa`, `/forgot-password`) | Implemented for Customer, Loan Officer, Admin | `/api/auth/*`, `/api/auth/2fa/*` |
| Role and permission guards | Implemented | Implemented | `/admin/*`, `/officer/*`, admin permission endpoints |
| Admin dashboard and analytics | Implemented (`/admin`) | Implemented | `/api/analytics/admin/` |
| Officer dashboard and analytics | Implemented (`/officer`) | Implemented | `/api/analytics/officer/` |
| Loan products management (admin) | Implemented (`/admin/products`) | Implemented | `/api/loans/admin/products/*` |
| Application assignment/workload (admin) | Implemented (`/admin/applications`) | Implemented | `/api/loans/admin/officers/workload/`, `/assign/`, `/reassign/` |
| Officer application processing | Implemented (`/officer/applications`, detail page) | Implemented | `/api/loans/officer/applications/*` |
| Document review flow (officer) | Implemented (`/officer/documents`) | Implemented | `/api/documents/`, `/verify/`, `/request-reupload/` |
| Payment recording and history (officer) | Implemented (`/officer/payments`, `/officer/payment-history`) | Implemented | `/api/loans/officer/payments/*`, `/schedule/` |
| Officer/admin user management | Implemented (`/admin/officers`, `/admin/admins`) | Implemented | `/api/auth/admin/loan-officers/*`, `/api/auth/admin/admins/*` |
| Audit logs | Implemented (`/admin/audit-logs`) | Implemented | `/api/analytics/audit-logs/*` |
| Notifications bell and read actions | Implemented (header notification bell) | Implemented | `/api/notifications/*` |
| Customer profile/business/alternative data | Not exposed in current web routes | Implemented | `/api/profile/*` |
| Customer loan origination flows | Not exposed in current web routes | Implemented | `/api/loans/products/`, `/apply/`, `/applications/*` |
| AI assistant | Not exposed in current web routes | Implemented | `/api/ai/*` |
| Consent management | Not exposed in current web routes | Implemented | `/api/auth/consent/` |

## 2. Web Functional Verification (Admin + Loan Officer)

Run backend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py runserver
```

Run frontend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev -- --host 0.0.0.0 --port 5173
```

### 2.1 Authentication and access control
| Flow | Expected result |
|---|---|
| Login as Admin and Loan Officer | Correct dashboard redirect by role (`/admin` or `/officer`) |
| 2FA verify/setup/backup-codes from settings | Successful setup/verification flows; Admin cannot disable mandatory 2FA |
| Forgot password flow | Email/OTP/reset flow completes; new password works |
| Role/permission guard checks | Officer blocked from `/admin/*`; regular admin blocked from super-admin pages |

### 2.2 Admin feature flows
| Flow | Expected result |
|---|---|
| Dashboard load and refresh | KPI/cards/charts load without console errors |
| Manage officers/admins | Create/edit/deactivate/reactivate works; permissions update reflected |
| Manage products | Create/edit/deactivate product reflected in list |
| Assign/reassign applications | Assignment changes visible in workload and officer queue |
| Audit logs filtering/detail/export | Filters, modal detail, pagination, export work |

### 2.3 Loan officer feature flows
| Flow | Expected result |
|---|---|
| Applications list/detail | Filters/search/pagination/detail data are consistent |
| Review/reject/disburse/request docs/add notes | Valid transitions succeed with feedback messages |
| Documents verify/reject/reupload request | Document statuses and badges update correctly |
| Record payment and inspect balances | Payment records persist; balances/schedule/history refresh |
| Payment history search/filter/export | Result set and exports match selected filters |

### 2.4 Shared UI behaviors
| Flow | Expected result |
|---|---|
| Notification bell unread count/list/mark-read | Badge updates; mark single/all read works |
| API outage handling (stop backend briefly) | Error states and retry actions render, app does not crash |
| Session expiry and refresh flow | Protected requests recover via refresh token or redirect to login |

## 3. Backend API Verification (Features not exposed in current web routes)

Use Postman/Insomnia/curl for backend-only coverage.

| Area | Endpoints | Verify |
|---|---|---|
| Customer auth lifecycle | `/api/auth/signup/`, `/verify-email/`, `/login/`, `/logout/` | Full auth lifecycle and cookie/token behavior |
| Customer profiles | `/api/profile/`, `/business/`, `/alternative-data/`, `/summary/` | Create/update/read profile datasets |
| Customer loan lifecycle | `/api/loans/products/`, `/pre-qualify/`, `/apply/`, `/applications/*`, `/resubmit/` | Product discovery, application submit, status/history |
| Customer analytics | `/api/analytics/customer/` | Customer dashboard payload correctness |
| AI assistant | `/api/ai/chat/`, `/history/`, `/suggestions/`, `/education/`, `/faqs/`, `/status/` | Response format, latency, history persistence |
| Consent | `/api/auth/consent/` | Consent create/update/query behavior |

## 4. Cross-Cutting Validation Targets (Functional + Quality)

- Input validation: invalid payloads return clear `4xx` errors with actionable fields.
- Authorization: wrong role receives `403` (or filtered resource visibility).
- State transitions: invalid review/disburse/payment transitions are rejected.
- Data consistency: dashboard metrics align with list/detail records.
- Pagination/filter/sort: totals and page counts remain stable across query changes.
- Observability: business actions create corresponding audit log entries.

## 5. Current Scope Notes

- This frontend currently targets Admin and Loan Officer journeys.
- Customer and AI journeys are available as backend APIs but not wired to current web routes/pages.
- This document is a testing guide, not a pending-work checklist.
