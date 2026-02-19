# Category 2: Input Validation - Testing Guide

## 1. Server Validation (All + Sanitization) ✅ DONE INSOMNIA

### Rating: **☑ All + Sanitization**

**What it proves:** All input is validated server-side with automatic sanitization of dangerous content.

### Test Case: Profile Update with XSS and Invalid Data

**Testing Method:** Insomnia (API tool required)

**Steps:**

1. **Login first** (to get access token):
   ```
   POST http://localhost:8000/api/auth/login/
   Content-Type: application/json
   
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
   Save the `access` token from response.

2. **Send malicious + invalid profile data**:
   ```
   PUT http://localhost:8000/api/profile/
   Authorization: Bearer <ACCESS_TOKEN>
   Content-Type: application/json
   
   {
     "address_line1": "<script>alert('XSS')</script>Main St",
     "barangay": "  <b>Barangay</b>  ",
     "date_of_birth": "not-a-date",
     "gender": "invalid-gender"
   }
   ```

**Expected Result:**

```json
{
  "status": "error",
  "message": "Invalid data provided",
  "errors": {
    "date_of_birth": "Date format: YYYY-MM-DD",
    "gender": "Invalid choice. Choose: male, female, other, prefer_not_to_say"
  },
  "validation_feedback": {
    "error_count": 2,
    "fields": ["date_of_birth", "gender"],
    "issues": [...]
  }
}
```

3. **Verify sanitization - send valid data**:
   ```
   PUT http://localhost:8000/api/profile/
   Authorization: Bearer <ACCESS_TOKEN>
   Content-Type: application/json
   
   {
     "address_line1": "<script>alert('XSS')</script>Main St",
     "barangay": "  <b>Barangay</b>  ",
     "date_of_birth": "1990-01-01",
     "gender": "male"
   }
   ```

4. **Read back the profile**:
   ```
   GET http://localhost:8000/api/profile/
   Authorization: Bearer <ACCESS_TOKEN>
   ```

**Expected Result:**

```json
{
  "status": "success",
  "data": {
    "address_line1": "Main St",  // XSS tags removed
    "barangay": "Barangay",       // HTML stripped, whitespace normalized
    ...
  }
}
```

**Proof of Implementation:**
- ❌ Invalid data types/enums → **400 error** with field-specific messages
- ✅ Valid data but with HTML/scripts → **200 success** but content **sanitized**
- 📍 Code location: `accounts/serializers/profile_serializers.py` (InputSanitizationMixin)

**Browser vs API Tool:** ⚠️ **API tool required** (Insomnia/Postman) - Easier to craft malicious payloads

---

## 2. SQL Injection (ORM) ✅ DONE TESTING IN WEB

### Rating: **☑ ORM**

**What it proves:** No raw SQL queries; all database operations use ORM (MongoDB w/ PyMongo).

### Test Case: Login with SQL Injection Payloads

**Testing Method:** Browser DevTools or Insomnia

**Steps:**

**Option A - Browser (DevTools):**

1. Open browser to `http://localhost:5173/auth/login`
2. Open DevTools → Network tab
3. Enter credentials:
   - Email: `' OR 1=1 --`
   - Password: `anything`
4. Submit and observe network request

**What happens:**
- The payload `' OR 1=1 --` is treated as a **literal string**
- MongoDB query looks for exact match: `{email: "' OR 1=1 --"}`
- No user exists with that email → login fails safely
- **No SQL syntax is ever interpreted**
✅ **Pass if:** Response is 400/401 with `"Invalid credentials"` error

---

## 3. XSS (CSP + Sanitization) ✅

### Rating: **☑ CSP + sanitize**

**What it proves:** Content Security Policy headers block script execution + server sanitizes dangerous input.

### Test Case: CSP Header Verification + Stored XSS Prevention

**Testing Method:** Browser DevTools + Insomnia

**Part 1: Verify CSP Headers (Insomnia)**

**Steps:**

```
GET http://localhost:8000/api/health/
```

In Insomnia → Response → **Headers** tab

**Expected Headers:**

