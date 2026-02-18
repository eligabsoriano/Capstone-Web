# Category 2: Input Validation

## Criteria

| Criteria | Checkpoint Questions | Rating |
|---|---|---|
| Server Validation | Is all input validated server-side? | ☐ None  ☐ Some  ☑ All  ☐ + Sanitization |
| SQL Injection | Are queries protected? | ☐ Raw  ☐ Escaped  ☐ Parameterized  ☑ ORM |
| XSS | Is output safely escaped? | ☐ None  ☐ Basic  ☑ Context aware  ☐ CSP + sanitize |
| File Upload | Are uploads checked? | ☐ None  ☐ Type only  ☑ Type + size  ☐ + scanning |
| API Validation | Are APIs validated? | ☐ None  ☐ Manual  ☑ Schema  ☐ Auto + feedback |
| NoSQL Injection | Are NoSQL queries protected? | ☐ None  ☐ Filter  ☐ Param  ☑ ORM + validation |
| CSRF | Is CSRF protection enabled? | ☐ None  ☑ Token  ☐ Sync tokens  ☐ SameSite + token |

## How to Test Category 2

1. Server Validation: send invalid payloads (missing required fields, wrong types, invalid choice values) to endpoints such as `/api/auth/signup/`, `/api/loans/apply/`, `/api/profile/`, `/api/documents/upload/`; expect `400` with validation errors.
2. SQL Injection: send SQL-like payloads (e.g., `' OR 1=1 --`) to login/search parameters; expect no query bypass and normal validation/error responses.
3. XSS: submit `<script>alert(1)</script>` in text fields (profile/notes/description) and verify output is displayed as text, not executed script.
4. File Upload: upload unsupported type (e.g., `.exe`) and oversized file (> limit); expect rejection. Upload valid PDF/image within size; expect success.
5. API Validation: try malformed JSON and wrong data shapes for serializer-protected endpoints; expect schema validation errors.
6. NoSQL Injection: send Mongo-like objects in request bodies where strings are expected (e.g., `{ "$ne": "" }`); expect serializer rejection/type error.
7. CSRF: verify CSRF middleware is active and confirm unsafe requests follow your chosen token/JWT strategy without bypassing auth protections.

## Overall Readiness

- Readiness: **Mostly Ready (Good)**
- Estimated Category 2 level: **Good (4/5)**
- Main gaps before “Excellent”:
1. Add explicit input sanitization library/path for risky rich-text fields (if any are introduced).
2. Add malware/content scanning for file uploads (beyond MIME + size checks).
3. Document explicit CSRF approach for JWT API usage and same-site policy in deployment notes.
