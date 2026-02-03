# Phase 3: Loan Applications

**Status:** ✅ Complete  
**Last Updated:** 2026-01-29

---

## Overview

Phase 3 implements loan product management (Admin) and loan application processing (Loan Officer).

---

## Role Access Summary

| Role | Can Access Applications? | How? |
|------|-------------------------|------|
| **Loan Officer** | ✅ Yes | View, approve/reject, disburse, record payments |
| **Admin** | ❌ No | Views aggregate stats; can assign apps via Workload |
| **Super Admin** | ❌ No | Same as Admin + can manage other admins |

> [!IMPORTANT]
> Customers apply for loans via the **Mobile App**, not this web dashboard.

---

## Implementation Status

### Admin - Loan Products CRUD
| Feature | Status | File |
|---------|--------|------|
| Products List | ✅ | `AdminProductsPage.tsx` |
| Create Product (full form) | ✅ | `AdminProductsPage.tsx` |
| Edit Product | ✅ | `AdminProductsPage.tsx` |
| Delete Product (soft delete) | ✅ | `AdminProductsPage.tsx` |
| Officer Workload View | ✅ | `AdminWorkloadPage.tsx` |
| Assign Application | ✅ | `AdminWorkloadPage.tsx` |

### Loan Product Form Fields
| Field | Description | Status |
|-------|-------------|--------|
| Name | Product name | ✅ |
| Code | Unique product code | ✅ |
| Description | Product description | ✅ |
| Min/Max Amount | Loan amount range | ✅ |
| Interest Rate | Annual interest rate (%) | ✅ |
| Min/Max Term | Loan term in months | ✅ |
| Required Documents | Documents customer must upload | ✅ |
| Min Business Months | Minimum business age | ✅ |
| Min Monthly Income | Minimum monthly income | ✅ |
| Business Types | Target business types | ✅ |
| Target Description | Marketing text | ✅ |

### Loan Officer - Application Processing
| Feature | Status | File |
|---------|--------|------|
| Applications List | ✅ | `OfficerApplicationsPage.tsx` |
| Filter by status | ✅ | (dropdown in page) |
| Application Detail | ✅ | `OfficerApplicationDetailPage.tsx` |
| Approval Modal | ✅ | `ApprovalModal.tsx` |
| Rejection Modal | ✅ | `RejectionModal.tsx` |
| Disbursement Modal | ✅ | `DisbursementModal.tsx` |
| Record Payment | ✅ | `OfficerPaymentsPage.tsx` |

---

## API Endpoints

### Admin Endpoints
```
GET    /api/loans/admin/products/              # List all products
POST   /api/loans/admin/products/              # Create product
PUT    /api/loans/admin/products/{id}/         # Update product
DELETE /api/loans/admin/products/{id}/         # Delete product (soft)
GET    /api/loans/admin/officers/workload/     # Officer workload
POST   /api/loans/admin/applications/{id}/assign/  # Assign to officer
```

### Loan Officer Endpoints
```
GET  /api/loans/officer/applications/             # List applications
GET  /api/loans/officer/applications/{id}/        # Application detail
PUT  /api/loans/officer/applications/{id}/review/ # Approve/Reject
POST /api/loans/officer/applications/{id}/disburse/ # Disburse loan
POST /api/loans/officer/payments/                 # Record payment
```

---

## Comprehensive Testing Guide

### Prerequisites

1. **Backend running:** `cd backend && python manage.py runserver`
2. **Frontend running:** `npm run dev`
3. **Test accounts:**
   - Admin: `admin@test.com` / `Test123!`
   - Loan Officer: `officer@test.com` / `Test123!`
4. **At least one loan product created**
5. **At least one loan application** (via mobile app or MongoDB insert)

### Create Test Data (if needed)

```python
# Django shell: python manage.py shell

# Create loan officer
from accounts.models import LoanOfficer
officer = LoanOfficer(
    email="officer@test.com",
    first_name="Test",
    last_name="Officer",
    employee_id="EMP001"
)
officer.set_password("Test123!")
officer.save()

# Create loan product
from loans.models import LoanProduct
product = LoanProduct(
    name="Business Loan",
    code="BL001",
    description="For small businesses",
    min_amount=10000,
    max_amount=100000,
    interest_rate=0.12,
    min_term_months=3,
    max_term_months=24,
    required_documents=["valid_id"],
    min_business_months=6,
    min_monthly_income=5000
)
product.save()
print(f"Product ID: {product.id}")

# Create test application
from loans.models import LoanApplication
app = LoanApplication(
    customer_id="test_customer_123",
    product_id=product.id,
    requested_amount=50000,
    term_months=12,
    purpose="Business expansion",
    status="draft"
)
app.submit()  # Changes status to "submitted"
print(f"Application ID: {app.id}")
```

