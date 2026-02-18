# Category 2: Input Validation

## Criteria

| Criteria | Checkpoint Questions | Rating |
|---|---|---|
| Server Validation | Is all input validated server-side? | ☐ None  ☐ Some  ☑ All  ☑ + Sanitization |
| SQL Injection | Are queries protected? | ☐ Raw  ☐ Escaped  ☐ Parameterized  ☑ ORM |
| XSS | Is output safely escaped? | ☐ None  ☐ Basic  ☐ Context aware  ☑ CSP + sanitize |
| File Upload | Are uploads checked? | ☐ None  ☐ Type only  ☐ Type + size  ☑ + scanning |
| API Validation | Are APIs validated? | ☐ None  ☐ Manual  ☐ Schema  ☑ Auto + feedback |
| NoSQL Injection | Are NoSQL queries protected? | ☐ None  ☐ Filter  ☐ Param  ☑ ORM + validation |
| CSRF | Is CSRF protection enabled? | ☐ None  ☐ Token  ☐ Sync tokens  ☑ SameSite + token |

## How to Test Category 2

1. Server Validation: send invalid payloads (missing required fields, wrong types, invalid choice values) to endpoints such as `/api/auth/signup/`, `/api/loans/apply/`, `/api/profile/`, `/api/documents/upload/`; expect `400` with validation errors.
2. SQL Injection: send SQL-like payloads (e.g., `' OR 1=1 --`) to login/search parameters; expect no query bypass and normal validation/error responses.
3. XSS: submit `<script>alert(1)</script>` in text fields (profile/notes/description) and verify output is displayed as text, not executed script.
4. File Upload: upload unsupported type (e.g., `.exe`) and oversized file (> limit); expect rejection. Upload MIME/content-mismatched files (e.g., executable renamed to `.jpg`) and PDFs with active-content markers; expect scan rejection. Upload valid PDF/image within size; expect success.
5. API Validation: try malformed JSON and wrong data shapes for serializer-protected endpoints; expect `400` with both `errors` and structured `validation_feedback` (field/code/hint).
6. NoSQL Injection: send Mongo-like objects in request bodies where strings are expected (e.g., `{ "$ne": "" }`); expect `400` from centralized NoSQL guard (`nosql_injection_detected`) or serializer type rejection.
7. CSRF: fetch token via `/api/auth/csrf-token/`, confirm `Set-Cookie` includes `SameSite`, then call unsafe endpoint with cookie but without `X-CSRFToken` (expect `403`), and retry with matching `X-CSRFToken` (expect normal validation/auth response).

## Overall Readiness

- Readiness: **Ready (Excellent)**
- Estimated Category 2 level: **Excellent (5/5)**
- Final notes:
1. Manual endpoints were hardened to strict type/range/enum validation with explicit `400` responses.
2. XSS hardening now covers serializer paths and manual write paths (including admin loan officer updates), with CSP enforced at middleware level.
3. Untrusted metadata and generated text are sanitized before persistence/response (uploaded filenames, AI chat responses, AI qualification reasoning/lists).
4. Validation error responses now normalize manual and serializer errors into structured `errors` + `validation_feedback` for consistent API feedback.
5. Added centralized API middleware that blocks Mongo operator-style keys (`$...`) and dotted keys in incoming payloads before view execution, strengthening NoSQL injection defense-in-depth.
6. Keep running regression tests after every endpoint change to preserve `All + Sanitization` coverage.
