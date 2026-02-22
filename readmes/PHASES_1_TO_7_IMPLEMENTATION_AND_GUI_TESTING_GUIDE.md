# Phases 1-7: Implementation and GUI Testing Guide

Single consolidated guide for Phases 1-7.

---

# Phase 1: Authentication (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/csrf-token/` | Issue CSRF token/cookie for unsafe requests |
| POST | `/api/auth/loan-officer/login/` | Loan officer login (`email`, `password`, `remember_me`) |
| POST | `/api/auth/admin/login/` | Admin login (`username`, `password`) |
| POST | `/api/auth/2fa/verify/` | Complete login with `temp_token` + `code` |
| POST | `/api/auth/refresh-token/` | Refresh access/refresh tokens |
| POST | `/api/auth/loan-officer/logout/` | Loan officer logout |
| POST | `/api/auth/admin/logout/` | Admin logout |
| POST | `/api/auth/2fa/setup/` | Start 2FA setup (authenticated) |
| POST | `/api/auth/2fa/confirm/` | Confirm 2FA setup with 6-digit code |
| GET | `/api/auth/2fa/status/` | Check 2FA status (authenticated) |
| POST | `/api/auth/2fa/disable/` | Disable 2FA (non-admin only; needs password) |
| POST | `/api/auth/2fa/backup-codes/` | Regenerate backup codes (needs password) |
| POST | `/api/auth/change-password/` | Change current password (authenticated) |
| POST | `/api/auth/forgot-password/` | Send password reset OTP |
| POST | `/api/auth/verify-reset-otp/` | Verify password reset OTP |
| POST | `/api/auth/reset-password/` | Reset password using OTP |

## How to Test (GUI First)

```bash
# 1) Start backend
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py runserver
```

```bash
# 2) Start frontend
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev
```

1. Open `http://localhost:5173/login`
2. Test **Loan Officer login** (tab: Loan Officer)
Expected: success goes to `/officer` or `/verify-2fa` if 2FA is enabled.
3. Test **Admin login** (tab: Admin)
Expected: admin always goes through `/verify-2fa`; first-time admin may be required to set up 2FA.
4. Complete **2FA verification** on `/verify-2fa`
Expected: successful code redirects to `/admin` or `/officer`.
5. Test **Forgot Password** on `/forgot-password`
Steps: email -> OTP -> new password -> success page.
6. Test **2FA and password settings** from GUI:
`/officer/settings` and `/admin/settings`
Actions:
Enable 2FA, confirm 2FA code, view 2FA status, regenerate backup codes, change password.
Expected:
Admin cannot disable 2FA (`admin_2fa_mandatory` behavior).
Loan officer can disable 2FA with correct password.
7. Test **Logout** via header/sidebar logout button
Expected: redirected to `/login`.

## Fallback Testing (Postman/Insomnia/curl)

Use this only for checks not directly triggered from UI (for example CSRF token issuance, forced refresh testing, or payload/security-edge cases such as XSS strings).

```bash
# Get CSRF token
curl -i http://localhost:8000/api/auth/csrf-token/
```

```bash
# Refresh token (send cookies from an authenticated session)
curl -i -X POST http://localhost:8000/api/auth/refresh-token/ \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

# Phase 2: Dashboard & Layout (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/analytics/admin/` | Admin dashboard stats/charts data |
| GET | `/api/analytics/officer/` | Loan officer dashboard stats |

## How to Test (GUI First)

```bash
# Backend
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py runserver
```

```bash
# Frontend
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev
```

1. Login as Admin at `/login` and verify redirect to `/admin`.
2. Login as Loan Officer at `/login` and verify redirect to `/officer`.
3. Verify sidebar navigation for each role loads expected pages (dashboard, applications, settings, etc.).
4. Verify layout behavior: sidebar collapse/expand and responsive view on smaller width.
5. Verify dashboard cards/charts load and `Refresh` works on both `/admin` and `/officer`.
6. Verify role guard: loan officer cannot access `/admin` routes.
7. Verify logout from sidebar/header returns to `/login`.

