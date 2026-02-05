# Phase 7: User Management - Analysis & Implementation Prompt

**Generated:** 2026-02-05  
**Status:** PARTIALLY IMPLEMENTED

---

## Executive Summary

Phase 7 (User Management) is **~60% complete**. Loan Officer management is fully implemented on both backend and frontend. Admin management backend is complete, but the frontend is just a placeholder.

---

## Implementation Status

### Backend - ✅ 100% COMPLETE

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Officers | GET | `/api/auth/admin/loan-officers/` | ✅ Done |
| Create Officer | POST | `/api/auth/admin/loan-officers/` | ✅ Done |
| Get Officer | GET | `/api/auth/admin/loan-officers/{id}/` | ✅ Done |
| Update Officer | PUT | `/api/auth/admin/loan-officers/{id}/` | ✅ Done |
| Deactivate Officer | DELETE | `/api/auth/admin/loan-officers/{id}/` | ✅ Done |
| List Admins | GET | `/api/auth/admin/admins/` | ✅ Done (SuperAdmin) |
| Create Admin | POST | `/api/auth/admin/admins/` | ✅ Done (SuperAdmin) |
| Get Admin | GET | `/api/auth/admin/admins/{id}/` | ✅ Done (SuperAdmin) |
| Update Admin | PUT | `/api/auth/admin/admins/{id}/` | ✅ Done (SuperAdmin) |
| Deactivate Admin | DELETE | `/api/auth/admin/admins/{id}/` | ✅ Done (SuperAdmin) |
| Update Permissions | PUT | `/api/auth/admin/admins/{id}/permissions/` | ✅ Done (SuperAdmin) |

### Frontend - Loan Officers ✅ COMPLETE

| Feature | Status | File |
|---------|--------|------|
| Officers List Page | ✅ Done | `src/features/admin/pages/AdminOfficersPage.tsx` (317 lines) |
| Officer Detail Page | ✅ Done | `src/features/admin/pages/AdminOfficerDetailPage.tsx` (321 lines) |
| Create Officer Modal | ✅ Done | Integrated in AdminOfficersPage |
| Edit Officer | ✅ Done | Integrated in AdminOfficerDetailPage |
| Activate/Deactivate Toggle | ✅ Done | Integrated in AdminOfficerDetailPage |
| API Functions | ✅ Done | `src/features/admin/api/adminApi.ts` |
| Hooks | ✅ Done | `useOfficersList`, `useOfficerDetail`, `useCreateOfficer`, `useUpdateOfficer`, `useDeactivateOfficer` |
| TypeScript Types | ✅ Done | `LoanOfficerListItem`, `LoanOfficerDetail`, `CreateOfficerRequest`, etc. |

### Frontend - Admin Management ❌ NOT IMPLEMENTED

| Feature | Status | Notes |
|---------|--------|-------|
| Admins List Page | ❌ Placeholder | Shows "Admin management coming soon" |
| Admin Detail Page | ❌ Missing | No page exists |
| Create Admin Modal | ❌ Missing | No modal component |
| Edit Admin | ❌ Missing | No edit functionality |
| API Functions | ❌ Missing | No `getAdminsList`, `createAdmin`, etc. |
| Hooks | ❌ Missing | No `useAdminsList`, `useCreateAdmin`, etc. |
| TypeScript Types | ❌ Missing | No `AdminListItem`, `AdminDetail` interfaces |

### Sidebar Navigation ✅ COMPLETE

- `superAdminOnly` logic implemented in `AdminSidebar.tsx`
- "Admins" menu item correctly hidden for regular admins
- Uses `user.superAdmin` check from auth store

---

## Required Implementation

### 1. TypeScript Types (Add to `src/types/api.ts`)

```typescript
// ADMIN MANAGEMENT TYPES
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

export interface CreateAdminResponse {
  admin: AdminListItem;
  temporary_password: string;
  message: string;
}

export interface UpdateAdminRequest {
  first_name?: string;
  last_name?: string;
  active?: boolean;
}

export interface UpdatePermissionsRequest {
  super_admin?: boolean;
  permissions?: string[];
}
```

### 2. API Functions (Add to `src/features/admin/api/adminApi.ts`)

```typescript
// ADMIN MANAGEMENT
export async function getAdminsList(params?: { active?: boolean }): Promise<
  ApiResponse<{ admins: AdminListItem[]; total: number }>
> {
  const response = await apiClient.get<
    ApiResponse<{ admins: AdminListItem[]; total: number }>
  >("/api/auth/admin/admins/", { params });
  return response.data;
}

export async function getAdminDetail(adminId: string): Promise<ApiResponse<AdminDetail>> {
  const response = await apiClient.get<ApiResponse<AdminDetail>>(
    `/api/auth/admin/admins/${adminId}/`
  );
  return response.data;
}

export async function createAdmin(data: CreateAdminRequest): Promise<ApiResponse<CreateAdminResponse>> {
  const response = await apiClient.post<ApiResponse<CreateAdminResponse>>(
    "/api/auth/admin/admins/",
    data
  );
  return response.data;
}

export async function updateAdmin(
  adminId: string,
  data: UpdateAdminRequest
): Promise<ApiResponse<{ id: string }>> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(
    `/api/auth/admin/admins/${adminId}/`,
    data
  );
  return response.data;
}

export async function deactivateAdmin(adminId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/auth/admin/admins/${adminId}/`
  );
  return response.data;
}

