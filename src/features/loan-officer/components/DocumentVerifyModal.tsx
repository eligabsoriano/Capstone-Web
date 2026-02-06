import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
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
  onConfirm: (
    status: "approved" | "rejected",
    notes: string,
    rejectionReason?: string,
  ) => Promise<void>;
  isLoading: boolean;
}

export function DocumentVerifyModal({
  open,
  onOpenChange,
  document,
  onConfirm,
  isLoading,
}: DocumentVerifyModalProps) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleApproveClick = () => {
    setShowApprovalForm(true);
  };

  const handleRejectClick = () => {
    setShowRejectionForm(true);
  };

  const handleBackToReview = () => {
    setShowApprovalForm(false);
    setShowRejectionForm(false);
    setRejectionReason("");
    setNotes("");
    setError("");
  };

  const handleConfirmApprove = () => {
    setAction("approved");
    setError("");
    onConfirm("approved", notes);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    setAction("rejected");
    setError("");
    onConfirm("rejected", notes, rejectionReason);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowApprovalForm(false);
      setShowRejectionForm(false);
      setRejectionReason("");
      setNotes("");
      setError("");
      setAction(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showApprovalForm ? (
              <>
                <CheckCircle className="h-5 w-5 text-primary" />
                Approve Document
              </>
            ) : showRejectionForm ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Reject Document
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-primary" />
                Verify Document
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {showApprovalForm
              ? "Add any notes about this document approval"
              : showRejectionForm
                ? "Provide a reason for rejecting this document"
                : "Review and approve or reject this document"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info - Always visible */}
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
            {document.ai_analysis && (
              <div className="flex justify-between items-center">
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
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Quality Issues
                  </span>
                  <ul className="mt-1 text-sm text-amber-600 space-y-1">
                    {document.ai_analysis.quality_issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Approval Form - Only shown after clicking Approve */}
          {showApprovalForm && (
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Notes (optional)</Label>
              <Textarea
                id="approval-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this document..."
                rows={3}
                autoFocus
              />
            </div>
          )}

          {/* Rejection Form - Only shown after clicking Reject */}
          {showRejectionForm && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g., Image is blurry, document is expired, wrong document type..."
                  rows={3}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-notes">
                  Additional Notes (optional)
                </Label>
                <Textarea
                  id="rejection-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          {showApprovalForm ? (
            <>
              {/* Approval Form Buttons */}
              <Button
                variant="outline"
                onClick={handleBackToReview}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleConfirmApprove}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && action === "approved" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Approval
              </Button>
            </>
          ) : showRejectionForm ? (
            <>
              {/* Rejection Form Buttons */}
              <Button
                variant="outline"
                onClick={handleBackToReview}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && action === "rejected" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              {/* Initial Review Buttons */}
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="destructive"
                  onClick={handleRejectClick}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApproveClick}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
