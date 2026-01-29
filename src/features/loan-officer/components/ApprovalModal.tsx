import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, notes: string) => Promise<void>;
  recommendedAmount: number;
  requestedAmount: number;
  isPending: boolean;
}

export function ApprovalModal({
  open,
  onClose,
  onConfirm,
  recommendedAmount,
  requestedAmount,
  isPending,
}: ApprovalModalProps) {
  const [amount, setAmount] = useState(recommendedAmount.toString());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (amountNum > requestedAmount) {
      setError("Amount cannot exceed requested amount");
      return;
    }
    setError("");
    await onConfirm(amountNum, notes);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-green-600">
            Approve Application
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Requested:</span>
              <span>{formatCurrency(requestedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommended:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(recommendedAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approved-amount">Approved Amount (PHP)</Label>
            <Input
              id="approved-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter approved amount"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval-notes">Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              placeholder="Add any notes about this approval..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
