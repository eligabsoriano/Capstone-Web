# Phase 7: User Management (Admin Only)

**Status:** [ ] Not Started  
**Duration:** 1-2 days

---

## Endpoints for Manual Testing

### Loan Officer Management

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Officers | GET | `/api/auth/admin/loan-officers/` | [ ] |
| Create Officer | POST | `/api/auth/admin/loan-officers/` | [ ] |
| Get Officer | GET | `/api/auth/admin/loan-officers/{id}/` | [ ] |
| Update Officer | PUT | `/api/auth/admin/loan-officers/{id}/` | [ ] |
| Deactivate Officer | DELETE | `/api/auth/admin/loan-officers/{id}/` | [ ] |

### Admin Management (Super Admin Only)

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Admins | GET | `/api/auth/admin/admins/` | [ ] |
| Create Admin | POST | `/api/auth/admin/admins/` | [ ] |
| Get Admin | GET | `/api/auth/admin/admins/{id}/` | [ ] |
| Update Admin | PUT | `/api/auth/admin/admins/{id}/` | [ ] |
| Update Permissions | PUT | `/api/auth/admin/admins/{id}/permissions/` | [ ] |

---

## Request/Response Examples

### List Loan Officers

```bash
GET /api/auth/admin/loan-officers/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "results": [
    {
      "id": "officer_001",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "employee_id": "EMP-001",
      "is_active": true,
      "two_factor_enabled": true,
      "created_at": "2024-01-01T10:00:00Z",
      "last_login": "2024-01-28T08:30:00Z",
      "stats": {
        "applications_reviewed": 145,
        "applications_approved": 112
      }
    }
  ]
}
```

### Create Loan Officer

```bash
POST /api/auth/admin/loan-officers/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "new.officer@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "employee_id": "EMP-002",
  "password": "TempPassword123!"
}
```

**Response:**
```json
{
  "message": "Loan officer created successfully",
  "officer": {
    "id": "officer_002",
    "email": "new.officer@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "employee_id": "EMP-002",
    "is_active": true,
    "two_factor_enabled": false
  }
}
```

### Deactivate Officer

```bash
DELETE /api/auth/admin/loan-officers/{id}/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Loan officer deactivated successfully"
}
```

### Update Admin Permissions (Super Admin Only)

```bash
PUT /api/auth/admin/admins/{id}/permissions/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "permissions": {
    "can_manage_officers": true,
    "can_manage_admins": false,
    "can_view_analytics": true,
    "can_manage_products": true
  }
}
```

---

## Role Hierarchy

| Role | Can Manage |
|------|------------|
| Super Admin | Admins + Officers + Everything |
| Admin | Officers + Products + Analytics |
| Loan Officer | Applications only |

---

## Frontend Tasks

- [ ] Create users list page
- [ ] Create user data table
- [ ] Create add officer modal
- [ ] Create add admin modal (super admin)
- [ ] Add activate/deactivate actions
- [ ] Add role-based route protection
- [ ] Add admin-only navigation items
- [ ] Create permissions editor (super admin)

---

## User Status Colors

| Status | Color |
|--------|-------|
| Active | Green |
| Inactive | Red |
| New (never logged in) | Yellow |
