import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DisbursementModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    method: string,
    reference: string,
    amount: number,
  ) => Promise<void>;
  approvedAmount: number;
  isPending: boolean;
}

const DISBURSEMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "gcash", label: "GCash" },
  { value: "maya", label: "Maya/PayMaya" },
];

export function DisbursementModal({
  open,
  onClose,
  onConfirm,
  approvedAmount,
  isPending,
}: DisbursementModalProps) {
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(approvedAmount.toString());
  const [error, setError] = useState("");
  const [autoGenerateRef, setAutoGenerateRef] = useState(true);

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    // If auto-generate is on, send empty reference - backend will generate
    const refToSend = autoGenerateRef ? "" : reference;
    await onConfirm(method, refToSend, amountNum);
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
          <h2 className="text-xl font-semibold text-primary">Disburse Loan</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Approved Amount:</span>
              <span className="font-bold text-lg">
                {formatCurrency(approvedAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disburse-amount">Disbursement Amount (PHP)</Label>
            <Input
              id="disburse-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter disbursement amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disbursement-method">Disbursement Method</Label>
            <select
              id="disbursement-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {DISBURSEMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="disbursement-reference">
                Voucher/Reference #
              </Label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoGenerateRef}
                  onChange={(e) => setAutoGenerateRef(e.target.checked)}
                  className="rounded"
                />
                Auto-generate
              </label>
            </div>
            <Input
              id="disbursement-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={
                autoGenerateRef
                  ? "System will generate (e.g., DSB-20260203-000001)"
                  : "Enter check/transaction number..."
              }
              disabled={autoGenerateRef}
              className={autoGenerateRef ? "bg-muted" : ""}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Confirm Disbursement"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
