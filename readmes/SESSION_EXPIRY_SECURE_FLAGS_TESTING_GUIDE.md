# Session Expiry + Secure Flags Testing Guide

Last updated: February 18, 2026

## 1. Objective

Validate Category 1 Session Management end-to-end:
- Sessions expire correctly.
- Cookies use secure flags (`HttpOnly`, `SameSite`, `Secure`).
- Frontend uses cookie-based authenticated requests.
- Logout and refresh behavior are correct.

## 2. Rubric Target

Target checkpoint:

`| Session Management | Do sessions expire and use secure flags? | ☐ None  ☐ No expiry  ☐ Expiry set  ☑ Expiry + secure flags |`

## 3. Implementation Coverage

Backend:
- Cookie set/clear/token extraction: `backend/accounts/utils/auth_cookies.py`
- Auth cookies on login/refresh/logout:
  - `backend/accounts/views/auth_views.py`
  - `backend/accounts/views/admin_views.py`
  - `backend/accounts/views/loan_officer_views.py`
  - `backend/accounts/views/two_factor_views.py`
- Cookie-aware authentication fallback: `backend/accounts/authentication.py`
- Cookie security defaults and env flags: `backend/config/settings.py`

Frontend:
- Credentialed requests + CSRF header + refresh flow: `src/shared/api/client.ts`
- Login/2FA/logout flows without storing auth tokens in localStorage:
  - `src/features/auth/hooks/useLogin.ts`
  - `src/features/auth/components/Verify2FAPage.tsx`
  - `src/features/auth/hooks/useLogout.ts`
  - `src/features/auth/api/authApi.ts`

## 4. Test Profiles

Use both profiles to claim full compliance.

### Profile A: Local Development (HTTP)

Use this to verify flow behavior quickly.

Recommended env:
- `DEBUG=True`
- `AUTH_COOKIE_HTTPONLY=True`
- `AUTH_COOKIE_SAMESITE=Lax`
- `AUTH_COOKIE_SECURE=False`

Expected result:
- Expiry verified.
- Secure flags partially visible (`Secure` false due to HTTP).

### Profile B: Production-like (HTTPS)

Use this to prove final secure flags.

Recommended env:
- `DEBUG=False`
- `AUTH_COOKIE_HTTPONLY=True`
- `AUTH_COOKIE_SAMESITE=Lax` (or `None` if cross-site policy requires it)
- `AUTH_COOKIE_SECURE=True`

Expected result:
- Expiry verified.
- `HttpOnly`, `SameSite`, `Secure` all enforced.

## 5. Pre-Test Checklist

1. Backend is running and reachable.
2. Frontend is running and reachable.
3. Frontend origin is listed in `CORS_ALLOWED_ORIGINS`.
4. `CORS_ALLOW_CREDENTIALS=True`.
5. Browser DevTools available (`Application/Storage`, `Network`, `Console`).
6. Insomnia cookie jar enabled for API cross-check tests.

## 6. Frontend Test Cases (Primary)

### F-01 Login sets auth cookies

Steps:
1. Open frontend login page.
2. Login using valid credentials.
3. Open DevTools -> Network -> login request.
4. Open DevTools -> Application/Storage -> Cookies.

Expected:
- Login request is `200`.
- Response includes `Set-Cookie` for `access_token` and `refresh_token`.
- Cookie attributes show:
  - `HttpOnly=true`
  - `SameSite=<configured>`
  - `Max-Age/Expires` present
  - `Secure=true` in HTTPS profile

### F-02 Frontend does not rely on localStorage auth tokens

Steps:
1. After successful login, open DevTools Console.
2. Execute:
   - `localStorage.getItem("access_token")`
   - `localStorage.getItem("refresh_token")`

Expected:
- Both return `null` (or no active value).
- Session still works using cookies.

### F-03 Protected calls succeed via cookie auth

Steps:
1. From authenticated UI, trigger protected API calls (dashboard, data list, profile fetch).
2. Inspect request headers in Network.

Expected:
- Requests succeed (`200` range).
- Browser sends cookies.
- No `Authorization: Bearer` header is required.

### F-04 CSRF protection on unsafe methods

Steps:
1. Trigger a POST/PUT/PATCH/DELETE action in UI.
2. Inspect request headers.

Expected:
- Request includes `X-CSRFToken`.
- If CSRF is missing/invalid, backend rejects with `403`.

