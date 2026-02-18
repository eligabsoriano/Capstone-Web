# Session Expiry + Secure Flags Testing Guide

Last updated: February 18, 2026

## What this covers

This guide verifies that authentication now uses:
- Expiring auth cookies
- Secure cookie flags (`HttpOnly`, `Secure`, `SameSite`)
- Frontend credentialed requests (`withCredentials`)

---

## How it works

### 1) Backend sets auth cookies on login/refresh

On successful login (customer/admin/loan officer) and 2FA verification, backend sets:
- `access_token` cookie
- `refresh_token` cookie

Cookie lifetime is computed from JWT `exp` (`max_age`), so cookies expire with token lifetime.

### 2) Backend clears cookies on logout

On logout, backend blacklists tokens and also deletes both auth cookies.

### 3) Frontend includes cookies in requests

Frontend axios client uses `withCredentials: true`, so browser sends auth cookies and accepts `Set-Cookie` from backend.

---

## Where implementation is

### Backend
- Cookie utility: [Backend/Capstone_Backend/accounts/utils/auth_cookies.py](Backend/Capstone_Backend/accounts/utils/auth_cookies.py)
- Settings/env flags: [Backend/Capstone_Backend/config/settings.py](Backend/Capstone_Backend/config/settings.py), [Backend/Capstone_Backend/.env.example](Backend/Capstone_Backend/.env.example)
- Customer auth/refresh/logout: [Backend/Capstone_Backend/accounts/views/auth_views.py](Backend/Capstone_Backend/accounts/views/auth_views.py)
- Loan officer auth/logout: [Backend/Capstone_Backend/accounts/views/loan_officer_views.py](Backend/Capstone_Backend/accounts/views/loan_officer_views.py)
- Admin auth/logout: [Backend/Capstone_Backend/accounts/views/admin_views.py](Backend/Capstone_Backend/accounts/views/admin_views.py)
- 2FA verify cookie issuance: [Backend/Capstone_Backend/accounts/views/two_factor_views.py](Backend/Capstone_Backend/accounts/views/two_factor_views.py)

### Frontend
- Axios credentials + refresh call credentials: [Frontend/Capstone-Web/src/shared/api/client.ts](Frontend/Capstone-Web/src/shared/api/client.ts)

---

## Test prerequisites

1. Backend running
2. Frontend running
3. CORS origin allowed in backend (`CORS_ALLOWED_ORIGINS`)
4. For local HTTP dev, `AUTH_COOKIE_SECURE=False` in `.env`

Recommended local cookie config:
- `AUTH_COOKIE_HTTPONLY=True`
- `AUTH_COOKIE_SECURE=False` (local HTTP only)
- `AUTH_COOKIE_SAMESITE=Lax`

For production HTTPS:
- `AUTH_COOKIE_SECURE=True`
- `AUTH_COOKIE_HTTPONLY=True`
- `AUTH_COOKIE_SAMESITE=Lax` or `None` (if cross-site requirements apply)

---

## Step-by-step: how to test

## A. Verify cookie creation and flags

1. Open app and login.
2. Open browser DevTools:
   - `Application` tab -> `Cookies` -> backend origin
3. Confirm both cookies exist:
   - `access_token`
   - `refresh_token`
4. Confirm flags/fields:
   - `HttpOnly` = true
   - `SameSite` = expected value (`Lax` by default)
   - `Secure` = true in HTTPS prod, false only for local HTTP dev
   - `Expires/Max-Age` is set (not session-only indefinite)

Expected result:
- Cookies are present and have expiry + secure flags.

---

## B. Verify frontend includes credentials

1. Open DevTools -> `Network`.
2. Trigger any authenticated API call (dashboard load, list fetch, etc.).
3. Click request -> check request config:
   - Cookies are sent by browser
   - `Authorization: Bearer ...` may also still be present (current hybrid flow)
4. Check response headers for login/refresh:
   - `Set-Cookie` appears for auth tokens

Expected result:
- Browser sends cookie credentials and processes `Set-Cookie` from backend.

---

## C. Verify refresh still works with expiry

1. Login.
2. Wait for access token to expire (or temporarily reduce lifetime in backend for fast test).
3. Trigger protected API.
4. Observe in Network:
   - initial protected request gets `401`
   - frontend calls `/api/auth/refresh-token/`
   - refresh response returns success and sets new cookie(s)
   - original request is retried and succeeds

Expected result:
- User stays logged in without manual re-login.

---

## D. Verify logout cleanup

1. Click logout in UI.
2. Check Network for logout API call.
3. Check `Application -> Cookies`:
   - `access_token` removed ✓
   - `refresh_token` removed ✓
   - `csrftoken` **persists** (normal — CSRF tokens are separate from auth) ✓
4. Try navigating to protected route.

Expected result:
- Redirect to login; no valid session remains.

**Note on CSRF token:** CSRF cookies are not authentication tokens. They protect against cross-site request forgery and are needed for all users (authenticated or not). It's correct and expected for the CSRF token to remain after logout.

---

## E. Verify expiry enforcement

1. Capture current cookies after login.
2. After expiry window, call protected endpoint.
3. If refresh token is also expired/revoked, confirm:
   - refresh fails (`401`)
   - frontend clears auth state
   - frontend redirects to login

Expected result:
- Expired/revoked sessions are not usable.

---

## Where to see it is working

- Browser cookie state:
  - DevTools -> `Application` -> `Cookies`
- Request/response behavior:
  - DevTools -> `Network` -> request headers, response headers, status codes, `Set-Cookie`
- Frontend behavior:
  - No interruption on successful refresh
  - Redirect to login on refresh failure/logout
- Backend behavior:
  - Auth endpoint logs in backend console/log file
  - Token blacklisting on logout in auth views

---

## Quick troubleshooting

1. Cookies not appearing:
- Check backend response has `Set-Cookie`
- Check frontend request uses `withCredentials`
- Check `CORS_ALLOW_CREDENTIALS=True` and allowed origin exact match

2. `Secure` cookie not stored locally:
- If running plain `http://localhost`, set `AUTH_COOKIE_SECURE=False` for dev

3. Cookies present but not sent:
- Verify frontend and backend origins and `SameSite` policy
- Check browser blocked third-party cookies settings

4. Refresh fails unexpectedly:
- Verify refresh endpoint contract and payload
- Check token revoked/expired status in backend logs

---

## Evidence checklist (for report)

Capture screenshots or exports of:
- Cookies table showing `HttpOnly`, `Secure`, `SameSite`, `Expires/Max-Age`
- Network login response with `Set-Cookie`
- Network refresh flow (`401` -> `/refresh-token/` -> retried success)
- Logout response + cookies removed
- Protected route redirect after failed refresh
