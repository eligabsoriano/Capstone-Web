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
  isPending: boolean;
  onConfirm: (documentId: string, reason: string) => Promise<void>;
}

function formatDocumentType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RequestDocumentsModal({
  open,
  onClose,
  documents,
  isPending,
  onConfirm,
}: RequestDocumentsModalProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedDocumentId(documents[0]?.id ?? "");
    setReason("");
    setError("");
  }, [open, documents]);

  const handleSubmit = async () => {
    if (!selectedDocumentId) {
      setError("Please select a document");
      return;
    }
    if (!reason.trim()) {
      setError("Please specify what needs to be re-uploaded");
      return;
    }

    setError("");
    await onConfirm(selectedDocumentId, reason.trim());
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
            Ask the customer to re-upload a document and specify what is needed.
          </DialogDescription>
        </DialogHeader>

        {documents.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No uploaded documents are available for re-upload request.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="request-document">Document</Label>
              <select
                id="request-document"
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                disabled={isPending}
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

            <div className="space-y-2">
              <Label htmlFor="request-reason">
                What needs to be re-uploaded?{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="request-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., ID image is blurry and expiration date is unreadable."
                rows={4}
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || documents.length === 0}
          >
            {isPending ? (
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