### F-05 Access-token expiry and automatic refresh

Steps:
1. Login.
2. Wait until access token expires (default around 10 minutes), or use shortened lifetimes for fast test.
3. Trigger a protected action.
4. Observe sequence in Network.

Expected:
- Original request returns `401`.
- Frontend calls `/api/auth/refresh-token/`.
- Refresh returns `200` and sets new auth cookies.
- Original request is retried and succeeds.
- User remains logged in.

### F-06 Refresh failure forces sign-out path

Steps:
1. Login.
2. Invalidate refresh token (logout from another session, manual revocation, or wait for refresh expiry).
3. Trigger protected action.

Expected:
- Refresh attempt fails (`401`/error).
- Frontend clears auth state.
- Frontend redirects to `/login`.

### F-07 Logout fully invalidates browser session

Steps:
1. Login.
2. Click frontend logout.
3. Check Network logout response.
4. Check cookie storage.
5. Try protected route again.

Expected:
- Logout API succeeds.
- `access_token` and `refresh_token` are removed/invalidated.
- Protected route redirects to login or receives `401`.
- `csrftoken` may remain (normal and expected).

### F-08 Page reload persistence

Steps:
1. Login.
2. Reload browser tab.
3. Navigate to protected page.

Expected:
- Session remains valid while cookies are valid.
- App stays authenticated without re-login.

## 7. Insomnia/API Cross-Check Cases (Secondary)

Use this to validate backend behavior independently from UI.

### I-01 Login cookie flags

1. `POST /api/auth/csrf-token/` or `GET /api/auth/csrf-token/` as needed.
2. `POST /api/auth/admin/login/` or `/api/auth/loan-officer/login/`.
3. Inspect response cookies in Insomnia cookie jar.

Expected:
- `access_token`, `refresh_token` set with expected attributes.

### I-02 Protected endpoint without Bearer header

1. Keep cookie jar enabled.
2. Call a protected endpoint without manual `Authorization` header.

Expected:
- Request succeeds using cookie session.

### I-03 Refresh with cookie only

1. `POST /api/auth/refresh-token/` with cookie jar and CSRF header.

Expected:
- `200` and token cookies rotated.

### I-04 Logout invalidates same session

1. `POST /api/auth/admin/logout/` or `/api/auth/loan-officer/logout/`.
2. Retry protected endpoint.

Expected:
- Protected call is rejected (`401`/`403`).

## 8. Expected Output Summary

Pass indicators:
- Login sets both auth cookies with expiry.
- Protected requests work via cookie credentials.
- Expired access token triggers refresh and retry success.
- Logout invalidates session.
- HTTPS profile shows `Secure=true`.

Fail indicators:
- Auth depends on localStorage bearer token.
- Cookies are missing expiry.
- Refresh does not rotate/renew session.
- Logout does not block subsequent protected access.
- Production/HTTPS does not enforce `Secure`.

## 9. Evidence Pack for Submission

Capture screenshots or logs for:
1. Login response headers showing `Set-Cookie`.
2. Cookie table showing `HttpOnly`, `SameSite`, `Secure`, `Expires/Max-Age`.
3. Network sequence for expiry refresh:
   - protected request `401`
   - `/api/auth/refresh-token/` success
   - retried protected request success
4. Logout request and post-logout protected request rejection.
5. Console showing `localStorage.getItem("access_token")` and `localStorage.getItem("refresh_token")` are `null`.
6. HTTPS proof where `Secure=true`.

## 10. Troubleshooting Map

Problem: Cookies not stored  
Check: `withCredentials`, `CORS_ALLOW_CREDENTIALS`, exact origin match, response `Set-Cookie`.

Problem: `Secure` flag missing  
Check: You are likely on HTTP or `DEBUG=True`. Validate again in HTTPS with production settings.

Problem: CSRF errors on POST  
Check: `X-CSRFToken` header present and matches `csrftoken` cookie.

Problem: Refresh loop or unexpected logout  
Check: Refresh endpoint status, cookie jar updates, and whether refresh token was blacklisted/expired.

## 11. Final Rubric Decision Rule

Mark `☑ Expiry + secure flags` only when:
1. Expiry is confirmed (`Max-Age/Expires` and runtime behavior).
2. Cookie flags are confirmed in HTTPS (`HttpOnly`, `SameSite`, `Secure`).
3. Session renewal and invalidation behavior pass (`refresh` and `logout` tests).
