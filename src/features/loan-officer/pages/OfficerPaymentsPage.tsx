import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RecordPaymentRequest } from "@/types/api";
import { useRecordPayment } from "../hooks/usePayments";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "gcash", label: "GCash" },
  { value: "maya", label: "Maya" },
  { value: "check", label: "Check" },
];

const initialFormData: RecordPaymentRequest = {
  loan_id: "",
  installment_number: 1,
  amount: 0,
  payment_method: "cash",
  reference: "",
  notes: "",
};

export function OfficerPaymentsPage() {
  const recordMutation = useRecordPayment();
  const [formData, setFormData] =
    useState<RecordPaymentRequest>(initialFormData);
  const [lastPayment, setLastPayment] = useState<{
    loan_id: string;
    amount: number;
    remaining: number;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.loan_id.trim()) {
      toast.error("Loan ID is required");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (!formData.reference.trim()) {
      toast.error("Reference number is required");
      return;
    }

    recordMutation.mutate(formData, {
      onSuccess: (response) => {
        toast.success(response.message || "Payment recorded successfully");
        setLastPayment({
          loan_id: response.data?.loan_id || formData.loan_id,
          amount: response.data?.amount || formData.amount,
          remaining: response.data?.remaining_balance || 0,
        });
        // Reset form but keep loan_id for multiple installments
        setFormData({
          ...initialFormData,
          loan_id: formData.loan_id,
          installment_number: formData.installment_number + 1,
        });
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to record payment");
      },
    });
  };

  const handleInputChange = (
    field: keyof RecordPaymentRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Record Payment</h1>
        <p className="text-muted-foreground">Record customer loan payments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter the payment information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan_id">Loan ID *</Label>
                <Input
                  id="loan_id"
                  placeholder="Enter loan ID"
                  value={formData.loan_id}
                  onChange={(e) => handleInputChange("loan_id", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installment_number">Installment #</Label>
                  <Input
                    id="installment_number"
                    type="number"
                    min={1}
                    value={formData.installment_number}
                    onChange={(e) =>
                      handleInputChange(
                        "installment_number",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₱) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.amount || ""}
                    onChange={(e) =>
                      handleInputChange("amount", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    handleInputChange("payment_method", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference # *</Label>
                <Input
                  id="reference"
                  placeholder="Transaction/receipt number"
                  value={formData.reference}
                  onChange={(e) =>
                    handleInputChange("reference", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes"
                  value={formData.notes || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("notes", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={recordMutation.isPending}
              >
                {recordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Card */}
        <div className="space-y-4">
          {lastPayment && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Payment Recorded
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan ID:</span>
                  <span className="font-medium">{lastPayment.loan_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(lastPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Remaining Balance:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(lastPayment.remaining)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Enter the exact loan ID from the application</p>
              <p>• Installment numbers start from 1</p>
              <p>• Always record the reference/receipt number</p>
              <p>• After recording, the next installment auto-increments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