```
Content-Security-Policy: default-src 'none'; script-src 'none'; style-src 'none'; img-src 'self' data:; font-src 'none'; connect-src 'self'; frame-src 'none'; ...
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

**Part 2: Test Stored XSS Prevention (Insomnia)**

**Steps:**

1. **Inject XSS payload**:
   ```
   PUT http://localhost:8000/api/profile/
   Authorization: Bearer <ACCESS_TOKEN>
   Content-Type: application/json
   
   {
     "address_line1": "<script>alert('XSS')</script><img src=x onerror=alert(1)>",
     "barangay": "<iframe src='javascript:alert(1)'></iframe>"
   }
   ```

2. **Read back the data**:
   ```
   GET http://localhost:8000/api/profile/
   Authorization: Bearer <ACCESS_TOKEN>
   ```

**Expected Result:**

```json
{
  "status": "success",
  "data": {
    "address_line1": "",  // Dangerous tags completely removed
    "barangay": "",       // iframe stripped
    ...
  }
}
```

**Proof of Implementation:**
- **CSP headers** prevent inline script execution
- **Server-side sanitization** removes `<script>`, `<iframe>`, event handlers
- **Defense in depth**: Even if XSS gets stored, CSP prevents execution
- 📍 Code location: 
  - `config/middleware.py` → SecurityHeadersMiddleware (CSP)
  - `accounts/serializers/mixins.py` → InputSanitizationMixin

**Browser vs API Tool:** ⚠️ **API tool recommended** for payload crafting, but CSP headers can be verified in browser DevTools

---

## 4. File Upload (Type + Size + Scanning) ✅

### Rating: **☑ + scanning**

**What it proves:** File uploads are validated for type, size, AND scanned for malicious content.

### Test Case: Upload File with Mismatched Signature

**Testing Method:** Insomnia (requires file attachment)

**Preparation:**

Create a fake malicious file:

printf 'MZFakeExecutableContent' > fake.jpg
xxd fake.jpg VERIFY ONLY


**Steps in Insomnia:**

```
POST http://localhost:8000/api/documents/upload/
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: multipart/form-data

