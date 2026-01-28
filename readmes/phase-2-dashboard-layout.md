# Phase 2: Dashboard Layout

**Status:** [x] Completed  
**Duration:** 1-2 days

---

## Tasks

- [x] Create dashboard layout component
- [x] Create sidebar with navigation
- [x] Create header with user menu
- [x] Add breadcrumbs component
- [x] Add dark/light mode toggle
- [x] Make layout responsive
- [x] Add loading states

---

## Components Created

| Component | Location | Description |
|-----------|----------|-------------|
| `AdminLayout` | `features/admin/components/` | Admin dashboard wrapper |
| `AdminSidebar` | `features/admin/components/` | Navigation with permissions |
| `AdminHeader` | `features/admin/components/` | Header with theme toggle |
| `OfficerLayout` | `features/loan-officer/components/` | Officer dashboard wrapper |
| `OfficerSidebar` | `features/loan-officer/components/` | Navigation with queue badge |
| `OfficerHeader` | `features/loan-officer/components/` | Header with theme toggle |
| `ThemeProvider` | `components/common/` | Dark/light/system theme support |
| `ThemeToggle` | `components/common/` | Theme switcher dropdown |
| `Breadcrumbs` | `components/common/` | Auto-generated from URL path |

---

## Navigation Items (Loan Officer)

| Label | Icon | Route |
|-------|------|-------|
| Dashboard | LayoutDashboard | `/officer` |
| Applications | ClipboardList | `/officer/applications` |
| Payments | CreditCard | `/officer/payments` |
| Settings | Settings | `/officer/settings` |

## Navigation Items (Admin)

| Label | Icon | Route |
|-------|------|-------|
| Dashboard | LayoutDashboard | `/admin` |
| Loan Officers | Users | `/admin/officers` |
| Admins | UserCog | `/admin/admins` (Super Admin) |
| Applications | ClipboardList | `/admin/applications` |
| Officer Workload | BarChart3 | `/admin/workload` |
| Loan Products | Package | `/admin/products` |
| Audit Logs | FileText | `/admin/audit-logs` |
| Settings | Settings | `/admin/settings` |

---

## Features

### Theme Support
- Light, Dark, and System modes
- Persists in localStorage (`msme-theme`)
- System mode follows OS preference

### Breadcrumbs
- Auto-generated from current URL path
- Home icon links to dashboard
- Route labels defined in component

### Responsive
- Collapsible sidebar on desktop
- Sheet-based mobile menu
- Sidebar state persisted in localStorage