---

### Admin Tests - Loan Products

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.A1 | **View Products List** | Admin → Loan Products | Shows table with all products |
| P3.A2 | **Create Product (Basic)** | Click "Add Product" → Fill name, code, amounts → Create | Product appears in list |
| P3.A3 | **Create Product (Full)** | Add Product → Fill ALL fields including documents, business types → Create | Product created with all eligibility requirements |
| P3.A4 | **Edit Product** | Click edit icon on product → Change values → Update | Values updated in list |
| P3.A5 | **Delete Product** | Click delete icon → Confirm | Product removed from list (soft deleted) |
| P3.A6 | **Interest Rate Format** | Create product with 12% rate | Stored as 0.12 in DB, displays as 12% in UI |

### Admin Tests - Officer Workload

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.A7 | **View Workload** | Admin → Officer Workload | Shows table with officers and pending counts |
| P3.A8 | **Assign Application** | Click "Assign" on officer → Enter application ID → Submit | Assignment success message |

---

### Loan Officer Tests - Applications

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.O1 | **View Pending Apps** | Officer → Applications | List of pending applications |
| P3.O2 | **Filter: My Apps** | Click status dropdown → Select "mine" | Shows only assigned applications |
| P3.O3 | **View Detail** | Click on an application | Full detail page with AI recommendation |
| P3.O4 | **Approve App** | Detail → Click "Approve" → Enter amount & notes → Confirm | Status changes to "approved" |
| P3.O5 | **Reject App** | Detail → Click "Reject" → Enter reason & notes → Confirm | Status changes to "rejected" |

### Loan Officer Tests - Disbursement

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.O6 | **Disburse Loan** | Open approved app → Click "Disburse" → Enter method & reference → Submit | Status changes to "disbursed" |
| P3.O7 | **Missing Reference** | Try to disburse without reference | Error: "Reference is required" |

### Loan Officer Tests - Payments

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.O8 | **View Payments Page** | Officer → Record Payment | Form with loan ID, installment, amount fields |
| P3.O9 | **Record Payment** | Fill form → Submit | Success message, payment recorded |
| P3.O10 | **Invalid Amount** | Enter negative or zero amount | Error message shown |

---

### Error Handling Tests

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| P3.E1 | **Create Product - Missing Required** | Submit with empty name/code | Error: "Name and code are required" |
| P3.E2 | **Approve - Invalid Amount** | Approve with 0 or negative amount | Error message |
| P3.E3 | **Disburse Already Disbursed** | Try to disburse already disbursed loan | Error: status mismatch |
| P3.E4 | **Record Payment - No Schedule** | Record payment for loan without schedule | Error: "Schedule not found" |

---

## Product Form Field Reference

When creating a loan product, these fields affect the AI qualification system:

| Field | Effect on Qualification |
|-------|------------------------|
| `required_documents` | Customer must upload these docs to apply |
| `min_business_months` | Business must be operating for this long |
| `min_monthly_income` | Customer must earn at least this amount |
| `business_types` | If set, only these business types can apply |
| `target_description` | Shown to customers in mobile app |

---

## Files Modified/Created

### Admin Features
- `src/features/admin/pages/AdminProductsPage.tsx` - Full product CRUD with eligibility fields
- `src/features/admin/pages/AdminWorkloadPage.tsx` - Officer workload + assign modal
- `src/features/admin/hooks/useWorkloadAndProducts.ts` - React Query hooks
- `src/features/admin/api/adminApi.ts` - Products API functions

### Loan Officer Features
- `src/features/loan-officer/pages/OfficerApplicationsPage.tsx` - Applications list
- `src/features/loan-officer/pages/OfficerApplicationDetailPage.tsx` - Detail + modals
- `src/features/loan-officer/pages/OfficerPaymentsPage.tsx` - Record payment form
- `src/features/loan-officer/components/ApprovalModal.tsx`
- `src/features/loan-officer/components/RejectionModal.tsx`
- `src/features/loan-officer/components/DisbursementModal.tsx`

### Types
- `src/types/api.ts` - LoanProduct, CreateProductRequest, RecordPayment types

---

## Application Status Definitions

Source: `backend/loans/models/application.py`

| Status | Description | Next States |
|--------|-------------|-------------|
| `draft` | Application started but not submitted | submitted, cancelled |
| `submitted` | Waiting for officer assignment | under_review |
| `under_review` | Assigned to loan officer for review | approved, rejected |
| `approved` | Approved by loan officer | disbursed |
| `rejected` | Rejected by loan officer | draft (via resubmit) |
| `disbursed` | Loan amount transferred to customer | (final) |
| `cancelled` | Cancelled by customer | (final) |

