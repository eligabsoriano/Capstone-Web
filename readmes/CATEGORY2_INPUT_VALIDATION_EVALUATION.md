# Category 2: Input Validation

## Criteria

| Criteria | Checkpoint Questions | Rating |
|---|---|---|
| Server Validation | Is all input validated server-side? | ☐ None  ☐ Some  ☐ All  ☑ + Sanitization | DONE AND TESTED
| SQL Injection | Are queries protected? | ☐ Raw  ☐ Escaped  ☐ Parameterized  ☑ ORM | DONE AND TESTED
| XSS | Is output safely escaped? | ☐ None  ☐ Basic  ☐ Context aware  ☑ CSP + sanitize | DONE AND TESTED
| File Upload | Are uploads checked? | ☐ None  ☐ Type only  ☐ Type + size  ☑ + scanning | DONE AND TESTED
| API Validation | Are APIs validated? | ☐ None  ☐ Manual  ☐ Schema  ☑ Auto + feedback | DONE AND TESTED
| NoSQL Injection | Are NoSQL queries protected? | ☐ None  ☐ Filter  ☐ Param  ☑ ORM + validation | DONE AND TESTED
| CSRF | Is CSRF protection enabled? | ☐ None  ☐ Token  ☐ Sync tokens  ☑ SameSite + token | DONE AND TESTED

## How to Test Category 2

1. Server Validation: send invalid payloads (missing required fields, wrong types, invalid choice values) to endpoints such as `/api/auth/signup/`, `/api/loans/apply/`, `/api/profile/`, `/api/documents/upload/`; expect `400` with validation errors.
2. SQL Injection: send SQL-like payloads (e.g., `' OR 1=1 --`) to login/search parameters; expect no query bypass and normal validation/error responses.
3. XSS: submit `<script>alert(1)</script>` in text fields (profile/notes/description) and verify output is displayed as text, not executed script.
4. File Upload: upload unsupported type (e.g., `.exe`) and oversized file (> limit); expect rejection. Upload MIME/content-mismatched files (e.g., executable renamed to `.jpg`) and PDFs with active-content markers; expect scan rejection. Upload valid PDF/image within size; expect success.
5. API Validation: try malformed JSON and wrong data shapes for serializer-protected endpoints; expect `400` with both `errors` and structured `validation_feedback` (field/code/hint).
6. NoSQL Injection: send Mongo-like objects in request bodies where strings are expected (e.g., `{ "$ne": "" }`); expect serializer rejection/type error.
7. CSRF: fetch token via `/api/auth/csrf-token/`, confirm `Set-Cookie` includes `SameSite`, then call unsafe endpoint with cookie but without `X-CSRFToken` (expect `403`), and retry with matching `X-CSRFToken` (expect normal validation/auth response).

## Overall Readiness

- Readiness: **Mostly Ready (Good)**
- Estimated Category 2 level: **Excellent (5/5)**
- Main gaps after current improvements:
1. Optionally integrate external AV engine (e.g., ClamAV) for signature-based malware feeds.
2. Add automated security regression tests for validation, CSP, and upload scanning.
3. Add deployment runbook for CSRF/CORS trusted origins per environment.
