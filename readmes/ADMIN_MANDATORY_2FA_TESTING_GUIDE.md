# Admin Mandatory 2FA Testing Guide

## Goal
Verify that administrator accounts must complete 2FA setup and cannot disable 2FA.

## Preconditions
1. You have a `super_admin` account.
2. You can create a normal admin account from the super admin panel.
3. Backend and frontend are running.

## Test 1: New Admin Is Forced Into 2FA Setup
1. As super admin, create a new admin user.
2. Login as that new admin using username/password.
3. Expected result:
   - Response includes `requires_2fa: true`
   - Response includes `requires_2fa_setup: true`
   - Response includes `temp_token`, `provisioning_uri`, `manual_entry_key`
   - No final access/refresh login tokens are issued yet
4. In UI, `/verify-2fa` should show QR/manual key setup mode.

## Test 2: First 2FA Code Completes Setup + Login
1. Scan QR in authenticator app.
2. Enter current 6-digit code in verify page.
3. Expected result:
   - Login succeeds
   - Access/refresh tokens are issued
   - `backup_codes` are returned on first successful setup confirm
   - Admin can enter dashboard

## Test 3: Admin Cannot Disable 2FA
1. Open admin 2FA settings.
2. Expected UI:
   - Disable 2FA action is hidden for admins.
3. API validation (optional):
   - Call `POST /api/auth/2fa/disable/` as admin.
   - Expected: HTTP 403 with code `admin_2fa_mandatory`.

## Test 4: Subsequent Admin Logins Require 2FA Verify
1. Logout admin.
2. Login again with username/password.
3. Expected result:
   - Response includes `requires_2fa: true`
   - Response includes `temp_token`
   - `requires_2fa_setup` is not returned (already enrolled)
4. Enter authenticator code to complete login.

## Test 5: Audit/Logging Evidence
1. Perform one successful admin login through 2FA.
2. Check logs/audit trail.
3. Expected evidence:
   - Admin bootstrap/setup-required login log
   - Successful `user_login` audit event after 2FA verification

## Pass Criteria
Mark `MFA / 2FA` as `Mandatory (admin)` only if all tests above pass.