## Fallback (Postman/Insomnia/curl)

Use when dashboard data needs direct API verification.

```bash
curl -i http://localhost:8000/api/analytics/admin/
curl -i http://localhost:8000/api/analytics/officer/
```

---

# Phase 3: Loan Applications (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/loans/admin/products/` | List products |
| POST | `/api/loans/admin/products/` | Create product |
| GET | `/api/loans/admin/products/{id}/` | Product detail |
| PUT | `/api/loans/admin/products/{id}/` | Update product |
| DELETE | `/api/loans/admin/products/{id}/` | Deactivate product |
| GET | `/api/loans/admin/officers/workload/` | Workload + assignable apps |
| POST | `/api/loans/admin/applications/{id}/assign/` | Assign app to officer |
| POST | `/api/loans/admin/applications/{id}/reassign/` | Reassign app |
| GET | `/api/loans/officer/applications/` | Officer application list |
| GET | `/api/loans/officer/applications/{id}/` | Officer application detail |
| PUT | `/api/loans/officer/applications/{id}/review/` | Approve/Reject |
| POST | `/api/loans/officer/applications/{id}/disburse/` | Disburse approved app |
| POST | `/api/loans/officer/applications/{id}/notes/` | Add internal note |
| POST | `/api/loans/officer/applications/{id}/request-missing-documents/` | Request missing docs |

## How to Test (GUI First)

1. Admin: open `/admin/products`.
Actions: create, edit, deactivate/reactivate a product.
Expected: product list updates and status badges reflect changes.
2. Admin: open `/admin/applications`.
Actions: assign unassigned application to an officer, then reassign from assigned list.
Expected: counts and assignment rows update.
3. Officer: open `/officer/applications`.
Actions: test status filter, search, pagination, sort.
Expected: table updates correctly.
4. Officer: open `/officer/applications/{id}`.
Actions: approve/reject, add internal note, request missing documents, disburse approved app.
Expected: status transitions and feedback/toast messages are correct.

## Fallback (Postman/Insomnia/curl)

Use for payload-edge tests (invalid amounts, invalid status transitions, malformed body).

```bash
# Example: approve/reject payload check
PUT /api/loans/officer/applications/{id}/review/

# Example: disbursement payload check
POST /api/loans/officer/applications/{id}/disburse/
```

---

# Phase 4: Document Management (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/documents/` | List/filter documents |
| GET | `/api/documents/{id}/` | Document detail |
| GET | `/api/documents/types/` | Supported document types |
| PUT | `/api/documents/{id}/verify/` | Approve/Reject document |
| POST | `/api/documents/{id}/request-reupload/` | Ask customer to re-upload |

## How to Test (GUI First)

1. Login as loan officer and open `/officer/documents`.
2. Test search and status filters (`pending`, `needs_review`, `approved`, `rejected`).
3. Open a document via view action.
Expected: file opens in new tab.
4. Verify flow: approve and reject from verify modal.
Expected: status updates and row badges change.
5. Re-upload flow: request re-upload with reason.
Expected: re-upload marker/badge appears.

## Fallback (Postman/Insomnia/curl)

Use for non-UI payload checks (long reasons, invalid status, malformed payload).

```bash
PUT /api/documents/{id}/verify/
POST /api/documents/{id}/request-reupload/
```

---

# Phase 5: Payments (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/loans/officer/active-loans/` | Search active/disbursed loans |
| POST | `/api/loans/officer/payments/` | Record payment |
| GET | `/api/loans/officer/payments/search/` | Payment history search/filter |
| GET | `/api/loans/officer/applications/{id}/schedule/` | Repayment schedule |
| GET | `/api/loans/officer/applications/{id}/payments/` | Loan payment history |

