import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => Promise<void>;
  isPending: boolean;
}

const REJECTION_REASONS = [
  "Incomplete documentation",
  "Insufficient income",
  "Poor credit history",
  "High risk profile",
  "Business viability concerns",
  "Failed identity verification",
  "Other",
];

export function RejectionModal({
  open,
  onClose,
  onConfirm,
  isPending,
}: RejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (!reason.trim()) {
      setError("Please select or enter a rejection reason");
      return;
    }
    setError("");
    await onConfirm(reason, notes);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-destructive">
            Reject Application
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="rejection-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-destructive"
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Specify Reason</Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCustomReason(e.target.value)
                }
                placeholder="Enter rejection reason..."
                rows={2}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="rejection-notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              placeholder="Add any additional notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Rejecting..." : "Reject Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
