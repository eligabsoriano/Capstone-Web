# Phase 5: Payments

**Status:** [ ] Not Started  
**Duration:** 2 days

---

## Endpoints for Manual Testing

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| Record Payment | POST | `/api/loans/officer/payments/record/` | [ ] |
| Payment History | GET | `/api/loans/customer/payments/` | [ ] |
| Repayment Schedule | GET | `/api/loans/applications/{id}/schedule/` | [ ] |

---

## Request/Response Examples

### Get Repayment Schedule

```bash
GET /api/loans/applications/{id}/schedule/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "loan_application_id": "app_123",
  "total_amount": 56000,
  "amount_paid": 14000,
  "remaining_balance": 42000,
  "installments": [
    {
      "installment_number": 1,
      "due_date": "2024-02-15",
      "principal_amount": 4000,
      "interest_amount": 666.67,
      "total_amount": 4666.67,
      "status": "paid",
      "amount_paid": 4666.67,
      "payment_date": "2024-02-10"
    },
    {
      "installment_number": 2,
      "due_date": "2024-03-15",
      "principal_amount": 4000,
      "interest_amount": 625.00,
      "total_amount": 4625.00,
      "status": "paid",
      "amount_paid": 4625.00,
      "payment_date": "2024-03-14"
    },
    {
      "installment_number": 3,
      "due_date": "2024-04-15",
      "principal_amount": 4000,
      "interest_amount": 583.33,
      "total_amount": 4583.33,
      "status": "overdue",
      "amount_paid": 0,
      "payment_date": null
    }
  ]
}
```

### Record Payment

```bash
POST /api/loans/officer/payments/record/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "loan_application_id": "app_123",
  "amount": 4583.33,
  "payment_method": "cash",
  "reference_number": "REC-2024-001",
  "notes": "Payment for March installment"
}
```

**Response:**
```json
{
  "message": "Payment recorded successfully",
  "payment": {
    "id": "pay_789",
    "loan_application_id": "app_123",
    "amount": 4583.33,
    "payment_method": "cash",
    "reference_number": "REC-2024-001",
    "recorded_by": "officer@example.com",
    "created_at": "2024-04-20T10:30:00Z"
  },
  "updated_schedule": {
    "remaining_balance": 37416.67,
    "next_due_date": "2024-05-15"
  }
}
```

### Get Payment History

```bash
GET /api/loans/customer/payments/?loan_id={loan_application_id}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "results": [
    {
      "id": "pay_001",
      "amount": 4666.67,
      "payment_method": "bank_transfer",
      "reference_number": "BT-2024-001",
      "payment_date": "2024-02-10",
      "recorded_by": "John Doe",
      "notes": null
    },
    {
      "id": "pay_002",
      "amount": 4625.00,
      "payment_method": "gcash",
      "reference_number": "GC-2024-002",
      "payment_date": "2024-03-14",
      "recorded_by": "John Doe",
      "notes": null
    }
  ]
}
```

---

## Payment Methods

| Method | Value |
|--------|-------|
| Cash | `cash` |
| Bank Transfer | `bank_transfer` |
| GCash | `gcash` |
| Maya | `maya` |

---

## Payment Status Colors

| Status | Color |
|--------|-------|
| pending | Default/Gray |
| paid | Green |
| overdue | Red |
| partial | Yellow |

---

## Frontend Tasks

- [ ] Create repayment schedule view
- [ ] Create record payment modal
- [ ] Create payment history table
- [ ] Add overdue payment indicators
- [ ] Add payment status badges
- [ ] Add payment summary cards