**Status Flow:**
```
draft → submitted → under_review → approved → disbursed
                              ↘ rejected → (resubmit) → draft
```

---

## Risk Category Definitions

Source: `backend/loans/services/qualification.py`

| Category | Score Range | UI Color | Description |
|----------|-------------|----------|-------------|
| `low` | 75-100 | Green | Low risk, recommended for approval |
| `medium` | 50-74 | Yellow | Moderate risk, review carefully |
| `high` | 0-49 | Red | High risk, likely rejection |

---

## AI Recommendation Object Structure

The backend returns a structured object (not string) for AI recommendations:

```typescript
interface AIRecommendation {
  eligible: boolean;           // Overall eligibility
  eligibility_score: number;   // 0-100
  risk_category: "low" | "medium" | "high";
  recommended_amount: number;  // Suggested loan amount
  reasoning: string;           // AI explanation
  strengths: string[];         // Positive factors
  concerns: string[];          // Risk factors
  missing_requirements: string[]; // Blocking issues
}
```

---

## Record Payment - Detailed Guide

### What is "Record Payment"?

This is for **face-to-face payment recording** when customers pay their loan installments. The Loan Officer records the payment manually after receiving payment from the customer.

### Payment Flow

1. Customer comes to branch (or pays via GCash/bank/Maya)
2. Customer provides payment proof (receipt, transaction ID)
3. Loan Officer opens "Record Payment" page
4. Fills in the form and clicks "Record Payment"

### Form Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| **Loan ID** | The ID of the disbursed loan | `507f1f77bcf86cd799439011` |
| **Installment #** | Which payment number (1st, 2nd, etc.) | `1` |
| **Amount** | Amount the customer paid | `5000` |
| **Payment Method** | Cash, GCash, Maya, Bank Transfer, Check | `cash` |
| **Reference #** | Your proof of payment | See below |
| **Notes** | Optional additional info | `Customer paid early` |

### Reference Number Examples

The **Reference #** is **your proof of payment** that you create or receive:

| Payment Method | Reference Example | Where to Get It |
|---------------|-------------------|-----------------|
| **Cash** | `CASH-2026-001`, `REC-0123` | You create a receipt number |
| **Bank Transfer** | `BTR-ABC123456` | Customer shows bank app transaction ID |
| **GCash** | `GC-9876543210` | Customer shows GCash transaction reference |
| **Maya** | `MAYA-1234567890` | Customer shows Maya transaction reference |
| **Check** | `CHK-00012345` | Check number |

### Testing Payment Recording

**Prerequisites:**
1. You need a **disbursed loan** (status = "disbursed")
2. Get the Loan ID from Officer → Applications → click on a disbursed app → copy the Application ID

**Test Steps:**
| Step | Action |
|------|--------|
| 1 | Go to Officer → Record Payment |
| 2 | Enter a valid Loan ID (from a disbursed application) |
| 3 | Set Installment # to `1` |
| 4 | Enter Amount (e.g., `5000`) |
| 5 | Select Payment Method (e.g., Cash) |
| 6 | Enter Reference # (e.g., `CASH-TEST-001`) |
| 7 | Click "Record Payment" |
| 8 | ✅ Should see success message and remaining balance |

---

## Recent Updates (2026-02-03)

### Payment Recording UX Improvements

| Feature | Before | After |
|---------|--------|-------|
| **Find Loan** | Manual Loan ID input | Search by customer name/phone |
| **Reference #** | Required, manual entry | Auto-generated (`PAY-YYYYMMDD-NNNNNN`) |
| **Installment** | Manual entry | Auto-filled from loan data |
| **Amount** | Manual entry | Pre-filled with next due amount |

### Disbursement Improvements

| Feature | Before | After |
|---------|--------|-------|
| **Reference #** | Required, manual entry | Auto-generated (`DSB-YYYYMMDD-NNNNNN`) |
| **External Ref** | Not supported | Store bank/check number separately |

### New Backend Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/loans/officer/active-loans/` | Search active loans by customer name/phone |

### New Files

- `backend/loans/utils/reference_generator.py` - Auto-generates unique references
- `ActiveLoansView` in `officer_views.py` - Search disbursed loans

### Bug Fixes
1. **AI Recommendation Rendering** - Fixed React crash when rendering ai_recommendation object
2. **Application ID Visibility** - Admin workload now shows pending applications for selection
3. **TypeScript Types** - Added `AIRecommendation`, `ApplicationStatus`, `RiskCategory` types

### New Components
- `src/components/ErrorBoundary.tsx` - Graceful error handling for React rendering errors

