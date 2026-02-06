# Phase 6: Analytics Dashboard

**Status:** ✅ Complete  
**Last Updated:** 2026-02-05

---

## Overview

Phase 6 implements analytics dashboards for Admin and Loan Officer roles, providing real-time insights into system activity, loan performance, and user statistics.

---

## Role Access Summary

| Role | Dashboard | Features |
|------|-----------|----------|
| **Admin** | Admin Dashboard | Users/Loans stats, Charts (Status Bar, Products Pie), Audit Logs |
| **Super Admin** | Admin Dashboard (same as Admin) | All Admin features + Can manage other admins* |
| **Loan Officer** | Officer Dashboard | My Reviews, Queue, Performance metrics |
| **Customer** | ❌ No dashboard | Analytics available via Mobile App |

> **Note:** Admin and Super Admin see the **exact same analytics dashboard**. The only difference is that Super Admin can access the "Admins" page to manage other administrators (not yet fully implemented on frontend - see Phase 7).

---

## Implementation Status

### Admin Portal
| Feature | Status | File |
|---------|--------|------|
| Dashboard Stats (Users/Loans) | ✅ | `AdminDashboardPage.tsx` |
| Status Bar Chart (Recharts) | ✅ | `StatusBarChart.tsx` |
| Products Pie Chart (Recharts) | ✅ | `ProductsPieChart.tsx` |
| Product Performance Table | ✅ | `AdminDashboardPage.tsx` |
| Recent Activity Feed | ✅ | `AdminDashboardPage.tsx` |
| Audit Logs Table | ✅ | `AdminAuditLogsPage.tsx` |
| Audit Logs - Action Filter | ✅ | `AdminAuditLogsPage.tsx` |
| Audit Logs - Date Range Filter | ✅ | `AdminAuditLogsPage.tsx` |
| Audit Logs - CSV Export | ✅ | `AdminAuditLogsPage.tsx` |
| useAdminDashboard Hook | ✅ | `useAdminApi.ts` |
| useAuditLogs Hook | ✅ | `useAdminApi.ts` |

### Loan Officer Portal
| Feature | Status | File |
|---------|--------|------|
| Dashboard Stats (Real API Data) | ✅ | `OfficerDashboardPage.tsx` |
| Loading Skeleton State | ✅ | `OfficerDashboardPage.tsx` |
| Error State with Retry | ✅ | `OfficerDashboardPage.tsx` |
| Today's Activity Summary | ✅ | `OfficerDashboardPage.tsx` |
| All-Time Stats Summary | ✅ | `OfficerDashboardPage.tsx` |
| API Function | ✅ | `analyticsApi.ts` |
| useOfficerDashboard Hook | ✅ | `useOfficerDashboard.ts` |
| TypeScript Types | ✅ | `api.ts` |

---

## API Endpoints

### Admin Endpoints
```
GET /api/analytics/admin/           # Admin dashboard data
GET /api/analytics/audit-logs/      # Audit logs with filters
```

### Loan Officer Endpoints
```
GET /api/analytics/officer/         # Officer dashboard data
```

### Query Parameters for Audit Logs

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | string | Filter by action type (login, logout, loan_approved, etc.) |
| `limit` | number | Number of entries to return (default: 25) |
| `date_from` | string | Start date filter (YYYY-MM-DD) |
| `date_to` | string | End date filter (YYYY-MM-DD) |

---

## Request/Response Examples

### Officer Dashboard

```bash
GET /api/analytics/officer/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "my_reviews": {
      "total_approved": 28,
      "total_rejected": 5,
      "approved_today": 3,
      "rejected_today": 1
    },
    "queue": {
      "pending_total": 12,
      "assigned_to_me": 4
    },
    "performance": {
      "total_reviewed": 33,
      "approval_rate": "84.8%"
    }
  }
}
```

### Admin Dashboard

