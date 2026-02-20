# Database Hardening Verification Guide

Use this to decide what to mark in:

`| Hardening | Is DB hardened? | ☐ Default ☐ Basic ☐ Hardened ☐ Scanned + patched |`

---

## Quick Decision

Mark `☐ Default` when one or more are true:
- Atlas Network Access allows `0.0.0.0/0` in production.
- DB user has broad privileges (example: "read/write to any database").
- No documented hardening review process.

Mark `☑ Basic` when all are true:
- Database credentials are not hardcoded.
- Connections use TLS (`mongodb+srv://` or explicit TLS config).
- Backups exist and are encrypted.
- Some access controls exist, but least privilege is not fully enforced.

Mark `☑ Hardened` when all are true:
- Atlas Network Access is restricted to approved IPs/CIDRs (no `0.0.0.0/0` in production).
- Database users follow least privilege (scoped roles only).
- TLS is enforced and strict certificate validation is used.
- Encryption at rest (TDE) is enabled in Atlas.
- Field-level encryption is enabled for sensitive fields.
- Backup restore drill has been performed and documented.
- Audit logs are enabled and reviewed on a defined cadence.

Mark `☑ Scanned + patched` when `Hardened` is true plus:
- Security scan evidence exists (dependency and config scans).
- Patch cadence is documented and current.
- Recent scan findings are remediated with evidence.

---

## Evidence You Should Collect

Store these in your report/screenshots folder:

1. Atlas Network Access screenshot showing restricted allowlist.
2. Atlas Database Access screenshot showing least-privilege roles.
3. Atlas encryption-at-rest (TDE/KMS) screenshot.
4. Redacted DB URI evidence showing secure scheme (`mongodb+srv://...`).
5. TLS verification command output (strict cert validation).
6. Encrypted backup file evidence (`.archive.gz.enc`) and restore drill output.
7. Audit log samples and review timestamp (who reviewed, when).
8. Security scan output (`pip-audit`, `npm audit`, etc.) and patch notes.

---

## Project-Specific Checks (This Repo)

- DB URI from env: `backend/config/settings.py`
- Health endpoint security flags: `backend/config/views.py`
- Field encryption utility: `backend/config/field_encryption.py`
- Encrypted backup script: `backend/scripts/create_encrypted_backup.py`
- Restore drill script: `backend/scripts/restore_encrypted_backup.py`
- Current category sheet: `readmes/CATEGORY3_DATABASE_SECURITY_EVALUATION.md`

---

## Minimal Command Set for Validation

Run from repo root unless stated:

```bash
# 1) Confirm DB URI is set (do not paste secrets in reports)
grep -E '^MONGODB_URI=' backend/.env

# 2) Confirm encrypted backups exist
ls -lah backend/backups

# 3) Run restore drill (safe target DB)
cd backend
python scripts/restore_encrypted_backup.py /absolute/path/to/backup.archive.gz.enc

# 4) Optional dependency scan evidence
pip-audit
```

---

## Recommended Rating for Current State

Use `☑ Basic` unless you can provide current evidence for:
- restricted Atlas allowlist,
- least-privilege DB roles,
- and a documented scan + patch cycle.

Upgrade to `☑ Hardened` only after those proofs are collected.
