# Phase 5: Payments

**Status:** [x] Complete  
**Duration:** 2 days

---

## Implementation Status

### Backend Implementation ✅ Complete

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| Record Payment | POST | `/api/loans/officer/payments/` | ✅ |
| Payment History | GET | `/api/loans/applications/{id}/payments/` | ✅ |
| Repayment Schedule | GET | `/api/loans/applications/{id}/schedule/` | ✅ |
| Active Loans Search | GET | `/api/loans/officer/active-loans/` | ✅ |

### Frontend Implementation ✅ Complete

| Component | File | Status |
|-----------|------|--------|
| Payments Page | `OfficerPaymentsPage.tsx` | ✅ |
| Record Payment Form | (inline in page) | ✅ |
| Active Loan Search | (inline in page) | ✅ |
| API Functions | `paymentsApi.ts` | ✅ |
| Hooks | `usePayments.ts` | ✅ |
| Sidebar Link | `OfficerSidebar.tsx` | ✅ |
| Route | `/officer/payments` | ✅ |

### Frontend Features (All Complete ✅)

| Feature | Status | Description |
|---------|--------|-------------|
| Payment History Table | ✅ | `PaymentHistoryCard.tsx` component |
| Full Schedule View | ✅ | `RepaymentScheduleCard.tsx` component |
| Overdue Indicators | ✅ | Red row highlighting for overdue installments |
| Status Badges | ✅ | Color-coded paid/pending/overdue/partial badges |

---

## Files Created/Modified

### Backend Files
| File | Description |
|------|-------------|
| `loans/models/payment.py` | LoanPayment model for recording payments |
| `loans/models/repayment.py` | RepaymentSchedule model with installments |
| `loans/views/officer_views.py` | RecordPaymentView, ActiveLoansView |
| `loans/views/customer_views.py` | RepaymentScheduleView, PaymentHistoryView |

### Frontend Files
| File | Description |
|------|-------------|
| `features/loan-officer/pages/OfficerPaymentsPage.tsx` | Main payments page |
| `features/loan-officer/api/paymentsApi.ts` | API functions |
| `features/loan-officer/hooks/usePayments.ts` | React Query hooks |

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
POST /api/loans/officer/payments/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "loan_id": "app_123",
  "installment_number": 3,
  "amount": 4583.33,
  "payment_method": "cash",
  "reference": "REC-2024-001",
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
GET /api/loans/applications/{id}/payments/
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
| Check | `check` |

---

## Payment Status Colors

| Status | Color |
|--------|-------|
| pending | Default/Gray |
| paid | Green |
| overdue | Red |
| partial | Yellow |

---

## Testing Guide

### Prerequisites
1. Backend server running at `http://localhost:8000`
2. Frontend dev server running (`npm run dev`)
3. Logged in as Loan Officer
4. At least one **disbursed** loan in the system

### Test 1: Access Payments Page

1. Login as loan officer
2. Navigate to `/officer/payments` via sidebar
3. **Expected:** Payments page loads with search and form

### Test 2: Search for Active Loans

1. On Payments page, enter a customer name or email
2. Click the search button
3. **Expected:** List of active (disbursed) loans appears

### Test 3: Select a Loan

1. Click on a loan from search results
2. **Expected:** Loan details appear (customer, balance, next due)
3. Form pre-fills with installment number and amount

### Test 4: Record a Payment

1. Select a loan
2. Enter installment number, amount, payment method
3. Optionally add reference and notes
4. Click "Record Payment"
5. **Expected:** Success toast, confirmation shows remaining balance

### Test 5: Verify Payment in Backend

```bash
# Check schedule was updated
GET /api/loans/applications/{loan_id}/schedule/

# Check payment was recorded
GET /api/loans/applications/{loan_id}/payments/
```

### Test 6: Validate Payment Restrictions

1. Try recording payment for already paid installment
   - **Expected:** Error "Installment already paid"
2. Try recording amount higher than due
   - **Expected:** Error about overpayment

---

## Frontend Tasks

- [x] Create record payment form
- [x] Create active loan search
- [x] Add payment method dropdown
- [x] Add payment summary cards
- [x] Create repayment schedule view (shows all installments)
- [x] Create payment history table
- [x] Add overdue payment indicators (red highlighting)
- [x] Add payment status badges (paid/pending/overdue colors)

---

## Backend Validation

The `RecordPaymentView` includes these validations:
- ✅ Loan must be disbursed
- ✅ Repayment schedule must exist
- ✅ Can't pay already-paid installments
- ✅ Can't overpay (with 1% tolerance for rounding)
- ✅ Must pay in order (no skipping installments)
