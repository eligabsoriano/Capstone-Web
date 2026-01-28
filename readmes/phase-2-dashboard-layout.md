# Phase 2: Dashboard Layout

**Status:** [ ] Not Started  
**Duration:** 1-2 days

---

## Tasks

- [ ] Create dashboard layout component
- [ ] Create sidebar with navigation
- [ ] Create header with user menu
- [ ] Add breadcrumbs component
- [ ] Add dark/light mode toggle
- [ ] Make layout responsive
- [ ] Add loading states

---

## Navigation Items (Loan Officer)

| Label | Icon | Route |
|-------|------|-------|
| Dashboard | LayoutDashboard | `/` |
| Applications | FileText | `/applications` |
| Payments | CreditCard | `/payments` |
| Documents | FolderOpen | `/documents` |
| Settings | Settings | `/settings` |

## Navigation Items (Admin Only)

| Label | Icon | Route |
|-------|------|-------|
| Users | Users | `/admin/users` |
| Analytics | BarChart | `/admin/analytics` |
| Audit Logs | ClipboardList | `/admin/logs` |
| Officers | UserCog | `/admin/officers` |

---

## Files to Create

```
src/components/layout/
├── DashboardLayout.tsx
├── Sidebar.tsx
├── Header.tsx
├── Breadcrumbs.tsx
├── UserMenu.tsx
└── ThemeToggle.tsx
```

---

## shadcn/ui Components Needed

```bash
npx shadcn@latest add avatar dropdown-menu sheet separator
```
