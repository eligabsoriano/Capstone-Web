# Role Reference Guide

## Quick Summary

| Role | Login Portal | Main Purpose |
|------|-------------|--------------|
| **Super Admin** | `/admin/login` | Full system control |
| **Admin** | `/admin/login` | Operations management |
| **Loan Officer** | `/officer/login` | Process loan applications |
| **Customer** | Mobile App | Apply for loans |

---

## Detailed Access Matrix

### Super Admin
```
✅ Everything a Regular Admin can do, PLUS:
✅ Create/edit/deactivate other Admins
✅ Manage admin permissions
✅ Full system control

❌ Process individual loan applications (that's for officers)
```

### Regular Admin
```
✅ Dashboard with aggregate stats (SAME as Super Admin)
✅ Manage Loan Officers (create, edit, deactivate)
✅ Manage Loan Products (create, edit, deactivate)
✅ View Officer Workload
✅ Assign applications to officers
✅ View Audit Logs
✅ Account Settings (2FA, password)

❌ Manage other Admins
❌ Create new admins
❌ Edit admin accounts
❌ Process individual loan applications
```

**Important:** Admin and Super Admin see the **exact same dashboard** in Phase 6. The only UI difference is the "Admins" menu item in the sidebar.

### Loan Officer
```
✅ View assigned applications
✅ Review customer profiles
✅ Verify documents
✅ Approve/Reject applications
✅ Disburse approved loans
✅ Record payments
✅ View personal performance stats
✅ Account Settings (2FA, password)

❌ Any admin functions
❌ Manage users
❌ View system-wide analytics
```

---

## Navigation Items by Role

### Admin Sidebar
| Item | Admin | Super Admin |
|------|-------|-------------|
| Dashboard | ✅ | ✅ |
| Loan Officers | ✅ | ✅ |
| Admins | ❌ | ✅ |
| Officer Workload | ✅ | ✅ |
| Loan Products | ✅ | ✅ |
| Audit Logs | ✅ | ✅ |
| Settings | ✅ | ✅ |

### Officer Sidebar
| Item | Loan Officer |
|------|--------------|
| Dashboard | ✅ |
| Applications | ✅ |
| Payments | ✅ |
| Reports | ✅ |
| Settings | ✅ |

---

## Authentication Endpoints

| Portal | Login | Logout |
|--------|-------|--------|
| Admin/Super Admin | `/api/auth/admin/login/` | `/api/auth/admin/logout/` |
| Loan Officer | `/api/auth/officer/login/` | `/api/auth/officer/logout/` |
| Customer | `/api/auth/login/` | `/api/auth/logout/` |
