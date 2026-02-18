CATEGORY 2 TESTING:

### SERVER VALIDATION (INSOMNIA ONLY)
Use Insomnia for these checks. No terminal/curl needed for this section.

1) Setup in Insomnia
- Create Environment variable: `base_url = http://localhost:8000`
- Login first (`POST {{ base_url }}/api/auth/login/`) and save `access` token.
- Add header for protected endpoints: `Authorization: Bearer <ACCESS_TOKEN>`

2) Invalid Signup Payload (Schema validation)
- Method/URL: `POST {{ base_url }}/api/auth/signup/`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "bad-email",
  "password": "123",
  "first_name": "",
  "last_name": "123"
}
```
- Expected:
  - HTTP `400`
  - `status: "error"`
  - `errors` present
  - `validation_feedback` present

3) Invalid Profile Update (Field/type validation)
- Method/URL: `PUT {{ base_url }}/api/profile/`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{
  "date_of_birth": "not-a-date",
  "gender": "invalid"
}
```
- Expected:
  - HTTP `400`
  - Field-specific validation errors

4) Invalid Loan Apply Payload (Business + schema validation)
- Method/URL: `POST {{ base_url }}/api/loans/apply/`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{
  "product_id": "abc",
  "requested_amount": 10,
  "term_months": 0
}
```
- Expected:
  - HTTP `400` or `404` (depends on product existence check order)
  - No application created

5) Missing File on Upload (Required input validation)
- Method/URL: `POST {{ base_url }}/api/documents/upload/`
- Headers: `Authorization`
- Body type: `Multipart Form`
- Fields: `document_type=valid_id` (do not attach file)
- Expected:
  - HTTP `400`
  - Message similar to `"No file provided"`

6) Sanitization Check (Server-side input cleanup)
- Step A: send payload
  - Method/URL: `PUT {{ base_url }}/api/profile/`
  - Headers: `Authorization`, `Content-Type: application/json`
  - Body:
```json
{
  "address_line1": "<b>Main</b> <script>alert(1)</script> Street",
  "barangay": "  <i>Barangay 1</i>  "
}
```
- Step B: read back saved profile
  - Method/URL: `GET {{ base_url }}/api/profile/`
- Expected:
  - Stored values are sanitized/normalized (tags stripped, whitespace normalized)
  - No script content execution

7) Invalid Boolean Query Param (Strict boolean validation)
- Method/URL: `GET {{ base_url }}/api/notifications/?unread=maybe`
- Headers: `Authorization`
- Expected:
  - HTTP `400`
  - Error for `unread` boolean format

8) Invalid Enum Query Param (Strict choice validation)
- Method/URL: `GET {{ base_url }}/api/loans/applications/?status=not_a_real_status`
- Headers: `Authorization`
- Expected:
  - HTTP `400`
  - Error for invalid `status` choice


### SQL INJECTION (ORM / NO RAW SQL PATH)
curl -i -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"'\'' OR 1=1 --","password":"anything"}'

curl -i -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"'\'' OR 1=1 --"}'

curl -i -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"first_name":"test","last_name":"test","email":"test'\''; DROP TABLE users; --@mail.com","password":"Admin123!","password_confirm":"Admin123!"}'


### XSS (INSOMNIA ONLY)
Use Insomnia for these checks. No terminal/curl needed for this section.

1) Check CSP header exists and is strict
- Method/URL: `GET {{ base_url }}/api/health/`
- In Insomnia, open the response `Headers` tab.
- Expected:
  - `Content-Security-Policy` header exists
  - CSP includes strict directives like `default-src 'none'` and `script-src 'none'`
  - CSP does **not** contain `unsafe-inline` or `unsafe-eval`

2) Profile input sanitization (stored XSS check)
- Step A: send payload
  - Method/URL: `PUT {{ base_url }}/api/profile/`
  - Headers: `Authorization`, `Content-Type: application/json`
  - Body:
```json
{
  "address_line1": "<script>alert(1)</script> Main",
  "barangay": "<b>Barangay 1</b>"
}
```
- Step B: read back value
  - Method/URL: `GET {{ base_url }}/api/profile/`
- Expected:
  - HTTP `200` for both requests
  - Returned values are sanitized (no `<script>`, no HTML tags)


### FILE UPLOAD
Use this main request in Insomnia to prove scanning is active:

- Method/URL: `POST {{ base_url }}/api/documents/upload/`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`
- Body type: `Multipart Form`
- Fields:
  - `document_type=valid_id`
  - `file=<malicious test file>` (for example, fake `.jpg` with `MZ` content, or PDF with `/JavaScript`)

If scanning is working, response is `400` with messages like:
- `Potentially unsafe file content detected`
- `Potentially unsafe PDF content detected`
- `File content does not match the declared file type`


### API VALIDATION AUTO + FEEDBACK
Use Insomnia for this check. No terminal/curl needed for this section.

1) Send invalid profile payload
- Method/URL: `PUT {{ base_url }}/api/profile/`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{
  "date_of_birth": "not-a-date",
  "gender": "invalid"
}
```

2) Verify validation response structure
- Expected:
  - HTTP `400`
  - `status: "error"`
  - `errors` object exists with field-level messages
  - `validation_feedback` exists with:
    - `error_count`
    - `fields`
    - `issues` (each issue has `field`, `message`, `code`, `hint`)


### NOSQL INJECTION (INSOMNIA ONLY)
Use Insomnia for these checks. No terminal/curl needed for this section.

1) Login request with Mongo operator payload
- Method/URL: `POST {{ base_url }}/api/auth/login/`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": { "$ne": "" },
  "password": "anything"
}
```
- Expected:
  - HTTP `400`
  - `message`: `Potential NoSQL injection payload detected` (or strict type validation error)
  - `validation_feedback.issues[0].code`: `nosql_injection_detected` (when middleware catches it)

2) Loan apply with nested operator payload
- Method/URL: `POST {{ base_url }}/api/loans/apply/`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{
  "product_id": { "$ne": "" },
  "requested_amount": { "$gt": 1000 },
  "term_months": 12
}
```
- Expected:
  - HTTP `400`
  - Request rejected before query execution


### CSRF SAME-SITE + TOKEN
Use Insomnia for this check. No terminal/curl needed for this section.

1) Get CSRF token and cookie
- Method/URL: `GET {{ base_url }}/api/auth/csrf-token/`
- Expected:
  - HTTP `200`
  - Response body contains `data.csrf_token`
  - Response includes `Set-Cookie` for `csrftoken`
  - `Set-Cookie` contains `SameSite` (for example `Lax`)

2) Send unsafe request without `X-CSRFToken` (with cookie present)
- Method/URL: `POST {{ base_url }}/api/auth/signup/`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "bad-email",
  "password": "123",
  "first_name": "",
  "last_name": "123"
}
```
- Important:
  - Keep Insomnia cookie jar enabled so `csrftoken` cookie is sent automatically.
  - Do not add `X-CSRFToken` header in this step.
- Expected:
  - HTTP `403`
  - Error code like `csrf_token_missing`

3) Retry with matching CSRF header
- Same request as step 2, but add header:
  - `X-CSRFToken: <csrf_token_from_step_1>`
- Expected:
  - CSRF check passes (not `403`)
  - Endpoint returns normal validation/auth response (for this invalid signup payload, expect `400` validation error)
  
