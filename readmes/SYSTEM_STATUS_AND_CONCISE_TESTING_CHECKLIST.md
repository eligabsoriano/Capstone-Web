# System Status and Concise Testing Checklist

Last updated: 2026-02-20

This file is the single concise source for current system status, remaining work, and testing focus.

## 1. Current System Status

## 1.1 Web portal coverage
| Area | Status | Notes |
|---|---|---|
| Admin web app | Implemented | Dashboard, officers/admins management, products, applications/workload, audit logs, settings |
| Loan officer web app | Implemented | Dashboard, applications, documents, payments, payment history, settings |
| Customer web app | Not implemented | Customer flows are backend APIs only; customer experience is mobile-first |

## 1.2 Module summary
| Module | Backend | Frontend (Web) | Overall |
|---|---|---|---|
| Authentication + 2FA + password reset | Implemented | Implemented (admin/officer) | Good |
| Dashboard/layout | Implemented | Implemented | Good |
| User management (officers/admins) | Implemented | Implemented | Good |
| Loan products + workload + review/disbursement | Implemented | Implemented | Good |
| Document management | Implemented | Implemented for officer | Partial (admin docs UI missing) |
| Payments + payment history | Implemented | Implemented | Good |
| Analytics + audit logs | Implemented | Implemented | Good |
| Notifications | Implemented | Implemented in header bell | Good |
| AI assistant | Implemented | Not exposed in current web routes | Partial |
| Profiles (customer/business/alt data) | Implemented | Not exposed in current web routes | Partial |

## 2. Remaining Features (Priority)

### Module 9 status from previous checklist
- `Module 9: AI Assistant` is **not yet implemented in the current web UI routes/pages** (backend endpoints exist).

### Priority 1
1. Customer web portal routes/pages (auth, profile, loans, customer dashboard).
2. AI assistant web frontend (consent flow + chat/history/suggestions).

### Priority 2
1. Admin document review page/route/sidebar entry.
2. Officer queue badge count from real API (currently static).

### Priority 3
1. Add audit-log user dropdown filter to UI (backend endpoint already exists).
2. Production error reporting integration (e.g., Sentry).

## 3. Concise Manual Testing Checklist (GUI First)

Run:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py runserver
```

```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev
```

### 3.1 Authentication and session
- [ ] Admin login, officer login, logout
- [ ] 2FA setup + verify + backup code flow
- [ ] Forgot password flow (email -> OTP -> reset)
- [ ] Expired/invalid session redirects to `/login`

### 3.2 Navigation and access control
- [ ] Role-based route guard: officer cannot access `/admin/*`
- [ ] Permission guard: hidden/blocked admin pages without permission
- [ ] Super-admin-only routes (`/admin/admins`) blocked for regular admin

### 3.3 Core business workflows
- [ ] Admin: create/edit/deactivate/reactivate loan product
- [ ] Admin: assign and reassign applications in workload/applications page
- [ ] Officer: review app (approve/reject), add notes, request missing docs
- [ ] Officer: disburse approved application

### 3.4 Documents and payments
- [ ] Officer documents page: search/filter/view/verify/reject/re-upload request
- [ ] Officer payments page: search loan, record payment, verify remaining balance updates
- [ ] Officer payment history: filter/sort/paginate/export

### 3.5 Analytics and audit
- [ ] Admin dashboard cards/charts load; refresh works
- [ ] Officer dashboard metrics load; refresh works
- [ ] Audit logs: filters + detail modal + export (`csv`/`excel`)

### 3.6 Resilience checks
- [ ] Stop backend and verify UI error states + retry buttons
- [ ] Restore backend and confirm recovery without full app failure

## 4. Fallback API Checks (only when GUI is insufficient)

Use Postman/Insomnia/curl for payload-edge cases (invalid transitions, malformed payloads, overpayment, invalid status values).

Examples:
```bash
# CSRF token
curl -i http://localhost:8000/api/auth/csrf-token/

# Token refresh
curl -i -X POST http://localhost:8000/api/auth/refresh-token/ -H "Content-Type: application/json" -d '{}'
```

```bash
# Review/disburse edge validation
PUT  /api/loans/officer/applications/{id}/review/
POST /api/loans/officer/applications/{id}/disburse/

# Document verification edge validation
PUT  /api/documents/{id}/verify/
POST /api/documents/{id}/request-reupload/
```
