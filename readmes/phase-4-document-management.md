# Phase 4: Document Management

**Status:** [ ] Not Started  
**Duration:** 2 days

---

## Endpoints for Manual Testing

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| List Documents | GET | `/api/documents/` | [ ] |
| Get Document | GET | `/api/documents/{id}/` | [ ] |
| Verify Document | POST | `/api/documents/{id}/verify/` | [ ] |
| Request Re-upload | POST | `/api/documents/{id}/request-reupload/` | [ ] |
| Get Document Types | GET | `/api/documents/types/` | [ ] |

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
POST /api/documents/{id}/verify/
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

## Frontend Tasks

- [ ] Create document list component
- [ ] Create document viewer (image/PDF)
- [ ] Create verify document modal
- [ ] Create request re-upload modal
- [ ] Add document type badges
- [ ] Add AI analysis display
- [ ] Add verification status indicators
