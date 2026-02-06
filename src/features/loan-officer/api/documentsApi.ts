import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/types/api";

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Document AI analysis result
 */
export interface DocumentAIAnalysis {
  quality_score: number;
  is_valid: boolean;
  quality_issues: string[];
  predicted_type: string;
  type_confidence: number | null;
  model_available: boolean;
  analysis_mode: "cnn" | "quality_check";
}

/**
 * Document record from backend
 */
export interface Document {
  id: string;
  customer_id: string;
  document_type: string;
  filename: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  status: "pending" | "approved" | "rejected";
  verification_status: "unverified" | "verified" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  ai_analysis: DocumentAIAnalysis | null;
  reupload_requested: boolean;
  reupload_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Document type definition
 */
export interface DocumentType {
  code: string;
  name: string;
  description: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get list of documents (optionally filtered by customer)
 */
export async function getDocuments(
  customerId?: string,
): Promise<ApiResponse<{ documents: Document[]; total: number }>> {
  const response = await apiClient.get("/api/documents/", {
    params: customerId ? { customer_id: customerId } : {},
  });
  return response.data;
}

/**
 * Get a single document by ID
 */
export async function getDocument(
  documentId: string,
): Promise<ApiResponse<Document>> {
  const response = await apiClient.get(`/api/documents/${documentId}/`);
  return response.data;
}

/**
 * Get available document types
 */
export async function getDocumentTypes(): Promise<
  ApiResponse<{ types: DocumentType[] }>
> {
  const response = await apiClient.get("/api/documents/types/");
  return response.data;
}

/**
 * Verify (approve/reject) a document
 */
export async function verifyDocument(
  documentId: string,
  data: {
    status: "approved" | "rejected";
    notes?: string;
    rejection_reason?: string;
  },
): Promise<ApiResponse<{ document: Document }>> {
  const response = await apiClient.put(
    `/api/documents/${documentId}/verify/`,
    data,
  );
  return response.data;
}

/**
 * Request customer to re-upload a document
 */
export async function requestReupload(
  documentId: string,
  data: { reason: string },
): Promise<ApiResponse<{ document: Document }>> {
  const response = await apiClient.post(
    `/api/documents/${documentId}/request-reupload/`,
    data,
  );
  return response.data;
}
