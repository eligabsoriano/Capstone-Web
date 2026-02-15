import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestableDocument {
  id: string;
  document_type: string;
  filename: string;
  status: string;
}

interface RequestDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  documents: RequestableDocument[];
  missingDocumentTypes: string[];
  isSubmittingMissing: boolean;
  isSubmittingReupload: boolean;
  onConfirmMissing: (
    missingDocumentTypes: string[],
    reason: string,
  ) => Promise<void>;
  onConfirmReupload: (documentId: string, reason: string) => Promise<void>;
}

function formatDocumentType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RequestDocumentsModal({
  open,
  onClose,
  documents,
  missingDocumentTypes,
  isSubmittingMissing,
  isSubmittingReupload,
  onConfirmMissing,
  onConfirmReupload,
}: RequestDocumentsModalProps) {
  const [requestType, setRequestType] = useState<"missing" | "reupload">(
    "missing",
  );
  const [selectedMissingDocs, setSelectedMissingDocs] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isSubmitting = isSubmittingMissing || isSubmittingReupload;

  useEffect(() => {
    if (!open) return;

    const initialType =
      missingDocumentTypes.length > 0
        ? "missing"
        : documents.length > 0
          ? "reupload"
          : "missing";

    setRequestType(initialType);
    setSelectedMissingDocs(missingDocumentTypes);
    setSelectedDocumentId(documents[0]?.id ?? "");
    setReason("");
    setError("");
  }, [open, documents, missingDocumentTypes]);

  const toggleMissingDocument = (documentType: string) => {
    setSelectedMissingDocs((prev) =>
      prev.includes(documentType)
        ? prev.filter((d) => d !== documentType)
        : [...prev, documentType],
    );
  };

  const handleSubmit = async () => {
    const normalizedReason = reason.trim();

    if (requestType === "missing") {
      if (selectedMissingDocs.length === 0) {
        setError("Please select at least one missing document");
        return;
      }
      setError("");
      await onConfirmMissing(selectedMissingDocs, normalizedReason);
      return;
    }

    if (!selectedDocumentId) {
      setError("Please select a document");
      return;
    }
    if (!normalizedReason) {
      setError("Please specify what's needed");
      return;
    }

    setError("");
    await onConfirmReupload(selectedDocumentId, normalizedReason);
  };

  const selectedDocument = documents.find(
    (doc) => doc.id === selectedDocumentId,
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Request Documents
          </DialogTitle>
          <DialogDescription>
            Request missing documents or ask for re-upload of existing uploads.
          </DialogDescription>
        </DialogHeader>

        {documents.length === 0 && missingDocumentTypes.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No documents available for request.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="request-type">Request Type</Label>
              <select
                id="request-type"
                value={requestType}
                onChange={(e) =>
                  setRequestType(e.target.value as "missing" | "reupload")
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                disabled={isSubmitting}
              >
                <option
                  value="missing"
                  disabled={missingDocumentTypes.length === 0}
                >
                  Missing Document (Not Uploaded)
                </option>
                <option value="reupload" disabled={documents.length === 0}>
                  Re-upload Existing Document
                </option>
              </select>
            </div>

            {requestType === "missing" ? (
              <div className="space-y-2">
                <Label>Missing Documents</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {missingDocumentTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No missing required documents found for this application.
                    </p>
                  ) : (
                    missingDocumentTypes.map((documentType) => (
                      <label
                        key={documentType}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMissingDocs.includes(documentType)}
                          onChange={() => toggleMissingDocument(documentType)}
                          disabled={isSubmitting}
                        />
                        <span>{formatDocumentType(documentType)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="request-document">Document to Re-upload</Label>
                <select
                  id="request-document"
                  value={selectedDocumentId}
                  onChange={(e) => setSelectedDocumentId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  disabled={isSubmitting}
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {formatDocumentType(doc.document_type)} - {doc.filename}
                    </option>
                  ))}
                </select>
                {selectedDocument && (
                  <p className="text-xs text-muted-foreground">
                    Current status: {selectedDocument.status.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="request-reason">
                Specify what's needed{" "}
                {requestType === "reupload" ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-muted-foreground">(optional)</span>
                )}
              </Label>
              <Textarea
                id="request-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  requestType === "missing"
                    ? "e.g., Please upload a business permit and proof of address (optional note)."
                    : "e.g., Uploaded ID is blurry, please upload a clearer copy."
                }
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (requestType === "missing" &&
                missingDocumentTypes.length === 0) ||
              (requestType === "reupload" && documents.length === 0)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              "Send Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
