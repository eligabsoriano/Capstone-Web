# Phase 4: Document Management

**Status:** [x] Complete (Backend) / [x] Complete (Frontend)  
**Duration:** 2 days

---

## Overview

Phase 4 provides document management capabilities for the loan application workflow. Loan officers can view, verify, and request re-uploads of customer-submitted documents through a dedicated dashboard page.

---

## Role Access Summary

| Role | Access Level | Description |
|------|-------------|-------------|
| **Loan Officer** | ✅ Full Access | View, verify, reject, request re-upload |
| **Admin** | ✅ Full Access | Same as Loan Officer |
| **Super Admin** | ✅ Full Access | Same as Loan Officer |
| **Customer** | ❌ No Access | Customers upload via mobile app only |

---

## Implementation Status

### Backend Implementation ✅

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Documents | GET | `/api/documents/` | ✅ |
| Get Document | GET | `/api/documents/{id}/` | ✅ |
| Verify Document | PUT | `/api/documents/{id}/verify/` | ✅ |
| Request Re-upload | POST | `/api/documents/{id}/request-reupload/` | ✅ |
| Get Document Types | GET | `/api/documents/types/` | ✅ |

### Frontend Implementation ✅

| Component | File | Status |
|-----------|------|--------|
| Documents Page | `OfficerDocumentsPage.tsx` | ✅ |
| Verify Modal | `DocumentVerifyModal.tsx` | ✅ |
| Re-upload Modal | `RequestReuploadModal.tsx` | ✅ |
| API Functions | `documentsApi.ts` | ✅ |
| Sidebar Navigation | OfficerSidebar.tsx | ✅ |
| Route | `/officer/documents` | ✅ |

---

## Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `src/features/loan-officer/api/documentsApi.ts` | API layer with 5 endpoint functions |
| `src/features/loan-officer/pages/OfficerDocumentsPage.tsx` | Main documents list page |
| `src/features/loan-officer/components/DocumentVerifyModal.tsx` | Approve/reject modal |
| `src/features/loan-officer/components/RequestReuploadModal.tsx` | Re-upload request modal |

### Modified Files

| File | Changes |
|------|---------|
| `src/features/loan-officer/pages/index.ts` | Added `OfficerDocumentsPage` export |
| `src/features/loan-officer/components/index.ts` | Added modal exports |
| `src/features/loan-officer/components/OfficerSidebar.tsx` | Added Documents nav link |
| `src/app/router.tsx` | Added `/officer/documents` route |

---

## Request/Response Examples

### List Customer Documents

```bash
GET /api/documents/?customer_id={customer_id}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "results": [
    {
      "id": "doc_123",
      "customer_id": "cust_456",
      "document_type": "valid_id",
      "filename": "drivers_license.jpg",
      "file_url": "/media/documents/drivers_license.jpg",
      "mime_type": "image/jpeg",
      "status": "pending",
      "verification_status": "unverified",
      "ai_analysis": {
        "quality_score": 0.85,
        "is_valid": true,
        "quality_issues": [],
        "predicted_type": "valid_id",
        "type_confidence": 0.92
      },
      "reupload_requested": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Verify Document

```bash
PUT /api/documents/{id}/verify/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "approved",
  "notes": "Document verified successfully"
}
```

**Response:**
```json
{
  "message": "Document verified successfully",
  "document": {
    "id": "doc_123",
    "status": "approved",
    "verification_status": "verified",
    "verified_by": "officer@example.com",
    "verified_at": "2024-01-15T14:30:00Z"
  }
}
```

### Request Re-upload

```bash
POST /api/documents/{id}/request-reupload/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Image is blurry, please upload a clearer photo"
}
```

**Response:**
```json
{
  "message": "Re-upload requested successfully",
  "document": {
    "id": "doc_123",
    "reupload_requested": true,
    "reupload_reason": "Image is blurry, please upload a clearer photo"
  }
}
```

---

## Document Types

| Type | Description |
|------|-------------|
| `valid_id` | Government-issued ID |
| `selfie_with_id` | Selfie holding the ID |
| `business_permit` | DTI/SEC registration |
| `proof_of_address` | Utility bill, barangay cert |
| `business_photo` | Photos of business premises |
| `income_proof` | Bank statements, receipts |

---

## Testing Guide

### Prerequisites
1. Backend server running at `http://localhost:8000`
2. Frontend dev server running (`npm run dev`)
3. Logged in as Loan Officer

### Test 1: Access Documents Page

1. Login as loan officer
2. Navigate to `/officer/documents` via sidebar
3. **Expected:** Document list page loads with table

### Test 2: Filter Documents

1. On Documents page, select "Pending Review" from dropdown
2. **Expected:** Only pending documents shown
3. Type a customer ID in search box
4. **Expected:** Filtered results by customer

### Test 3: Verify a Document

1. Find a pending document in the table
2. Click the green checkmark (✓) icon
3. Modal opens showing document details and AI quality score
4. Add optional notes
5. Click "Approve"
6. **Expected:** Document status changes to "APPROVED"

### Test 4: Reject a Document

1. Find a pending document
2. Click the green checkmark icon
3. Add reason in notes field
4. Click "Reject" (red button)
5. **Expected:** Document status changes to "REJECTED"

### Test 5: Request Re-upload

1. Find a pending document
2. Click the orange refresh (↻) icon
3. Modal opens with reason field
4. Use quick-select buttons or type custom reason
5. Click "Request Re-upload"
6. **Expected:** Document shows "Reupload" badge

### Test 6: View Document (External)

1. Find any document with a file_url
2. Click the eye (👁) icon
3. **Expected:** Document opens in new browser tab

---

## AI Quality Analysis

The documents page displays AI analysis results:

| Quality Score | Color | Meaning |
|--------------|-------|---------|
| ≥ 80% | Green | High quality, likely valid |
| 50-79% | Yellow | Moderate quality, review needed |
| < 50% | Red | Low quality, likely needs re-upload |

### Quality Issues Displayed

- Image too small
- Image appears blurry
- Image too dark/bright
- Unusual aspect ratio

---

## Frontend Tasks (Completed)

- [x] Create document list component
- [x] Create document viewer (opens in new tab)
- [x] Create verify document modal
- [x] Create request re-upload modal
- [x] Add document type badges
- [x] Add AI analysis display (quality score)
- [x] Add verification status indicators
- [x] Add sidebar navigation link
- [x] Add route to router

