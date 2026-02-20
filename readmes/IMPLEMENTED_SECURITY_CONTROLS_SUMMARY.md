# Implemented Security Controls (Categories 1-4)

Consolidated summary of implemented controls across Authentication, Input Validation, Database Security, and Threat Modeling.

## Category 1: Authentication (Implemented)
- Password storage: `bcrypt + salt/pepper`
- Session management: `expiry + secure flags`
- Error handling: `generic errors + logs`
- Brute force protection: `rate limiting`
- MFA/2FA: `mandatory for admin`
- Token security: `short-lived access + refresh tokens`
- Password policy: `minimum length`
- Logout/inactivity: `session/token invalidation on logout`

## Category 2: Input Validation (Implemented)
- Server-side validation: `all inputs validated + sanitization`
- Injection protection: `ORM-based query handling`
- XSS protection: `CSP + sanitization`
- File upload security: `type + size + scanning`
- API validation: `automatic validation + feedback`
- NoSQL injection protection: `validation + safe query handling`
- CSRF protection: `SameSite + token`

## Category 3: Database Security (Implemented)
- Credential storage: `secure .env usage`
- Data access control: `RBAC + ABAC`
- Encryption at rest: `field-level encryption + TDE`
- Backup security: `encrypted backups`
- Audit logging: `full logs`
- Connection security: `valid TLS`
- Hardening: `hardened`

## Category 4: Threat Modeling (Implemented)
- DFD: `with trust boundaries`
- STRIDE: `detailed threat identification`
- OWASP: `Top 10 mapping`
- Mitigation planning: `prioritized actions + owners + acceptance criteria`
- Risk assessment: `quantitative scoring`
- Updates: `automated model updates`
- Documentation: `visual documentation`

## Short Tests by Category (Per Implemented Feature)

### Category 1: Authentication - Short Tests
| Feature | Short test | Pass criteria |
|---|---|---|
| `bcrypt + salt/pepper` | Run `cd backend && python scripts/check_db_passwords.py` | Stored passwords are bcrypt hashes (`$2b$...`, length 60); no plaintext passwords |
| `expiry + secure flags` | Login, then inspect `Set-Cookie` in browser/Insomnia | `access_token` + `refresh_token` include expiry; `HttpOnly` + `SameSite` present (`Secure` in HTTPS) |
| `generic errors + logs` | Send wrong-password login for existing and non-existing account | Same generic login error response; failed attempts appear in `backend/logs/authentication.log` and `audit_logs` (`user_login_failed`) |
| `rate limiting` | Repeat failed logins quickly on same endpoint | Endpoint returns `429 Too Many Requests` after threshold |
| `mandatory admin 2FA` | Create/login new admin; try `POST /api/auth/2fa/disable/` as admin | First login requires 2FA setup (`requires_2fa_setup=true`); disable call returns `403 admin_2fa_mandatory` |
| `short-lived + refresh tokens` | Wait for access token expiry, then call protected API | Initial request gets `401`, refresh endpoint succeeds, retried request succeeds |
| `minimum length` | Submit signup/password change with too-short password | Validation error returned for password policy |
| `logout invalidation` | Logout, then retry protected endpoint | Protected request is rejected (`401/403`) |

### Category 2: Input Validation - Short Tests
| Feature | Short test | Pass criteria |
|---|---|---|
| `all inputs validated + sanitization` | `PUT /api/profile/` with invalid enum/type, then valid payload with HTML/script | Invalid payload returns `400`; valid payload is saved with sanitized values |
| `ORM-based query handling` | Login with SQLi payload like `' OR 1=1 --` | Auth fails normally; no query bypass |
| `CSP + sanitization` | `GET /api/health/` headers + stored-XSS payload in profile fields | CSP header includes strict `script-src`; XSS payload is stripped/sanitized |
| `type + size + scanning` | Upload fake `.jpg` with executable signature (`MZ`) | Upload rejected (`400`) with unsafe/mismatch file message |
| `automatic validation + feedback` | Send invalid signup payload | Response includes structured `errors` and `validation_feedback` |
| `validation + safe query handling` | Send NoSQL operator payload `{ "email": { "$ne": "" } }` | Request rejected (`400`) before query execution |
| `SameSite + token` | Get CSRF token, POST without `X-CSRFToken`, then retry with header | Without token: `403`; with token: CSRF check passes |

