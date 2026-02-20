# Connection Security (Valid TLS) Testing Guide

## Goal

Prove this criterion with evidence:

`| Connection Security | Are connections encrypted? | ☐ Plain ☐ Self-signed ☑ Valid TLS ☐ mTLS + pinning |`

For your project, test these paths:
1. Backend -> MongoDB Atlas
2. Client (frontend/Insomnia/browser) -> Backend API
3. Frontend config -> API URL scheme

## Current config references

- Backend DB URI comes from env: `backend/config/settings.py`
- Frontend API base URL comes from env: `src/shared/api/client.ts`
- Your env currently uses Atlas SRV URI in `backend/.env` (`MONGODB_URI=mongodb+srv://...`)

## Prerequisites

Install required tools on macOS:

```bash
brew install openssl
brew install bind
```

Optional but useful:

```bash
brew install curl
```

## Test 1: Backend -> MongoDB uses TLS with valid cert

From `backend/`:

```bash
python manage.py shell -c "from django.conf import settings; print(settings.MONGODB_URI)"
```

Pass checks:
- URI starts with `mongodb+srv://` (Atlas SRV + TLS by default).

Now run a strict TLS connection test (no invalid certs allowed):

```bash
python manage.py shell -c "from django.conf import settings; from pymongo import MongoClient; c=MongoClient(settings.MONGODB_URI, tls=True, tlsAllowInvalidCertificates=False, serverSelectionTimeoutMS=8000); print(c.admin.command('ping'))"
```

Pass checks:
- Command succeeds and prints a ping response (e.g., `{'ok': 1.0, ...}`).
- No TLS/certificate exception.

## Test 2: Inspect Atlas server certificate chain

From `backend/`, extract SRV host and resolve real Mongo nodes:

```bash
CLUSTER_HOST=$(python manage.py shell -c "from django.conf import settings; import re; m=re.search(r'@([^/?]+)', settings.MONGODB_URI or ''); print(m.group(1) if m else '')")
dig +short SRV _mongodb._tcp.${CLUSTER_HOST}
```

Pick one host from the `dig` output (last column) and run:

```bash
openssl s_client -connect <mongo-node-host>:27017 -servername <mongo-node-host> -verify_return_error </dev/null 2>/dev/null | grep -E "subject=|issuer=|Verify return code"
```

Pass checks:
- `Verify return code: 0 (ok)`
- certificate subject/issuer present

## Test 3: Client -> Backend API uses valid HTTPS cert

Use your deployed backend URL (not localhost):

```bash
curl -Iv https://<your-backend-domain>/api/health/
```

Pass checks:
- TLS handshake succeeds
- No certificate trust error
- HTTP response returned

Also check HTTP to HTTPS redirect:

```bash
curl -I http://<your-backend-domain>/api/health/
```

Pass check:
- Redirect to `https://...` (301/302/307/308), or HTTP blocked by platform policy.

## Test 4: Frontend is configured to call HTTPS API

From project root:

```bash
cat .env | grep VITE_API_URL
```

Pass checks:
- In production/staging, `VITE_API_URL` must start with `https://`
- `http://localhost:8000` is acceptable only for local development

Also verify runtime calls in browser DevTools:
- Open Network tab
- Confirm API requests use `https://...`
- Confirm no mixed-content warnings

## Evidence checklist (for report/rubric)

Capture and store:
1. `ping` strict TLS test output
2. `openssl s_client` output showing `Verify return code: 0 (ok)`
3. `curl -Iv https://.../api/health/` output
4. `curl -I http://...` redirect output
5. `VITE_API_URL` value and screenshot of HTTPS API calls in browser

## Interpretation

Mark `☑ Valid TLS` when all are true:
- MongoDB connection succeeds with strict cert validation
- Backend public HTTPS cert validates successfully
- Frontend calls backend over HTTPS in non-local environments

Do not mark `mTLS + pinning` unless you explicitly implement:
- mutual TLS cert auth between peers, and/or
- certificate pinning in client applications.