## How to Test (GUI First)

1. Open `/officer/payments`.
2. Search a loan by customer/loan identifier and select one.
Expected: selected loan card + prefilled payment details.
3. Record payment (installment, amount, method, reference or auto-generate).
Expected: success message and updated remaining balance.
4. Verify schedule/history cards refresh after recording.
5. Open `/officer/payment-history`.
Actions: search/filter/sort/paginate and export (`csv`/`json`).
Expected: results and totals match filters; export downloads file.

## Fallback (Postman/Insomnia/curl)

Use for edge validations (overpayment, out-of-order installment, invalid method).

```bash
POST /api/loans/officer/payments/
GET  /api/loans/officer/payments/search/
```

---

# Phase 6: Analytics Dashboard (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/analytics/admin/` | Admin dashboard metrics |
| GET | `/api/analytics/officer/` | Officer dashboard metrics |
| GET | `/api/analytics/audit-logs/` | Audit logs list/filter |
| GET | `/api/analytics/audit-logs/users/` | Users list for audit filters |
| GET | `/api/analytics/audit-logs/{id}/` | Audit log detail |

## How to Test (GUI First)

1. Admin: open `/admin`.
Expected: users/loans cards, status bar chart, product pie chart, recent activity, refresh button.
2. Admin: open `/admin/audit-logs`.
Actions: filter by action/role/date/search, paginate, open detail modal, export (`csv`/`excel`).
Expected: table and counts follow filters; export downloads file.
3. Loan officer: open `/officer`.
Expected: queue/review/performance stats load and refresh works.
4. Error handling check: temporarily stop backend and reload dashboard/logs page.
Expected: error state appears with retry action.

## Fallback (Postman/Insomnia/curl)

Use for direct filter verification when UI results are unclear.

```bash
GET /api/analytics/audit-logs/?action_group=login&date_from=2026-02-01&date_to=2026-02-20&page=1&page_size=20
GET /api/analytics/admin/
GET /api/analytics/officer/
```

---

# Phase 7: User Management (Condensed)

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/admin/loan-officers/` | List officers |
| POST | `/api/auth/admin/loan-officers/` | Create officer |
| GET | `/api/auth/admin/loan-officers/{id}/` | Officer detail |
| PUT | `/api/auth/admin/loan-officers/{id}/` | Update officer |
| DELETE | `/api/auth/admin/loan-officers/{id}/` | Deactivate officer |
| GET | `/api/auth/admin/admins/` | List admins (super admin) |
| POST | `/api/auth/admin/admins/` | Create admin (super admin) |
| GET | `/api/auth/admin/admins/{id}/` | Admin detail (super admin) |
| PUT | `/api/auth/admin/admins/{id}/` | Update admin (super admin) |
| DELETE | `/api/auth/admin/admins/{id}/` | Deactivate admin (super admin) |
| PUT | `/api/auth/admin/admins/{id}/permissions/` | Toggle super-admin / permissions |

## How to Test (GUI First)

1. Admin: open `/admin/officers`.
Actions: search, filter active/inactive, sort, create officer.
Expected: list updates and temporary password modal appears on create.
2. Admin: open `/admin/officers/{id}`.
Actions: edit profile fields, deactivate/activate.
Expected: status and details update.
3. Super Admin: open `/admin/admins`.
Actions: search/filter/sort, create admin.
Expected: list updates and temporary password modal appears.
4. Super Admin: open `/admin/admins/{id}`.
Actions: edit, deactivate/activate, promote/demote super admin, edit granular permissions.
Expected: role/permission badges update.
5. Regular Admin access check:
Expected: `Admins` menu is hidden and `/admin/admins` is blocked.

## Fallback (Postman/Insomnia/curl)

Use for permission/validation edge cases (duplicate email/username, forbidden role actions).

```bash
POST /api/auth/admin/admins/
PUT  /api/auth/admin/admins/{id}/permissions/
```
