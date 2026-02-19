# Login Error Handling Testing Guide (Generic + Logs)

Last updated: February 19, 2026

## 1. Objective

Validate this Category 1 checkpoint end-to-end:

`| Error Handling | Do login errors leak info? | ☐ Leaks  ☐ Inconsistent  ☐ Generic  ☑ Generic + logs |`

You pass when:
1. Login failure responses are generic (no user/account-state leakage).
2. Failed login attempts are logged server-side with actionable reason codes.
3. Failed login attempts are recorded in audit logs.

## 2. Scope

Endpoints covered:
1. `POST /api/auth/login/` (customer)
2. `POST /api/auth/loan-officer/login/`
3. `POST /api/auth/admin/login/`

Evidence sources:
1. API responses
2. Frontend login error messages
3. `backend/logs/authentication.log`
4. `audit_logs` collection (`user_login_failed`)

## 3. Implementation Coverage

Backend:
1. Generic login messages + structured failure logging:
   - `backend/accounts/views/auth_views.py`
   - `backend/accounts/views/loan_officer_views.py`
   - `backend/accounts/views/admin_views.py`
2. Logger wiring for auth log file:
   - `backend/config/settings.py`
3. Audit action support for failed logins:
   - `backend/analytics/models/audit_log.py`

Frontend:
1. Enforced generic login error display:
   - `src/lib/errors.ts`

## 4. Pre-Test Setup

1. Start backend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py runserver
```

2. Start frontend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev
```

3. Ensure auth log file exists:
```bash
ls -lah /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend/logs/authentication.log
```

## 5. API Test Cases (Primary)

Use real accounts where needed.

### T1. Customer: nonexistent account vs wrong password must look the same

```bash
curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"no-user@example.com","password":"Wrong123!"}'
```

```bash
curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"<existing-customer-email>","password":"Wrong123!"}'
```

Expected:
1. Both return login failure.
2. Both use the same generic message (`Invalid email/username or password.`).
3. No leak such as:
   - "account locked"
   - "deactivated"
   - "unverified"
   - "attempts remaining"

### T2. Loan officer login failure must remain generic

```bash
curl -s -X POST http://localhost:8000/api/auth/loan-officer/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"no-officer@example.com","password":"Wrong123!"}'
```

```bash
curl -s -X POST http://localhost:8000/api/auth/loan-officer/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"<existing-officer-email>","password":"Wrong123!"}'
```

Expected:
1. Same generic failure message.
2. No account-status leak.

### T3. Admin login failure must remain generic

```bash
curl -s -X POST http://localhost:8000/api/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"no-admin","password":"Wrong123!"}'
```

```bash
curl -s -X POST http://localhost:8000/api/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"<existing-admin-username-or-email>","password":"Wrong123!"}'
```

Expected:
1. Same generic failure message.
2. No account-status leak.

### T4. Validation errors stay specific (still allowed)

```bash
curl -s -X POST http://localhost:8000/api/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":""}'
```

Expected:
1. `400` validation response.
2. Field errors are specific (this is acceptable and expected).

## 6. Frontend UI Test Cases

### U1. Login error text is generic

Steps:
1. Open login page.
2. Try nonexistent email/username.
3. Try existing account with wrong password.

Expected:
1. Same login alert text for both scenarios.
2. No hint about whether account exists, is locked, deactivated, or unverified.

## 7. Log Verification (Generic + Logs Proof)

### L1. File logs contain failed login records with reasons

```bash
tail -n 200 /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend/logs/authentication.log
```

Look for entries similar to:
1. `login_failed role=customer reason=user_not_found ...`
2. `login_failed role=customer reason=password_incorrect_... ...`
3. `login_failed role=loan_officer reason=...`
4. `login_failed role=admin reason=...`

Security check:
1. Logs must not contain plaintext passwords.
2. Logs must not contain tokens.

### L2. Audit logs contain failed login events

Option A (Django shell):
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
python manage.py shell -c "from django.conf import settings; docs=list(settings.MONGODB['audit_logs'].find({'action':'user_login_failed'}).sort('timestamp',-1).limit(5)); print([{ 'action': d.get('action'), 'user_type': d.get('user_type'), 'details': d.get('details') } for d in docs])"
```

Expected:
1. Records with `action: user_login_failed`.
2. `details.reason` present.

## 8. Pass/Fail Checklist

Mark all as pass to claim `Generic + logs`:

1. All login failure responses are generic across customer/officer/admin endpoints.
2. Frontend displays generic login error text for auth failures.
3. Backend logs failed login attempts with role + reason + IP.
4. Audit log stores `user_login_failed` events.
5. No sensitive secrets (password/token) appear in logs.

## 9. Suggested Evidence for Submission

1. Screenshot/API output: nonexistent account login failure.
2. Screenshot/API output: wrong password login failure (same message).
3. `authentication.log` snippet showing `login_failed ... reason=...`.
4. Shell output showing recent `user_login_failed` audit records.
