# Phase 7: User Management

**Status:** ✅ Complete  
**Last Updated:** 2026-02-05

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
| List Officers | GET | `/api/auth/admin/loan-officers/` | ✅ Backend + Frontend |
| Create Officer | POST | `/api/auth/admin/loan-officers/` | ✅ Backend + Frontend |
| Get Officer | GET | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend + Frontend |
| Update Officer | PUT | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend + Frontend |
| Deactivate | DELETE | `/api/auth/admin/loan-officers/{id}/` | ✅ Backend + Frontend |

---

## Admin Management (Super Admin ONLY)

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Admins | GET | `/api/auth/admin/admins/` | ✅ Backend + Frontend |
| Create Admin | POST | `/api/auth/admin/admins/` | ✅ Backend + Frontend |
| Get Admin | GET | `/api/auth/admin/admins/{id}/` | ✅ Backend + Frontend |
| Update Admin | PUT | `/api/auth/admin/admins/{id}/` | ✅ Backend + Frontend |
| Deactivate | DELETE | `/api/auth/admin/admins/{id}/` | ✅ Backend + Frontend |
| Update Permissions | PUT | `/api/auth/admin/admins/{id}/permissions/` | ✅ Backend + Frontend |

---

## Frontend Tasks

### Admin Dashboard
- [x] Loan Officers list page (`/admin/officers`)
- [x] Create officer modal
- [x] Edit officer modal
- [x] Activate/deactivate toggle

### Super Admin Only
- [x] Admins list page (`/admin/admins`)
- [x] Create admin modal
- [x] Edit admin modal
- [x] Admin detail page (`/admin/admins/:adminId`)
- [x] Promote/demote Super Admin
- [x] Deactivate admin (with self-protection)

---

## Implementation Details

### Files Created/Modified

| File | Description |
|------|-------------|
| `src/types/api.ts` | Added `AdminListItem`, `AdminDetail`, `CreateAdminRequest`, `CreateAdminResponse`, `UpdateAdminRequest`, `UpdatePermissionsRequest` |
| `src/features/admin/api/adminApi.ts` | Added admin management API functions |
| `src/features/admin/hooks/useAdminApi.ts` | Added admin query keys and hooks |
| `src/features/admin/pages/AdminAdminsPage.tsx` | Full implementation (list, search, filters, create modal) |
| `src/features/admin/pages/AdminAdminDetailPage.tsx` | **NEW** - Admin detail with edit, deactivate, promote/demote |
| `src/features/admin/pages/index.ts` | Added `AdminAdminDetailPage` export |
| `src/app/router.tsx` | Added `/admin/admins/:adminId` route |

### TypeScript Interfaces

```typescript
export interface AdminListItem {
  id: string;
  username: string;
  email: string;
  full_name: string;
  super_admin: boolean;
  permissions: string[];
  active: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AdminDetail extends AdminListItem {
  first_name: string;
  last_name: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  super_admin?: boolean;
  permissions?: string[];
}
```

### React Query Hooks

```typescript
// Admin Management Hooks (Super Admin Only)
useAdminsList(filters?: { active?: boolean })
useAdminDetail(adminId: string)
useCreateAdmin()
useUpdateAdmin(adminId: string)
useDeactivateAdmin()
useUpdateAdminPermissions(adminId: string)
```

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

---

## Comprehensive Testing Guide

### Prerequisites

1. **Backend running:** `cd backend && python manage.py runserver`
2. **Frontend running:** `npm run dev`
3. **Test accounts:**
   - Super Admin: `superadmin@test.com` / `Test123!`
   - Regular Admin: `admin@test.com` / `Test123!`

> **Note:** Create a Super Admin via CLI if needed:
> ```bash
> cd backend
> python manage.py create_admin \
>   --username superadmin \
>   --email superadmin@test.com \
>   --password Test123! \
>   --first-name Super \
>   --last-name Admin \
>   --super-admin
> ```

---

