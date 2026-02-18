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


### XSS
# 1) Check CSP header exists and is strict
  curl -i http://localhost:8000/api/health/
# 2) Quick grep to confirm unsafe directives are gone
  curl -s -D - http://localhost:8000/api/health/ -o /dev/null | grep -i content-security-policy
# 3) Negative check (should print nothing)
  curl -s -D - http://localhost:8000/api/health/ -o /dev/null | grep -Ei "unsafe-inline|unsafe-eval"
# 4) For CSP + sanitize proof (XSS criterion), also re-run sanitize test:
  curl -s -X PUT http://localhost:8000/api/profile/ \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"address_line1":"<script>alert(1)</script> Main","barangay":"<b>Barangay 1</b>"}'

  curl -s http://localhost:8000/api/profile/ \
    -H "Authorization: Bearer <ACCESS_TOKEN>"


### FILE UPLOAD
# 0) login and copy access token
curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"sorianoeligabriel@gmail.com","password":"Admin123!"}'

# 1) Create fake executable disguised as jpg (should FAIL) EXPECTED 400 WITH
printf 'MZ fake executable content' > /tmp/fake.jpg

curl -i -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer TOKEN" \
  -F "document_type=valid_id" \
  -F "file=@/tmp/fake.jpg;type=image/jpeg"

# 2) Create suspicious PDF with JavaScript marker (should FAIL) Expected: 400 with Potentially unsafe PDF content detected.
cat > /tmp/bad.pdf <<'EOF'
%PDF-1.7
1 0 obj
<< /Type /Catalog /OpenAction << /S /JavaScript /JS (app.alert("xss")) >> >>
endobj
%%EOF
EOF

curl -i -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer TOKEN" \
  -F "document_type=valid_id" \
  -F "file=@/tmp/bad.pdf;type=application/pdf"

# 3) Upload a real valid file (should PASS) insomnia
curl -i -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer TOKEN" \
  -F "document_type=valid_id" \
  -F "file='/Users/gab/Downloads/SUCCESS LADDER(2).jpeg';type=image/jpeg"


### API VALIDATION AUTO + FEEDBACK
curl -s -X PUT http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date_of_birth":"not-a-date","gender":"invalid"}'


### NOSQL INJECTION (ORM + VALIDATION)
curl -i -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":""},"password":"anything"}'

curl -i -X POST http://localhost:8000/api/loans/apply/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"product_id":{"$ne":""},"requested_amount":{"$gt":1000},"term_months":12}'

curl -i -X PUT http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"gender":{"$ne":"male"},"civil_status":"single"}'


### CSRF SAME-SITE + TOKEN
curl -i -c /tmp/csrf_cookies.txt http://localhost:8000/api/auth/csrf-token/

CSRF_TOKEN=$(grep csrftoken /tmp/csrf_cookies.txt | awk '{print $7}')

curl -i -b /tmp/csrf_cookies.txt -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email","password":"123","first_name":"","last_name":"123"}'

curl -i -b /tmp/csrf_cookies.txt -X POST http://localhost:8000/api/auth/signup/ \
  -H "X-CSRFToken: ${CSRF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email","password":"123","first_name":"","last_name":"123"}'


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
