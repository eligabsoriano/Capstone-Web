# Phase 7: User Management

**Status:** [ ] Not Started  
**Last Updated:** 2026-01-28

---

## Role Hierarchy (Simplified)

| Role | Can Manage Officers | Can Manage Admins | Can Manage Products |
|------|---------------------|-------------------|---------------------|
| **Super Admin** | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ❌ | ✅ |
| **Loan Officer** | ❌ | ❌ | ❌ |

> **Simplified Model**: No granular permissions. Admins get standard access; only `superAdminOnly` flag differentiates.

---

## Loan Officer Management (Admin + Super Admin)

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Officers | GET | `/api/auth/admin/loan-officers/` | ✅ Backend |
| Create Officer | POST | `/api/auth/admin/loan-officers/` | ✅ Backend |
| Get Officer | GET | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend |
| Update Officer | PUT | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend |
| Deactivate | DELETE | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend |

---

## Admin Management (Super Admin ONLY)

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Admins | GET | `/api/auth/admin/admins/` | ✅ Backend |
| Create Admin | POST | `/api/auth/admin/admins/` | ✅ Backend |
| Get Admin | GET | `/api/auth/admin/admins/{id}/` | ✅ Backend |
| Update Admin | PUT | `/api/auth/admin/admins/{id}/` | ✅ Backend |
| Deactivate | DELETE | `/api/auth/admin/admins/{id}/` | ✅ Backend |

---

## Frontend Tasks

### Admin Dashboard
- [ ] Loan Officers list page (`/admin/officers`)
- [ ] Create officer modal
- [ ] Edit officer modal
- [ ] Activate/deactivate toggle

### Super Admin Only
- [ ] Admins list page (`/admin/admins`)
- [ ] Create admin modal
- [ ] Edit admin modal

---

## Sidebar Navigation

```typescript
// AdminSidebar.tsx - Final structure
const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Loan Officers", href: "/admin/officers" },
  { label: "Admins", href: "/admin/admins", superAdminOnly: true },
  { label: "Officer Workload", href: "/admin/workload" },
  { label: "Loan Products", href: "/admin/products" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
  { label: "Settings", href: "/admin/settings" },
];
// NO "Applications" - that's for Loan Officers only
```
