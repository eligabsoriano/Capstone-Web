# Category 1: Authentication

## Criteria

| Criteria | Checkpoint Questions | Rating |
|---|---|---|
| Password Storage | Are passwords hashed securely? | ☐ Plaintext  ☐ MD5/SHA1  ☑ bcrypt/Argon2  ☐ bcrypt + salt/pepper |
| Session Management | Do sessions expire and use secure flags? | ☐ None  ☐ No expiry  ☐ Expiry set  ☑ Expiry + secure flags |
| Error Handling | Do login errors leak info? | ☐ Leaks  ☐ Inconsistent  ☑ Generic  ☐ Generic + logs |
| Brute Force Protection | Are login attempts limited? | ☐ None  ☐ Counting  ☑ Rate limit  ☐ Rate + CAPTCHA |
| MFA / 2FA | Is MFA enforced? | ☐ None  ☐ Planned  ☑ Optional  ☐ Mandatory (admin) |
| Token Security | Are auth tokens validated? | ☐ None  ☐ Basic  ☐ JWT validated  ☑ Short-lived + refresh |
| Password Policy | Is there a strong password policy? | ☐ None  ☑ Length  ☐ Length + complexity  ☐ + expiration |
| Logout / Inactivity | Does logout destroy the session? | ☐ None  ☐ Partial  ☑ Invalidate  ☐ Auto timeout |

## Extra Credit

| Criteria | Checkpoint Questions | Rating |
|---|---|---|
| Advanced Authentication | Advanced authentication used? | ☑ None  ☐ OAuth/SSO  ☐ Biometrics  ☐ Hardware/passkeys |

## How to Test Category 1

Detailed session/cookie verification guide: [SESSION_EXPIRY_SECURE_FLAGS_TESTING_GUIDE.md](SESSION_EXPIRY_SECURE_FLAGS_TESTING_GUIDE.md)

1. Password Storage: register a user password, then verify DB value is bcrypt hash (not plaintext).
2. Session Management: login, decode JWT and verify `exp`; after expiry, call protected API and expect 401.
3. Error Handling: attempt login with invalid email and invalid password; check if messages are generic/consistent.
4. Brute Force Protection: repeatedly submit failed logins until rate limit/lockout is triggered.
5. MFA/2FA: enable 2FA, login again, ensure app requires `temp_token` + TOTP/backup code before access tokens.
6. Token Security: tamper with token or reuse blacklisted token, then call protected endpoint and expect rejection.
7. Password Policy: try weak passwords in signup/change/reset and verify validation error.
8. Logout/Inactivity: login, call logout, retry same token and confirm it is invalid.

## Overall Readiness

- Readiness: **Mostly Ready (Good)**
- Estimated Category 1 level: **Good (4/5)**, around **24/30**
- Main gaps before “Excellent”:
1. Standardize customer login errors to be fully generic.
2. Add explicit throttle classes for admin and loan-officer login endpoints.
3. Align refresh token response contract (`access` vs `access_token`) for stable frontend refresh handling.
