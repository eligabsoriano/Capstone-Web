import { CheckCircle2, CreditCard, Loader2, Search, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { parseError } from "@/lib/errors";
import type { RecordPaymentRequest } from "@/types/api";
import { type ActiveLoan, searchActiveLoans } from "../api/applicationsApi";
import { PaymentHistoryCard, RepaymentScheduleCard } from "../components";
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
    reference: string;
  } | null>(null);

  // Loan search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ActiveLoan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<ActiveLoan | null>(null);
  const [autoGenerateRef, setAutoGenerateRef] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Search for loans
  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchActiveLoans(searchQuery);
      if (response.status === "success" && response.data) {
        setSearchResults(response.data.loans);
        if (response.data.loans.length === 0) {
          toast.info("No active loans found for this search");
        }
      }
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setIsSearching(false);
    }
  };

  // Select a loan from search results
  const handleSelectLoan = (loan: ActiveLoan) => {
    setSelectedLoan(loan);
    setFormData((prev) => ({
      ...prev,
      loan_id: loan.loan_id,
      installment_number: loan.next_due_installment || 1,
      amount: loan.next_due_amount || loan.monthly_payment,
    }));
    setSearchResults([]); // Clear results after selection
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.loan_id.trim()) {
      toast.error("Please select a loan");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    // Reference is optional now - backend will auto-generate if empty

    const submitData = {
      ...formData,
      // If auto-generate is on, send empty reference to let backend generate it
      reference: autoGenerateRef ? "" : formData.reference,
    };

    recordMutation.mutate(submitData, {
      onSuccess: (response) => {
        toast.success(response.message || "Payment recorded successfully");
        setLastPayment({
          loan_id: response.data?.loan_id || formData.loan_id,
          amount: response.data?.amount || formData.amount,
          remaining: response.data?.remaining_balance || 0,
          reference: response.data?.reference || formData.reference,
        });
        // Reset form but keep loan_id for multiple installments
        setFormData({
          ...initialFormData,
          loan_id: formData.loan_id,
          installment_number: formData.installment_number + 1,
        });
      },
      onError: (err: unknown) => {
        toast.error(parseError(err));
      },
    });
  };

  const handleInputChange = (
    field: keyof RecordPaymentRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearSelectedLoan = () => {
    setSelectedLoan(null);
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Record Payment</h1>
        <p className="text-muted-foreground">
          Search for a customer or loan to record their payment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Search and Form */}
        <div className="space-y-4">
          {/* Loan Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Loan
              </CardTitle>
              <CardDescription>
                Search by customer name, phone, customer ID, or loan ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter name, phone, customer ID, or loan ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="secondary"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((loan) => (
                    <button
                      key={loan.loan_id}
                      type="button"
                      onClick={() => handleSelectLoan(loan)}
                      className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {loan.customer_name}
                          </span>
                        </div>
                        <Badge variant="outline">{loan.product_name}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span>
                          Due: {formatCurrency(loan.next_due_amount || 0)}
                        </span>
                        {" • "}
                        <span>
                          Installment #{loan.next_due_installment || "?"}/
                          {loan.total_installments}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Loan Display */}
              {selectedLoan && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {selectedLoan.customer_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedLoan}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Product:</span>{" "}
                      {selectedLoan.product_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Balance:</span>{" "}
                      {formatCurrency(selectedLoan.remaining_balance)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Due:</span>{" "}
                      {formatDate(selectedLoan.next_due_date)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Installment:
                      </span>{" "}
                      #{selectedLoan.next_due_installment}/
                      {selectedLoan.total_installments}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reference">Reference #</Label>
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
                    id="reference"
                    placeholder={
                      autoGenerateRef
                        ? "System will generate (e.g., PAY-20260203-000001)"
                        : "Transaction/receipt number"
                    }
                    value={formData.reference}
                    onChange={(e) =>
                      handleInputChange("reference", e.target.value)
                    }
                    disabled={autoGenerateRef}
                    className={autoGenerateRef ? "bg-muted" : ""}
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
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={recordMutation.isPending || !selectedLoan}
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
        </div>

        {/* Right Column - Schedule, History, Success and Tips */}
        <div className="space-y-4">
          {/* Repayment Schedule - shows when loan selected */}
          {selectedLoan && (
            <RepaymentScheduleCard
              loanId={selectedLoan.loan_id}
              onRefresh={lastPayment ? 1 : 0}
            />
          )}

          {/* Payment History - shows when loan selected */}
          {selectedLoan && (
            <PaymentHistoryCard
              loanId={selectedLoan.loan_id}
              onRefresh={lastPayment ? 1 : 0}
            />
          )}

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
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono font-medium">
                    {lastPayment.reference}
                  </span>
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
              <p>
                • Search by name, phone, customer ID, or loan/application ID
              </p>
              <p>• Product ID is not supported in this search</p>
              <p>• System auto-fills next due installment</p>
              <p>• Reference # auto-generates if left empty</p>
              <p>• After recording, next installment auto-increments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