```bash
GET /api/analytics/admin/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "customers": 150,
      "loan_officers": 5,
      "admins": 2,
      "total": 157
    },
    "loans": {
      "total": 45,
      "pending": 12,
      "under_review": 8,
      "approved": 28,
      "rejected": 5
    },
    "documents": {
      "total": 200,
      "pending": 50,
      "verified": 150
    },
    "ai_usage": {
      "sessions_last_7_days": 25
    },
    "products": [
      {
        "name": "Micro Loan",
        "applications": 30,
        "approved": 25,
        "approval_rate": "83.3%"
      }
    ],
    "recent_activity": [
      {
        "action": "loan_approved",
        "user_type": "loan_officer",
        "description": "Loan #12345 approved",
        "timestamp": "2026-02-05T10:30:00Z"
      }
    ]
  }
}
```

### Audit Logs

```bash
GET /api/analytics/audit-logs/?action=login&limit=25&date_from=2026-02-01&date_to=2026-02-05
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "log_001",
        "user_id": "user_123",
        "user_type": "loan_officer",
        "action": "login",
        "description": "User logged in successfully",
        "resource_type": "session",
        "resource_id": null,
        "ip_address": "192.168.1.100",
        "timestamp": "2026-02-05T10:30:00Z"
      }
    ],
    "total": 150
  }
}
```

---

## Comprehensive Testing Guide

### Prerequisites

1. **Backend running:** `cd backend && python manage.py runserver`
2. **Frontend running:** `npm run dev`
3. **Test accounts:**
   - Regular Admin: `admin@test.com` / `Test123!`
   - Super Admin: `superadmin@test.com` / `Test123!` (if created via CLI)
   - Loan Officer: `officer@test.com` / `Test123!`
4. **Some loan applications and activity data in the system**

> **Note:** If you don't have a Super Admin account, create one via CLI:
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

### Admin Tests - Dashboard

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.A1 | **View Dashboard** | Admin → Dashboard | Shows Users Overview, Loans Overview sections |
| P6.A2 | **Users Stats Display** | Check Users Overview | Shows Customers, Loan Officers, Admins counts |
| P6.A3 | **Loans Stats Display** | Check Loans Overview | Shows Total Applications, Pending Review, Approval Rate |
| P6.A4 | **Status Bar Chart** | Check "Applications by Status" card | Bar chart with Pending, Under Review, Approved, Rejected bars |
| P6.A5 | **Products Pie Chart** | Check "Applications by Product" card | Pie chart showing distribution across loan products |
| P6.A6 | **Product Performance Table** | Scroll to Product Performance | Table with Product, Applications, Approved, Approval Rate columns |
| P6.A7 | **Recent Activity Feed** | Scroll to Recent Activity | List of recent actions with timestamps and badges |
| P6.A8 | **Dashboard Refresh** | Click "Refresh" button | Data reloads, shows updated stats |
| P6.A9 | **Loading State** | Slow network/first load | Skeleton cards animate while loading |
| P6.A10 | **Error State** | Disconnect backend | Error card with retry button appears |
| P6.A11 | **Error Retry** | Click "Retry" on error state | Dashboard attempts to reload |

### Admin vs Super Admin - Role Verification

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.A12 | **Admin Dashboard Access** | Login as regular admin → Dashboard | Same dashboard as super admin |
| P6.A13 | **Super Admin Dashboard** | Login as super admin → Dashboard | Identical dashboard to regular admin |
| P6.A14 | **Admin Sidebar Check** | Login as regular admin → Check sidebar | No "Admins" menu item |
| P6.A15 | **Super Admin Sidebar** | Login as super admin → Check sidebar | "Admins" menu item visible |
| P6.A16 | **Admin URL Block** | Login as admin → Navigate to `/admin/admins` | Page shows placeholder (not implemented yet) |
| P6.A17 | **Analytics Data Same** | Compare dashboard data for both roles | Numbers are identical |

> **Important:** Both Admin and Super Admin roles see the same analytics dashboard in Phase 6. The "Admins" management page is visible in the sidebar for Super Admin but is not yet fully implemented (Phase 7).