Form Data:
- document_type: valid_id
- file: [Select fake-image.jpg]
```

**Expected Result:**

```json
{
  "status": "error",
  "message": "Potentially unsafe file content detected",
  "code": "invalid_file"
}
```

**Proof of Implementation:**
- **Type check**: MIME type validation
- **Size check**: 10MB limit enforcement
- **Signature validation**: File header matches declared type
- **Malware scanning**: Detects executable signatures (MZ, PK for EXE/ZIP bombs)
- **PDF scanning**: Detects dangerous PDF directives (`/JavaScript`, `/Launch`, etc.)
- 📍 Code location: `documents/serializers/document_serializers.py` → `validate_uploaded_file()`, `_scan_uploaded_file()`

**Browser vs API Tool:** ⚠️ **API tool required** (need to craft malicious files)

---

## 5. API Validation (Auto + Feedback) ✅

### Rating: **☑ Auto + feedback**

**What it proves:** APIs automatically validate using serializers/schemas and return structured feedback for invalid payloads.

### Test Case: Invalid Customer Signup Payload (API-only in this web repo)

**Testing Method:** Insomnia/Postman (recommended)

**Important Role Context (3 user types):**
- `customer`: self-registration endpoint exists at `POST /api/auth/signup/` (API test target)
- `loan_officer`: account is created by admin via `POST /api/auth/admin/loan-officers/` (admin panel flow)
- `admin`: account is created by super admin via `POST /api/auth/admin/admins/` (admin panel flow) 
- This frontend repo has no public customer signup form route.

**Steps:**

```
POST http://localhost:8000/api/auth/signup/
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "123",
  "password_confirm": "456",
  "first_name": "",
  "last_name": "User"
}
```

**Expected Result:**

```json
{
  "status": "error",
  "errors": {
    "email": ["Enter a valid email address."],
    "password": ["...password validation message..."],
    "password_confirm": ["Passwords do not match"],
    "first_name": ["This field may not be blank."]
  },
  "validation_feedback": {
    "error_count": 4,
    "fields": ["email", "password", "password_confirm", "first_name"],
    "issues": [
      {
        "field": "email",
        "message": "Enter a valid email address.",
        "code": "invalid",
        "hint": "Use the expected format or data type."
      },
      {
        "field": "first_name",
        "message": "This field may not be blank.",
        "code": "blank",
        "hint": "Value cannot be blank."
      }
    ]
  }
}
```

**What makes this "Auto + Feedback":**
- ✅ **Auto**: `SignUpSerializer` (DRF) validates email, password, and field rules automatically
- ✅ **Feedback**: `APIResponseHelper.validation_error_response()` adds:
  - `error_count`
  - `fields`
  - `issues` with `field`, `message`, `code`, and `hint`

**Proof of Implementation:**
- Signup validation path: `accounts/views/auth_views.py` (`SignUpView`)
- Serializer rules: `accounts/serializers/auth_serializers.py` (`SignUpSerializer`)
- Structured feedback builder: `accounts/utils/response_helpers.py` (`validation_error_response()`)

**Browser vs API Tool:** ⚠️ Use API tool for this test in this repo (no customer signup page).  
For officer/admin validation, you can also exercise create forms in `/admin/officers` and `/admin/admins`.

---

## 6. NoSQL Injection (ORM + Validation) ✅

### Rating: **☑ ORM + validation**

**What it proves:** NoSQL operator injection is blocked by middleware + ORM prevents injection.

### Test Case: MongoDB Operator Injection Attempt

**Testing Method:** Insomnia (API tool required)

**Steps:**

**Test 1: Login with `$ne` operator**

```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "email": { "$ne": "" },
  "password": "anything"
}
```

**Expected Result:**

```json
{
  "status": "error",
  "message": "Potential NoSQL injection payload detected",
  "errors": {
    "body.email": "Mongo-style operator keys (starting with \"$\") or dotted keys are not allowed"
  },
  "validation_feedback": {
    "error_count": 1,
    "fields": ["body.email"],
    "issues": [
      {
        "field": "body.email",
        "message": "Mongo-style operator keys are not permitted in request payloads",
        "code": "nosql_injection_detected",
        "hint": "Use plain scalar values (string/number/boolean) only."
      }
    ]
  }
}
```

**Test 2: Dotted key injection**

```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "email": "test@example.com",
  "profile.role": "admin"
}
```

**Expected Result:**

```json
{
  "status": "error",
  "message": "Potential NoSQL injection payload detected",
  "errors": {
    "body.profile.role": "Mongo-style operator keys (starting with \"$\") or dotted keys are not allowed"
  },
  ...
}
```

**How it Works:**

1. **Middleware Layer** (`NoSQLInjectionGuardMiddleware`):
   - Scans all POST/PUT/PATCH requests
   - Blocks any key starting with `$` or containing `.`
   - Runs **before** view execution

2. **ORM Layer** (PyMongo):
   - Even if middleware bypassed, ORM treats params as literals
   - Example: `{"email": {"$ne": ""}}` becomes a literal object lookup, not an operator

**Proof of Implementation:**
- 📍 Code location: `config/middleware.py` → `NoSQLInjectionGuardMiddleware`
- 📍 Middleware registered in: `config/settings.py` → `MIDDLEWARE` list
- All database operations use PyMongo ORM (no raw queries)

**Browser vs API Tool:** ⚠️ **API tool required** (need to craft JSON with operator keys)

---

## 7. CSRF (SameSite + Token) ✅

### Rating: **☑ SameSite + token**

**What it proves:** Double protection with SameSite cookies AND CSRF token validation.

### Test Case: CSRF Token Enforcement

**Testing Method:** Insomnia (API tool required)

**Steps:**

**Step 1: Get CSRF Token**

```
GET http://localhost:8000/api/auth/csrf-token/
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "csrf_token": "abcd1234..."
  },
  "message": "CSRF token issued"
}
```

**Check Response Headers:**
```
Set-Cookie: csrftoken=abcd1234...; Path=/; SameSite=Lax; HttpOnly=False
```

**Step 2: Send POST Request WITHOUT CSRF Token**

⚠️ **Important**: Enable cookie jar in Insomnia so cookie is sent automatically

```
POST http://localhost:8000/api/auth/signup/
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "password_confirm": "Test123!",
  "first_name": "Test",
  "last_name": "User"
}
```

**Expected Result:**

```json
{
  "status": "error",
  "message": "CSRF token required",
  "code": "csrf_token_missing"
}
```
**Status Code:** 403 Forbidden

**Step 3: Retry WITH CSRF Token Header**

```
POST http://localhost:8000/api/auth/signup/
Content-Type: application/json
X-CSRFToken: abcd1234...  ← Add this header

