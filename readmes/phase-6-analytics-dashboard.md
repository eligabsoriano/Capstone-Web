# Phase 6: Analytics Dashboard

**Status:** [ ] Not Started  
**Duration:** 1-2 days

---

## Endpoints for Manual Testing

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| Officer Dashboard | GET | `/api/analytics/officer/dashboard/` | [ ] |
| Admin Dashboard | GET | `/api/analytics/admin/dashboard/` | [ ] |
| Audit Logs | GET | `/api/analytics/audit-logs/` | [ ] |
| Reports | GET | `/api/analytics/reports/` | [ ] |

---

## Request/Response Examples

### Officer Dashboard

```bash
GET /api/analytics/officer/dashboard/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "summary": {
    "applications_pending": 12,
    "applications_approved_today": 5,
    "applications_rejected_today": 2,
    "total_disbursed_this_month": 1250000
  },
  "recent_applications": [
    {
      "id": "app_123",
      "customer_name": "Maria Santos",
      "amount": 50000,
      "status": "pending",
      "created_at": "2024-01-28T10:30:00Z"
    }
  ],
  "applications_by_status": {
    "pending": 12,
    "under_review": 8,
    "approved": 45,
    "rejected": 15,
    "disbursed": 38
  }
}
```

### Admin Dashboard

```bash
GET /api/analytics/admin/dashboard/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "summary": {
    "total_customers": 1250,
    "total_applications": 890,
    "active_loans": 312,
    "total_disbursed": 15600000,
    "total_collected": 8750000
  },
  "applications_over_time": [
    { "date": "2024-01-01", "applications": 15, "approvals": 12 },
    { "date": "2024-01-02", "applications": 18, "approvals": 14 },
    { "date": "2024-01-03", "applications": 22, "approvals": 18 }
  ],
  "top_loan_products": [
    { "name": "MSME Working Capital", "count": 245, "amount": 5600000 },
    { "name": "Microenterprise Starter", "count": 189, "amount": 2800000 }
  ],
  "officer_performance": [
    { "name": "John Doe", "reviewed": 45, "approved": 38 },
    { "name": "Jane Smith", "reviewed": 52, "approved": 41 }
  ]
}
```

### Audit Logs

```bash
GET /api/analytics/audit-logs/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `user_id` - Filter by user
- `action` - login, logout, approve, reject, etc.
- `date_from` - YYYY-MM-DD
- `date_to` - YYYY-MM-DD
- `page` - page number

**Response:**
```json
{
  "count": 500,
  "results": [
    {
      "id": "log_001",
      "user_email": "officer@example.com",
      "action": "application_approved",
      "resource_type": "loan_application",
      "resource_id": "app_123",
      "details": {
        "amount_approved": 45000,
        "customer_name": "Maria Santos"
      },
      "ip_address": "192.168.1.100",
      "created_at": "2024-01-28T10:30:00Z"
    }
  ]
}
```

---

## Frontend Tasks

- [ ] Create stat cards component
- [ ] Create applications chart (Recharts)
- [ ] Create recent activity feed
- [ ] Create audit logs table
- [ ] Add date range filter
- [ ] Create officer performance table (admin)
- [ ] Add export functionality

---

## Charts to Implement

| Chart | Library | Use |
|-------|---------|-----|
| Line Chart | Recharts | Applications over time |
| Bar Chart | Recharts | Status breakdown |
| Pie Chart | Recharts | Products distribution |
