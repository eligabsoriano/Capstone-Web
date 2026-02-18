CATEGORY 2 TESTING:

### SERVER VALIDATION
curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"sorianoeligabriel@gmail.com",
    "password":"Admin123!"
  }'

curl -i -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email","password":"123","first_name":"","last_name":"123"}'

curl -i -X PUT http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date_of_birth":"not-a-date","gender":"invalid"}'

curl -i -X POST http://localhost:8000/api/loans/apply/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"abc","requested_amount":10,"term_months":0}'

curl -i -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "document_type=valid_id"

(sanitization test)
curl -s -X PUT http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "address_line1":"<b>Main</b> <script>alert(1)</script> Street",
    "barangay":"  <i>Barangay 1</i>  "
  }'

curl -s http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"


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