{
  "email": "test@example.com",
  "password": "Test123!",
  "password_confirm": "Test123!",
  "first_name": "Test",
  "last_name": "User"
}
```

**Expected Result:**

```json
{
  "status": "success",
  "message": "Registration successful. Check your email for verification.",
  ...
}
```
**Status Code:** 201 Created

**How it Works:**

1. **SameSite Cookie**: Cookie attribute `SameSite=Lax` prevents cross-site request sending
2. **Double Submit Token**: 
   - CSRF token in cookie
   - CSRF token in `X-CSRFToken` header
   - Backend compares both (must match)

**Proof of Implementation:**
- 📍 Code location:
  - `config/middleware.py` → `CSRFSameSiteTokenMiddleware`
  - `config/settings.py` → `CSRF_COOKIE_SAMESITE = 'Lax'`
- 📍 Frontend: `src/shared/api/client.ts` → Automatically attaches `X-CSRFToken` header

**Browser vs API Tool:** ⚠️ **API tool recommended** (easier to test with/without header)

---

## Summary Table

| Criterion | Rating | Test Method | Can Test in Browser? | Key Proof |
|-----------|--------|-------------|---------------------|-----------|
| **Server Validation** | All + Sanitization | Insomnia | ⚠️ API tool better | 400 errors + sanitized storage |
| **SQL Injection** | ORM | Browser or Insomnia | ✅ Yes | SQL syntax treated as literal string |
| **XSS** | CSP + sanitize | Insomnia + DevTools | ⚠️ API tool better | CSP headers + stripped tags |
| **File Upload** | Type + size + scanning | Insomnia | ❌ No | Detects mismatched signatures |
| **API Validation** | Auto + feedback | Insomnia/Postman | ⚠️ API-only in this repo | Structured error responses |
| **NoSQL Injection** | ORM + validation | Insomnia | ❌ No | Middleware blocks `$` operators |
| **CSRF** | SameSite + token | Insomnia | ⚠️ API tool better | 403 without token, 200 with token |

---

## Quick Testing Checklist

Use this checklist to run through all 7 tests:

### Before Testing
- [ ] Backend is running (`python manage.py runserver`)
- [ ] You have a test user account
- [ ] Insomnia/Postman is installed
- [ ] You have an access token (from login)

### Tests
- [ ] **1. Server Validation**: Upload profile with XSS → Check sanitization
- [ ] **2. SQL Injection**: Login with `' OR 1=1 --` → Verify rejection
- [ ] **3. XSS**: Check CSP headers in `/api/health/` response
- [ ] **4. File Upload**: Upload fake JPG with MZ signature → Verify rejection
- [ ] **5. API Validation**: Signup with invalid data → Check `validation_feedback`
- [ ] **6. NoSQL Injection**: Login with `{"email": {"$ne": ""}}` → Verify 400 error
- [ ] **7. CSRF**: POST without `X-CSRFToken` header → Verify 403 error

---

## Troubleshooting

### Issue: "CSRF token missing" even with header

**Solution:**
1. In Insomnia, enable **Cookie Jar** (top-right icon)
2. First call `GET /api/auth/csrf-token/` to get cookie
3. Then make POST request - cookie will be sent automatically

### Issue: "Authentication credentials were not provided"

**Solution:**
1. Login first: `POST /api/auth/login/`
2. Copy `access` token from response
3. Add header: `Authorization: Bearer <access_token>`

### Issue: File upload test not triggering scanner

**Solution:**
1. Ensure file has `.jpg` extension
2. File must have MZ bytes at start: `\x4D\x5A`
3. Check Content-Type is `multipart/form-data`

### Issue: NoSQL injection middleware not triggering

**Solution:**
1. Ensure `NoSQLInjectionGuardMiddleware` is in `config/settings.py` MIDDLEWARE list
2. Payload must be valid JSON with nested object
3. Check endpoint is under `/api/` path

---

## Code References

### Validation & Sanitization
- `accounts/serializers/mixins.py` → InputSanitizationMixin
- `accounts/utils/validation_utils.py` → Validation helpers

### Security Middleware
- `config/middleware.py`:
  - SecurityHeadersMiddleware (CSP, XSS headers)
  - CSRFSameSiteTokenMiddleware (CSRF protection)
  - NoSQLInjectionGuardMiddleware (NoSQL injection defense)

### File Upload Security
- `documents/serializers/document_serializers.py`:
  - `validate_uploaded_file()` - Type & size checking
  - `_scan_uploaded_file()` - Malware signature scanning

### Response Formatting
- `accounts/utils/response_helpers.py` → APIResponseHelper

---

## Next Steps

Once all 7 tests pass:

1. **Document Results**: Screenshot test results showing:
   - Request payloads
   - Response status codes
   - Error messages
   - Headers (for CSP)

2. **Automated Testing**: Consider creating automated test suite:
   - `pytest` tests for backend validation
   - Playwright tests for frontend flows

3. **Security Audit**: Run vulnerability scanner:
   - OWASP ZAP
   - Burp Suite
   - npm audit (frontend)
   - safety check (Python dependencies)

4. **Compliance Check**: Map tests to security frameworks:
   - OWASP Top 10
   - PCI DSS (if handling payments)
   - BSP Cybersecurity guidelines (Philippines)

---

**Last Updated:** February 19, 2026  
**Tested Against:** Backend v1.0, Python 3.13, Django 5.1
