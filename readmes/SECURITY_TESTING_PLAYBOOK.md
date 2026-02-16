# Security Testing Playbook

Last updated: February 16, 2026

## Scope

This playbook covers:
1. Static/dependency/security baseline checks
2. OWASP ZAP baseline DAST
3. Manual high-value attack tests (IDOR, XSS, tampered token, upload abuse, rate limiting, network edge cases)
4. Evidence collection for reporting

---

## 1. Pre-Run Setup

Run all commands from project root unless stated otherwise:

```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
```

### 1.1 Standard Local Run (Manual Security Tests)

Use this for EDGE tests and manual attack tests. This is the normal flow.

1. Backend (terminal A)
```bash
cd backend
python manage.py runserver
```

2. Frontend (terminal B)
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev
```

### 1.2 Optional: Docker + ZAP Setup

Only do this if you will run OWASP ZAP in Docker.

Why this exists:
1. Docker accesses your frontend via `host.docker.internal`.
2. Vite can block unknown Host headers and return `403 Forbidden`.
3. `allowedHosts` tells Vite to trust `host.docker.internal`.

If you use ZAP Docker scan, run frontend like this:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm run dev -- --host 0.0.0.0 --port 5173
```

If Docker still gets `HTTP 403`, add this in `vite.config.ts`:
```ts
server: {
  host: "0.0.0.0",
  port: 5173,
  strictPort: true,
  allowedHosts: ["host.docker.internal"],
},
```
Then restart frontend.

---

## 2. Automated Checks

### 2.1 Django deploy checks

```bash
cd backend
python manage.py check --deploy
```

### 2.2 Dependency checks (recommended)

Frontend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
npm audit
```

Backend:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/backend
pip-audit
```

### 2.3 OWASP ZAP baseline (DAST)

Use current image (old `owasp/zap2docker-stable` is deprecated/non-existent).

This section requires completing **1.2 Optional: Docker + ZAP Setup** first.

Quick run commands (copy-paste):
```bash
docker run --rm --add-host=host.docker.internal:host-gateway curlimages/curl:8.6.0 -I http://host.docker.internal:5173
```

justinmcnealcaronongan@Justins-MacBook-Air-2 ~ % docker run --rm --add-host=host.docker.internal:host-gateway curlimages/curl:8.6.0 -I http://host.docker.internal:5173

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0HTTP/1.1 200 OK
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
Vary: Origin
Content-Type: text/html
Cache-Control: no-cache
Etag: W/"268-90jzwwiJe9XAwKqMKFqPKWDyAK0"
Date: Mon, 16 Feb 2026 06:51:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5

justinmcnealcaronongan@Justins-MacBook-Air-2 ~ % 

this just means that docker can now access frontend



```bash
docker run --rm -t \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd):/zap/wrk/:rw" \
  zaproxy/zap-stable \
  zap-baseline.py -t http://host.docker.internal:5173 -r zap-report.html
```

```bash
open zap-report.html
```

1. Verify frontend reachability from Docker:
```bash
docker run --rm --add-host=host.docker.internal:host-gateway curlimages/curl:8.6.0 -I http://host.docker.internal:5173
```

Expected: HTTP status from Vite (ideally `200`).

2. Run ZAP baseline scan:
```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
docker run --rm -t \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd):/zap/wrk/:rw" \
  zaproxy/zap-stable \
  zap-baseline.py -t http://host.docker.internal:5173 -r zap-report.html
```

3. Output report:
```bash
open /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web/zap-report.html
```

Fallback target if host alias issues persist:
1. Get LAN IP:
```bash
ipconfig getifaddr en0
```
2. Use `http://<LAN_IP>:5173` in `zap-baseline.py -t ...`.

---

## 3. Manual High-Value Attack Tests

## 3.1 Tampered Token (EDGE-008)

1. Login normally.
2. DevTools -> Application -> Local Storage.
3. Set both:
   - `access_token = invalid.token.test`
   - `refresh_token = invalid.token.test`
4. Trigger protected API call (dashboard refresh / audit logs).
5. Expected:
   - auth failure
   - logout or redirect to `/login`.

## 3.2 IDOR (Insecure Direct Object Reference)

Goal: ensure user cannot access another user's resources by swapping IDs.

Tools: browser DevTools (Network -> Replay/XHR), Postman, or curl.

Test examples:
1. Change `application_id` in officer/admin detail endpoints.
2. Change `notification_id` in `POST /api/notifications/{id}/read/`.
3. Change loan/document IDs in protected endpoints.

Expected:
1. `403` or `404`
2. No unauthorized data in response.

## 3.3 Stored XSS

Use fields that are stored then rendered:
1. Notes
2. Rejection reason
3. Description-like text fields

Payloads:
1. `<script>alert('xss')</script>`
2. `<img src=x onerror=alert('xss2')>`

Expected:
1. No JS execution (no popup)
2. Value displayed as plain text/escaped
3. Session remains intact (no forced logout).

## 3.4 Upload Abuse

Try:
1. Wrong MIME/file extension
2. Oversized file
3. Double extension (`file.pdf.exe`)

Expected:
1. Validation rejection
2. Clear error message
3. No server crash.

## 3.5 Rate Limiting

Targets:
1. Login
2. OTP verify/resend

Method:
1. Rapidly repeat invalid attempts.

Expected:
1. `429 Too Many Requests`
2. UI shows throttle wait message.

## 3.6 Offline/Reconnect/Timeout (EDGE tests)

1. Offline Mode:
   - DevTools Network -> Offline
   - Trigger API call
   - Expected: in-app offline banner/message shown.
2. Reconnection:
   - Return Online
   - Expected: app recovers and data refetches/retries.
3. Timeout:
   - Simulate very slow backend/network
   - Expected: timeout/error handling shown.

Note: Query Devtools `Trigger Error` is synthetic; use network throttling/delays for realistic timeout tests.

---

## 4. Evidence Collection

For each test case, save:
1. Screenshot/video of steps and result
2. Request/response details (status code, payload, headers if relevant)
3. Logs (frontend console + backend server logs)
4. Artifacts:
   - `zap-report.html`
   - `npm audit` output
   - `pip-audit` output
   - `manage.py check --deploy` output

Use this result table format:

| Test ID | Result | Evidence Path | Notes |
|---------|--------|---------------|-------|
| EDGE-008 | PASS/FAIL | `readmes/evidence/...` | ... |

---

## 5. Reporting Guidance

Do not claim "100% secure".

Use this language:
1. "Tested against defined threat scenarios"
2. "No exploitable findings observed in tested scope"
3. "Residual risks remain for untested scenarios"

Track residual risks explicitly:
1. Not tested in production-like scale
2. Third-party dependency zero-days
3. Business logic abuse cases not yet covered
