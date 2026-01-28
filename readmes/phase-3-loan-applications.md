# Phase 3: Loan Applications

**Status:** [ ] Not Started  
**Duration:** 3-4 days

---

## Endpoints for Manual Testing

### Officer Endpoints

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Applications | GET | `/api/loans/officer/applications/` | [ ] |
| Get Application | GET | `/api/loans/officer/applications/{id}/` | [ ] |
| Review (Approve/Reject) | POST | `/api/loans/officer/applications/{id}/review/` | [ ] |
| Disburse Loan | POST | `/api/loans/officer/applications/{id}/disburse/` | [ ] |
| Assign Officer | POST | `/api/loans/officer/applications/{id}/assign/` | [ ] |

### Loan Products

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Products | GET | `/api/loans/products/` | [ ] |
| Get Product | GET | `/api/loans/products/{id}/` | [ ] |

---

## Request/Response Examples

### List Applications

```bash
GET /api/loans/officer/applications/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` - pending, under_review, approved, rejected, disbursed
- `risk_level` - low, medium, high
- `date_from` - YYYY-MM-DD
- `date_to` - YYYY-MM-DD
- `search` - customer name or email
- `page` - page number

**Response:**
```json
{
  "count": 50,
  "next": "/api/loans/officer/applications/?page=2",
  "previous": null,
  "results": [
    {
      "id": "app_123",
      "customer": {
        "id": "cust_456",
        "email": "customer@example.com",
        "first_name": "Maria",
        "last_name": "Santos"
      },
      "loan_product": {
        "id": "prod_789",
        "name": "MSME Working Capital"
      },
      "amount_requested": 50000,
      "term_months": 12,
      "status": "pending",
      "risk_level": "low",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Application Detail

```bash
GET /api/loans/officer/applications/{id}/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "app_123",
  "customer": {...},
  "loan_product": {...},
  "amount_requested": 50000,
  "amount_approved": null,
  "term_months": 12,
  "interest_rate": 12.5,
  "status": "pending",
  "risk_level": "medium",
  "risk_score": 65,
  "documents": [...],
  "business_profile": {...},
  "alternative_data": {...},
  "created_at": "2024-01-15T10:30:00Z",
  "reviewed_at": null,
  "reviewed_by": null,
  "rejection_reason": null
}
```

### Review Application (Approve)

```bash
POST /api/loans/officer/applications/{id}/review/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "decision": "approved",
  "amount_approved": 45000,
  "notes": "Good credit history, approved with reduced amount"
}
```

### Review Application (Reject)

```bash
POST /api/loans/officer/applications/{id}/review/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "decision": "rejected",
  "rejection_reason": "Incomplete documentation"
}
```

### Disburse Loan

```bash
POST /api/loans/officer/applications/{id}/disburse/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "disbursement_method": "bank_transfer",
  "reference_number": "REF123456"
}
```

---

## Frontend Tasks

- [ ] Create applications list page
- [ ] Create data table with filters
- [ ] Create application detail page
- [ ] Create approval modal
- [ ] Create rejection modal
- [ ] Create disbursement modal
- [ ] Add status badges
- [ ] Add pagination

---

## Status Badge Colors

| Status | Color |
|--------|-------|
| pending | Yellow |
| under_review | Blue |
| approved | Green |
| rejected | Red |
| disbursed | Purple |
| completed | Gray |
