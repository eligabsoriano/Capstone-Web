import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import type { Document } from "../api/documentsApi";

interface RequestReuploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
}

export function RequestReuploadModal({
  open,
  onOpenChange,
  document,
  onConfirm,
  isLoading,
}: RequestReuploadModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for re-upload request");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            Request Re-upload
          </DialogTitle>
          <DialogDescription>
            Ask the customer to upload a new version of this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info */}
          <div className="grid gap-3 p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Filename</span>
              <p className="font-medium text-sm break-all">
                {document.filename}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">
                {formatDocumentType(document.document_type)}
              </Badge>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reupload-reason">
              Reason for Re-upload <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reupload-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Image is blurry, document is expired, wrong document type..."
              rows={3}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Common reasons */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Quick select:
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Image is blurry",
                "Document is expired",
                "Wrong document type",
                "Document not fully visible",
                "Poor lighting",
              ].map((r) => (
                <Button
                  key={r}
                  variant="outline"
                  size="sm"
                  onClick={() => setReason(r)}
                  className="text-xs h-7"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Request Re-upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
