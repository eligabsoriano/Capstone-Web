import { CheckCircle, Loader2, XCircle } from "lucide-react";
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

interface DocumentVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onConfirm: (status: "approved" | "rejected", notes: string) => Promise<void>;
  isLoading: boolean;
}

export function DocumentVerifyModal({
  open,
  onOpenChange,
  document,
  onConfirm,
  isLoading,
}: DocumentVerifyModalProps) {
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleApprove = () => {
    setAction("approved");
    onConfirm("approved", notes);
  };

  const handleReject = () => {
    setAction("rejected");
    onConfirm("rejected", notes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Verify Document
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info */}
          <div className="grid gap-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Filename</span>
              <span className="font-medium text-sm">{document.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">
                {formatDocumentType(document.document_type)}
              </Badge>
            </div>
            {document.ai_analysis && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  AI Quality Score
                </span>
                <Badge
                  variant={
                    document.ai_analysis.quality_score >= 0.8
                      ? "default"
                      : document.ai_analysis.quality_score >= 0.5
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {Math.round(document.ai_analysis.quality_score * 100)}%
                </Badge>
              </div>
            )}
            {document.ai_analysis?.quality_issues &&
              document.ai_analysis.quality_issues.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Quality Issues
                  </span>
                  <ul className="mt-1 text-sm text-amber-600">
                    {document.ai_analysis.quality_issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="verification-notes">Notes (optional)</Label>
            <Textarea
              id="verification-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading && action === "rejected" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject
          </Button>
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading && action === "approved" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