### Loan Officer Management Tests (Admin + Super Admin)

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P7.O1 | **View Officers List** | Admin → Loan Officers | Shows table with all officers |
| P7.O2 | **Search Officers** | Type in search box | Filters by name, email, or employee ID |
| P7.O3 | **Filter Active** | Click "Active" filter | Shows only active officers |
| P7.O4 | **Filter Inactive** | Click "Inactive" filter | Shows only inactive officers |
| P7.O5 | **Create Officer** | Click "Create Officer" → Fill form → Submit | Officer created, temp password shown |
| P7.O6 | **Create Validation** | Submit with empty required fields | Button disabled, cannot submit |
| P7.O7 | **Copy Password** | Click "Copy Password" on temp password modal | Password copied to clipboard |
| P7.O8 | **View Officer Detail** | Click on officer row | Navigates to `/admin/officers/:id` |
| P7.O9 | **Edit Officer** | Detail page → Edit → Change name → Save | Officer updated successfully |
| P7.O10 | **Deactivate Officer** | Detail page → Deactivate → Confirm | Officer deactivated, redirects to list |
| P7.O11 | **Loading State** | Slow network/first load | Skeleton animation shows |
| P7.O12 | **Error State** | Disconnect backend | Error card with message |

---

### Admin Management Tests (Super Admin ONLY)

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P7.A1 | **Sidebar Visibility** | Login as Super Admin | "Admins" visible in sidebar |
| P7.A2 | **Sidebar Hidden** | Login as Regular Admin | "Admins" NOT visible in sidebar |
| P7.A3 | **View Admins List** | Super Admin → Admins | Shows table with all admins |
| P7.A4 | **Search Admins** | Type in search box | Filters by name, email, or username |
| P7.A5 | **Filter Active** | Click "Active" filter | Shows only active admins |
| P7.A6 | **Create Admin** | Click "Create Admin" → Fill form → Submit | Admin created, temp password shown |
| P7.A7 | **Create Super Admin** | Check "Grant Super Admin privileges" → Submit | Super Admin created |
| P7.A8 | **View Admin Detail** | Click on admin row | Navigates to `/admin/admins/:adminId` |
| P7.A9 | **Edit Admin** | Detail page → Edit → Change name → Save | Admin updated |
| P7.A10 | **Promote to Super Admin** | Detail page → "Promote to Super Admin" → Confirm | Role updated to Super Admin |
| P7.A11 | **Demote from Super Admin** | Detail page → "Demote to Admin" → Confirm | Role updated to Admin |
| P7.A12 | **Deactivate Admin** | Detail page → Deactivate → Confirm | Admin deactivated |
| P7.A13 | **Cannot Deactivate Self** | View own profile | Deactivate button not shown |
| P7.A14 | **Cannot Demote Self** | View own profile | Promote/Demote section not shown |
| P7.A15 | **Regular Admin Access Denied** | Regular Admin → Navigate to `/admin/admins` | Error message (no permission) |

---

### Security & Edge Case Tests

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P7.S1 | **Duplicate Username** | Create admin with existing username | Error message shown |
| P7.S2 | **Duplicate Email** | Create admin with existing email | Error message shown |
| P7.S3 | **Invalid Email** | Create with malformed email | Validation error |
| P7.S4 | **Session Expired** | Wait for token expiry → Perform action | Redirect to login |
| P7.S5 | **Backend Down** | Stop backend → Load page | Error state with retry |

---

## Known Limitations / Future Enhancements

| Item | Status | Notes |
|------|--------|-------|
| Granular permissions UI | ❌ Not Implemented | Backend supports `permissions` array, but UI only supports `super_admin` toggle |
| Reactivate Admin/Officer | ❌ Not Implemented | Currently can only deactivate; would need PUT with `active: true` |
| Bulk operations | ❌ Not Implemented | No multi-select for bulk activate/deactivate |
| Export to CSV | ❌ Not Implemented | Admin/Officer lists don't have export |
| Activity history | ❌ Not Implemented | No per-admin/officer activity log on detail page |

---

## API Response Examples

### List Admins Response
```json
{
  "status": "success",
  "data": {
    "admins": [
      {
        "id": "abc123",
        "username": "admin1",
        "email": "admin1@example.com",
        "full_name": "Admin One",
        "super_admin": false,
        "permissions": ["create_loan_officer"],
        "active": true,
        "two_factor_enabled": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 5
  }
}
```

### Create Admin Response
```json
{
  "status": "success",
  "data": {
    "admin": {
      "id": "xyz789",
      "username": "newadmin",
      "email": "newadmin@example.com",
      "full_name": "New Admin",
      "super_admin": false,
      "permissions": []
    },
    "temporary_password": "Abc12345!@#",
    "message": "Send this temporary password to the admin securely."
  }
}
```