# NOT TESTED
### Admin Tests - Audit Logs

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.A18 | **View Audit Logs** | Admin → Audit Logs | Shows filter card and logs table |
| P6.A19 | **Filter by Action** | Select "Login" from Action Type dropdown | Only login events displayed |
| P6.A20 | **Filter by Limit** | Select "50 entries" from Show dropdown | Up to 50 entries displayed |
| P6.A21 | **Date From Filter** | Set "From Date" to yesterday | Only logs from that date onwards |
| P6.A22 | **Date To Filter** | Set "To Date" to today | Only logs up to that date |
| P6.A23 | **Date Range Filter** | Set both From and To dates | Shows logs within date range |
| P6.A24 | **Clear Dates** | Click "Clear Dates" button | Date filters reset, all logs shown |
| P6.A25 | **Export CSV** | Click "Export CSV" button | CSV file downloads with log data |
| P6.A26 | **Export Empty** | Filter to no results, try export | Export button disabled or no download |
| P6.A27 | **Logs Table Columns** | Check table headers | Time, User, Action, Description, IP columns |
| P6.A28 | **Action Badge Colors** | Check action badges | Different colors for login/approved/rejected/created |
| P6.A29 | **Refresh Logs** | Click "Refresh" button | Logs reload with current filters |
| P6.A30 | **No Logs State** | Filter to impossible criteria | "No logs found" empty state |

---

### Loan Officer Tests - Dashboard

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.O1 | **View Dashboard** | Officer → Dashboard | Shows Welcome message and Stats Grid |
| P6.O2 | **Total Approved Stat** | Check "Total Approved" card | Shows all-time approval count |
| P6.O3 | **Assigned to Me Stat** | Check "Assigned to Me" card | Shows current queue count |
| P6.O4 | **Approved Today Stat** | Check "Approved Today" card | Shows today's approved count |
| P6.O5 | **Approval Rate Stat** | Check "Approval Rate" card | Shows percentage with total reviewed |
| P6.O6 | **Today's Activity Card** | Check "Today's Activity" section | Shows today's approved and rejected counts |
| P6.O7 | **All-Time Stats Card** | Check "All-Time Stats" section | Shows total reviewed and total rejected |
| P6.O8 | **Dashboard Refresh** | Click "Refresh" button | Data reloads with updated values |
| P6.O9 | **Loading Skeleton** | First load/slow network | 4 skeleton stat cards animate |
| P6.O10 | **Error State** | Disconnect backend | Red error card with message |
| P6.O11 | **Error Retry** | Click "Retry" button | Dashboard reloads |
| P6.O12 | **Quick Actions** | Check Quick Actions section | View Queue and Record Payment buttons |

---

### Error Handling Tests

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.E1 | **Admin Dashboard - Network Error** | Disconnect network → Navigate to Dashboard | Error card with retry button |
| P6.E2 | **Officer Dashboard - API Error** | Backend returns 500 | Error message displayed |
| P6.E3 | **Audit Logs - Network Error** | Disconnect network → Navigate to Audit Logs | Error card with retry button |
| P6.E4 | **Invalid Date Range** | Set From date after To date | Backend handles gracefully |
| P6.E5 | **Session Expired** | Wait for token expiry → Refresh | Redirect to login or refresh token |

---

### Chart Visualization Tests

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P6.C1 | **Bar Chart Rendering** | Admin Dashboard → Applications by Status | 4 colored bars render correctly |
| P6.C2 | **Bar Chart Tooltip** | Hover over a bar | Tooltip shows status name and count |
| P6.C3 | **Bar Chart Colors** | Check bar colors | Pending=Amber, Under Review=Blue, Approved=Green, Rejected=Red |
| P6.C4 | **Pie Chart Rendering** | Admin Dashboard → Applications by Product | Pie chart with labeled slices |
| P6.C5 | **Pie Chart Tooltip** | Hover over a slice | Tooltip shows product name and count |
| P6.C6 | **Pie Chart Legend** | Check below chart | Legend shows all product names with colors |
| P6.C7 | **Pie Chart Empty** | No products in system | "No product data available" message |
| P6.C8 | **Charts Responsive** | Resize browser window | Charts resize to fit container |