### Category 3: Database Security - Short Tests
| Feature | Short test | Pass criteria |
|---|---|---|
| `secure .env usage` | Check `backend/config/settings.py` + search for hardcoded DB creds | DB URI loaded from env; no hardcoded credentials in source |
| `RBAC + ABAC` | Use lower-privilege token on admin/officer endpoints and cross-owner resources | Unauthorized role gets `403`; out-of-scope object access gets `404`/empty results |
| `field-level encryption + TDE` | Run `python manage.py shell -c "..."` raw document check + Atlas encryption settings check | Sensitive stored fields show `enc::...`; Atlas encryption at rest enabled |
| `encrypted backups` | Run `python backend/scripts/create_encrypted_backup.py` then list backup files | `.archive.gz.enc` file created successfully |
| `full logs` | Perform login/upload/approval action and inspect audit log entries | Corresponding audit events are present with actor/action/timestamp |
| `valid TLS` | Strict Mongo TLS ping + HTTPS health check (`curl -Iv https://.../api/health/`) | TLS handshake succeeds; no cert validation errors |
| `hardened` | Verify Atlas allowlist and DB user privileges | No `0.0.0.0/0` in production and DB user roles are least-privilege |

### Category 4: Threat Modeling - Short Tests
| Feature | Short test | Pass criteria |
|---|---|---|
| `DFD with trust boundaries` | Open `readmes/Information Assurance Security 2 Manuscript.txt` Sections `2.2` and `2.3` | Architecture flow + explicit trust boundaries are documented |
| `detailed STRIDE` | Check Section `4.2 STRIDE Threat Table` | Table includes all STRIDE categories with component-specific threats |
| `OWASP Top 10 mapping` | Check Sections `5.1` and `5.2` | OWASP categories are listed and mapped to STRIDE threats/components |
| `prioritized mitigation + owners` | Review STRIDE table columns (`Mitigation`, `Owner`, `Acceptance Criteria`) | Mitigations are defined, assigned owners exist, acceptance criteria are testable |
| `quantitative scoring` | Check scoring model in Sections `4.1` and `4.2.2` | Impact/Likelihood values and computed risk levels are shown |
| `automated updates` | Review update statements in manuscript controls/roadmap sections | Threat model update process is documented as recurring/continuous |
| `visual documentation` | Review architecture and modeling visuals in manuscript appendices/sections | Visual diagrams/tables are present and readable for review |

## Notes
- This section is a short consolidated version of your separate testing guides.
- Keep detailed step-by-step evidence in the original guide files when needed.

## OWASP ZAP Baseline Testing (Integrated from Playbook)

### What it is
- `OWASP ZAP baseline` is a lightweight automated DAST scan that crawls your running frontend target and reports common web security issues (headers, passive findings, and baseline risk signals).

### Commands to Run ZAP
Run from project root:

```bash
cd /Users/justinmcnealcaronongan/Documents/GitHub/Capstone-Web
```

Start frontend so Docker can reach it:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Verify Docker can reach frontend:

```bash
docker run --rm --add-host=host.docker.internal:host-gateway curlimages/curl:8.6.0 -I http://host.docker.internal:5173
```

Run ZAP baseline and generate report:

```bash
docker run --rm -t \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd):/zap/wrk/:rw" \
  zaproxy/zap-stable \
  zap-baseline.py -t http://host.docker.internal:5173 -r zap-report.html
```

Open report:

```bash
open zap-report.html
```

### Results to Capture
- Reachability check returns frontend HTTP response (target reachable from Docker).
- `zap-report.html` is generated successfully.
- Record alert summary from report by severity (`High`, `Medium`, `Low`, `Informational`) and include key findings/remediation notes.
