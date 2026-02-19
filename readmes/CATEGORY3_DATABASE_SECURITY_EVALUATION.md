# Category 3: Database Security

## Criteria

| Criteria | Checkpoint | Rating |
|---|---|---|
| Credential Storage | How are DB creds stored? | ☐ Hardcoded  ☐ Exposed .env  ☑ Secure .env  ☐ Vault |
| Access Control | Who can access DB? | ☐ Admin all  ☐ Roles  ☐ RBAC  ☑ RBAC + ABAC |
| Encryption at Rest | Is data encrypted? | ☐ None  ☐ Some  ☐ Full  ☑ Field + TDE |
| Access Control | Who can access DB? | ☐ Admin all  ☐ Roles  ☐ RBAC  ☑ RBAC + ABAC |
| Encryption at Rest | Is data encrypted? | ☐ None  ☐ Some  ☑ Full  ☐ Field + TDE |
| Backup Security | Are backups secured? | ☑ None  ☐ Unencrypted  ☐ Encrypted  ☐ Encrypted + offsite |
| Audit Logging | Are DB actions logged? | ☐ None  ☐ Errors  ☑ Full logs  ☐ Real-time alerts |
| Connection Security | Are connections encrypted? | ☐ Plain  ☐ Self-signed  ☑ Valid TLS  ☐ mTLS + pinning |
| Hardening | Is DB hardened? | ☐ Default  ☐ Basic  ☑ Hardened  ☐ Scanned + patched |

## How to Test Category 3

1. Credential Storage: inspect `config/settings.py` and confirm DB URI is read from env vars; verify no hardcoded credentials in source.
2. Access Control: test endpoints with different roles (customer/officer/admin) and verify unauthorized roles cannot access restricted resources.
3. Encryption at Rest: verify both layers:
   - TDE (storage-level): check MongoDB Atlas cluster settings (Encryption at Rest enabled/KMS).
   - Field-level: confirm sensitive fields are stored as encrypted tokens (`enc::...`) and decrypted only in the app model layer.
2. Access Control (RBAC + ABAC):
   - RBAC test: customer token hitting `/api/loans/admin/products/` must return `403`.
   - RBAC test: customer token hitting `/api/loans/officer/applications/` must return `403`.
   - ABAC test: loan officer A requesting officer B's assigned application (`/api/loans/officer/applications/<id>/`) must return `404`.
   - ABAC test: customer trying to read/delete another customer's document (`/api/documents/<id>/`) must return `404`.
   - ABAC test: loan officer A trying to verify/reupload officer B-scoped customer document (`/api/documents/<id>/verify/` or `/api/documents/<id>/request-reupload/`) must return `404`.
   - ABAC test: loan officer A listing documents with out-of-scope customer filter (`/api/documents/?customer_id=<other-scope-customer>`) must return an empty result set.
   - Permission RBAC test: admin without required permission (e.g., `view_analytics`) calling `/api/analytics/admin/` must return `403`.
3. Encryption at Rest: verify your MongoDB Atlas cluster security settings for encryption-at-rest status.
4. Backup Security: verify whether automated backups/snapshots are enabled in Atlas and whether backup storage is encrypted/offsite.
5. Audit Logging: perform actions (login, upload, approve/reject, admin changes) then verify corresponding entries appear in audit logs.
6. Connection Security: confirm deployed DB URI uses `mongodb+srv` and test successful TLS connection in production.
7. Hardening: check Atlas Network Access/IP allowlist, least-privilege DB user roles, and security configuration review cadence.

## Overall Readiness

- Readiness: **Partially Ready (Fair)**
- Estimated Category 3 level: **Fair (3/5)**
- Main gaps before “Excellent”:
1. Formalize and document backup strategy (encrypted backups + offsite + restore testing).
2. Document/verify encryption-at-rest posture explicitly (Atlas setting evidence).
3. Add stronger DB hardening controls (least-privilege DB users, periodic security scans/patch review, optional mTLS where feasible).
4. Add real-time alerting for critical database/audit events.