---

## Files Modified/Created

### New Files
| Path | Description |
|------|-------------|
| `src/features/loan-officer/api/analyticsApi.ts` | Officer analytics API function |
| `src/features/loan-officer/hooks/useOfficerDashboard.ts` | Officer dashboard hook |
| `src/features/admin/components/charts/StatusBarChart.tsx` | Recharts bar chart component |
| `src/features/admin/components/charts/ProductsPieChart.tsx` | Recharts pie chart component |
| `src/features/admin/components/charts/index.ts` | Charts exports |

### Modified Files
| Path | Changes |
|------|---------|
| `src/types/api.ts` | Added `OfficerDashboardData` interface |
| `src/features/loan-officer/hooks/index.ts` | Export `useOfficerDashboard` |
| `src/features/loan-officer/pages/OfficerDashboardPage.tsx` | API integration, loading/error states |
| `src/features/admin/pages/AdminDashboardPage.tsx` | Added Recharts visualizations |
| `src/features/admin/pages/AdminAuditLogsPage.tsx` | Date filter, CSV export |
| `src/features/admin/api/adminApi.ts` | Date params for audit logs |
| `src/features/admin/hooks/useAdminApi.ts` | Date params for audit logs hook |

---

## TypeScript Interfaces

### OfficerDashboardData
```typescript
export interface OfficerDashboardData {
  my_reviews: {
    total_approved: number;
    total_rejected: number;
    approved_today: number;
    rejected_today: number;
  };
  queue: {
    pending_total: number;
    assigned_to_me: number;
  };
  performance: {
    total_reviewed: number;
    approval_rate: string;
  };
}
```

### AdminDashboardData
```typescript
export interface AdminDashboardData {
  users: {
    customers: number;
    loan_officers: number;
    admins: number;
    total: number;
  };
  loans: {
    total: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  documents: {
    total: number;
    pending: number;
    verified: number;
  };
  ai_usage: {
    sessions_last_7_days: number;
  };
  products: Array<{
    name: string;
    applications: number;
    approved: number;
    approval_rate: string;
  }>;
  recent_activity: Array<{
    action: string;
    user_type: string;
    description: string;
    timestamp: string;
  }>;
}
```

---

## UI Components Used

| Component | Source | Usage |
|-----------|--------|-------|
| Card, CardContent, CardHeader | `@/components/ui/card` | Dashboard cards, stat cards |
| Button | `@/components/ui/button` | Refresh, Export, Retry actions |
| Badge | `@/components/ui/badge` | Action type badges, status indicators |
| Input | `@/components/ui/input` | Date filter inputs |
| BarChart, PieChart | `recharts` | Data visualizations |
| Lucide Icons | `lucide-react` | All icons throughout |

---

## Chart Colors Reference

### Status Bar Chart
| Status | Color | Hex |
|--------|-------|-----|
| Pending | Amber | `#f59e0b` |
| Under Review | Blue | `#3b82f6` |
| Approved | Green | `#10b981` |
| Rejected | Red | `#ef4444` |

### Products Pie Chart
Uses rotating color palette: Blue, Teal, Yellow, Orange, Purple, Green, Light Orange, Light Blue

---

## Acceptance Criteria

- [x] Officer Dashboard loads real data from `/api/analytics/officer/`
- [x] Officer Dashboard shows loading skeleton while fetching
- [x] Officer Dashboard shows error state with retry on failure
- [x] Admin Dashboard has bar chart for status breakdown
- [x] Admin Dashboard has pie chart for product distribution
- [x] Audit Logs page has date range filter
- [x] Audit Logs page has CSV export functionality
- [x] All TypeScript types are properly defined
- [x] Biome lint passes with no errors
- [x] Application builds successfully
