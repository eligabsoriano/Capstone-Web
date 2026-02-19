# Field + TDE Implementation and Testing Guide

## What is "Field + TDE"?

`TDE` (Transparent Data Encryption) encrypts database storage files and snapshots at the database/platform layer.
- For your system, this is provided by MongoDB Atlas encryption-at-rest controls.
- This protects data if raw storage media/backups are exposed.

`Field-level encryption` encrypts selected sensitive values before they are written to the database.
- This is done in application code.
- This protects specific fields even if someone can read raw documents in the database.

Using both together is `Field + TDE`.

## Can this be applied to your current system?

Yes.

Your backend uses Django + PyMongo with MongoDB Atlas (`backend/config/settings.py`), which supports:
1. Atlas-managed TDE at cluster level.
2. App-level field encryption before insert/update.

## What was implemented

### 1) Field encryption utility
- Added `backend/config/field_encryption.py`
- Uses `cryptography.fernet` with a key from `FIELD_ENCRYPTION_KEY`
- Encrypts values as `enc::...`
- Decrypts transparently when loading model data

### 2) Environment + dependency
- Added `FIELD_ENCRYPTION_KEY` to `backend/.env.example`
- Added `cryptography>=42.0.0` to `backend/requirements.txt`
- Added key references in `backend/README.md`

### 3) Model-level encryption (encrypt on write, decrypt on read)
- `backend/accounts/models/customer.py`
  - `verification_token`, `password_reset_otp`, `two_factor_secret`
- `backend/accounts/models/loan_officer.py`
  - `phone`, `two_factor_secret`, `password_reset_otp`
- `backend/accounts/models/admin.py`
  - `two_factor_secret`, `password_reset_otp`
- `backend/profiles/models/profile_models.py`
  - Customer profile address/emergency contact fields
  - Business profile address/registration fields
- `backend/documents/models/document.py`
  - file/metadata text fields (`original_filename`, `file_path`, `notes`, etc.)
- `backend/loans/models/application.py`
  - narrative sensitive fields (`purpose`, notes/reason/reference fields)

### 4) Existing data backfill command
- Added `backend/accounts/management/commands/encrypt_sensitive_fields.py`
- Command:
  - Dry run: `python manage.py encrypt_sensitive_fields --dry-run`
  - Apply: `python manage.py encrypt_sensitive_fields`

## Setup steps

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Generate a field encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

3. Set the key in `backend/.env`:
```env
FIELD_ENCRYPTION_KEY=Sc37hOxZMKXCsZ4B1-iETdjeXGEur8ZgiBli8vsdR1M=
```

4. Restart backend server.

5. Encrypt existing plaintext records:
```bash
python manage.py encrypt_sensitive_fields --dry-run
python manage.py encrypt_sensitive_fields
```

## How to verify it is implemented

### A. Verify TDE (Atlas)
1. Open MongoDB Atlas project.
2. Go to cluster security/encryption settings.
3. Confirm encryption at rest is enabled (Atlas default/KMS configuration).

### B. Verify field-level encryption in database
Run in backend directory:
```bash
python manage.py shell -c "from django.conf import settings; d=settings.MONGODB; doc=d['customer_profiles'].find_one({}, {'address_line1':1,'emergency_contact_phone':1}); print(doc)"
```

Expected:
- Sensitive values appear like `enc::...` in MongoDB raw document output.
- They should not appear as plaintext.

### C. Verify application still returns decrypted values
1. Login as user.
2. Call profile endpoints:
   - `GET /api/profile/`
   - `GET /api/profile/business/`
3. Confirm API responses show readable values (not `enc::...` tokens).

### D. Verify runtime security flags
1. Call `GET /api/health/`
2. Confirm:
   - `security.field_encryption = enabled`
   - `security.tde = verify_in_mongodb_atlas_cluster_settings`

## Testing methods (what they are and how to run)

`Testing method` means the technique used to prove a control works, not just that code exists.

### 1) Functional test (positive path)
Goal: ensure app behavior still works with encryption enabled.
- Update profile/business data via API.
- Fetch it again.
- Expected: response is readable, no errors.

### 2) Security evidence test (data-at-rest inspection)
Goal: prove fields are encrypted in storage.
- Inspect MongoDB raw documents (shell query).
- Expected: encrypted token format (`enc::...`) for configured fields.

### 3) Migration/backfill test
Goal: prove old plaintext data was converted.
- Run `python manage.py encrypt_sensitive_fields --dry-run`.
- Run `python manage.py encrypt_sensitive_fields`.
- Run dry-run again.
- Expected: first dry-run finds candidates, second run updates, final dry-run shows zero or minimal remaining.

### 4) Regression test
Goal: ensure critical workflows still function.
- Login, 2FA setup/verify, password reset, profile update, document flow, loan review flow.
- Expected: no functional regressions; sensitive fields still usable in business logic.

### 5) Negative test (wrong/missing key)
Goal: validate operational risk handling.
- Start app with missing/incorrect `FIELD_ENCRYPTION_KEY`.
- Expected: encrypted values cannot be decrypted correctly; this confirms key management is critical.
- Action: restore correct key and restart.

## Operational notes

- Keep `FIELD_ENCRYPTION_KEY` in a secret manager in production.
- Do not rotate this key without a planned re-encryption process.
- Keep Atlas TDE enabled to satisfy the storage-level encryption layer.