export async function updateAdminPermissions(
  adminId: string,
  data: UpdatePermissionsRequest
): Promise<ApiResponse<{ id: string }>> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(
    `/api/auth/admin/admins/${adminId}/permissions/`,
    data
  );
  return response.data;
}
```

### 3. React Query Hooks (Add to `src/features/admin/hooks/useAdminApi.ts`)

```typescript
// ADMIN MANAGEMENT QUERY KEYS
export const adminQueryKeys = {
  // ... existing keys ...
  admins: () => [...adminQueryKeys.all, "admins"] as const,
  adminsList: (filters?: { active?: boolean }) => 
    [...adminQueryKeys.admins(), "list", filters] as const,
  adminDetail: (id: string) => [...adminQueryKeys.admins(), "detail", id] as const,
};

// ADMIN MANAGEMENT HOOKS
export function useAdminsList(filters?: { active?: boolean }) {
  return useQuery({
    queryKey: adminQueryKeys.adminsList(filters),
    queryFn: async () => {
      const response = await getAdminsList(filters);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch admins");
      }
      return response.data!;
    },
  });
}

export function useAdminDetail(adminId: string) {
  return useQuery({
    queryKey: adminQueryKeys.adminDetail(adminId),
    queryFn: async () => {
      const response = await getAdminDetail(adminId);
      if (response.status === "error") {
        throw new Error(response.message || "Failed to fetch admin details");
      }
      return response.data!;
    },
    enabled: !!adminId,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminRequest) => createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
    },
  });
}

export function useUpdateAdmin(adminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAdminRequest) => updateAdmin(adminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminDetail(adminId) });
    },
  });
}

export function useDeactivateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => deactivateAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins() });
    },
  });
}
```

### 4. AdminAdminsPage Implementation

Replace the placeholder in `src/features/admin/pages/AdminAdminsPage.tsx` with a full implementation similar to `AdminOfficersPage.tsx`:

**Features to implement:**
- List of admins in a table/card layout
- Search/filter functionality
- "Create Admin" button with modal
- Click to view admin details
- Show super_admin badge
- Show 2FA status
- Show active/inactive status

### 5. AdminAdminDetailPage (NEW FILE)

Create `src/features/admin/pages/AdminAdminDetailPage.tsx`:

**Features to implement:**
- Display admin details (username, email, name, etc.)
- Edit mode with form for first_name, last_name
- Toggle active status (with confirmation)
- Permission editor (for non-super admins)
- Promote/demote super admin status
- Back button to admins list

### 6. Router Update

Add route in `src/app/router.tsx`:

```typescript
{ path: "admins/:adminId", element: <AdminAdminDetailPage /> }
```

---

## Backend API Reference

### GET /api/auth/admin/admins/
**Auth:** SuperAdmin only

**Response:**
```json
{
  "status": "success",
  "data": {
    "admins": [
      {
        "id": "...",
        "username": "admin1",
        "email": "admin1@example.com",
        "full_name": "Admin One",
        "super_admin": false,
        "permissions": ["create_loan_officer", "manage_loan_officers"],
        "active": true,
        "two_factor_enabled": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 5
  }
}
```

### POST /api/auth/admin/admins/
**Auth:** SuperAdmin only

**Request:**
```json
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "first_name": "New",
  "last_name": "Admin",
  "super_admin": false,
  "permissions": ["create_loan_officer"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "admin": { "id": "...", "username": "newadmin", ... },
    "temporary_password": "Xyz12345!",
    "message": "Send this temporary password to the admin securely."
  }
}
```

### GET /api/auth/admin/admins/{id}/
**Auth:** SuperAdmin only

### PUT /api/auth/admin/admins/{id}/
**Auth:** SuperAdmin only  
**Note:** Cannot deactivate your own account

### DELETE /api/auth/admin/admins/{id}/
**Auth:** SuperAdmin only  
**Note:** Cannot delete yourself

### PUT /api/auth/admin/admins/{id}/permissions/
**Auth:** SuperAdmin only

---

## Existing Code Patterns to Follow

Reference these files for consistent patterns:
- `AdminOfficersPage.tsx` - List page with create modal
- `AdminOfficerDetailPage.tsx` - Detail page with edit mode
- `adminApi.ts` - API function structure
- `useAdminApi.ts` - Hook patterns with TanStack Query

---

## Files to Create/Modify

| Action | File |
|--------|------|
| MODIFY | `src/types/api.ts` - Add admin management types |
| MODIFY | `src/features/admin/api/adminApi.ts` - Add admin API functions |
| MODIFY | `src/features/admin/hooks/useAdminApi.ts` - Add admin hooks |
| REPLACE | `src/features/admin/pages/AdminAdminsPage.tsx` - Full implementation |
| CREATE | `src/features/admin/pages/AdminAdminDetailPage.tsx` |
| MODIFY | `src/features/admin/pages/index.ts` - Export new page |
| MODIFY | `src/app/router.tsx` - Add admin detail route |

---

## Acceptance Criteria

1. ✅ Super Admin can view list of all admins
2. ✅ Super Admin can create new admins with temporary password
3. ✅ Super Admin can view admin details
4. ✅ Super Admin can edit admin (name, active status)
5. ✅ Super Admin can deactivate admins (except self)
6. ✅ Regular Admin cannot access Admins page (sidebar hides it)
7. ✅ All TypeScript types properly defined
8. ✅ Biome lint passes
9. ✅ Application builds successfully
