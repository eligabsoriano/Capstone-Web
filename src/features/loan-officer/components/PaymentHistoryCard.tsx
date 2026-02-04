import { CreditCard, Loader2, Receipt } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaymentHistoryResponse } from "@/types/api";
import { getPaymentHistory } from "../api/paymentsApi";

interface PaymentHistoryCardProps {
  loanId: string;
  onRefresh?: number; // Increment to trigger refresh
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  gcash: "GCash",
  maya: "Maya",
  check: "Check",
  other: "Other",
};

export function PaymentHistoryCard({
  loanId,
  onRefresh = 0,
}: PaymentHistoryCardProps) {
  const [history, setHistory] = useState<PaymentHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(onRefresh);

  // Sync external refresh trigger to internal state
  useEffect(() => {
    setRefreshCount(onRefresh);
  }, [onRefresh]);

  const fetchHistory = useCallback(async () => {
    if (!loanId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPaymentHistory(loanId);
      if (response.status === "success" && response.data) {
        setHistory(response.data);
      } else {
        setError(response.message || "Failed to load payment history");
      }
    } catch {
      setError("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  }, [loanId]);

  // Fetch on mount and when loanId or refreshCount changes
  useEffect(() => {
    // Reference refreshCount to trigger refetch when it changes
    void refreshCount;
    fetchHistory();
  }, [fetchHistory, refreshCount]);

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

  const getMethodBadge = (method: string) => {
    const label = paymentMethodLabels[method] || method;
    return (
      <Badge variant="outline" className="font-normal">
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-center text-red-600">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!history) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          {history.count} payment{history.count !== 1 ? "s" : ""} •{" "}
          {formatCurrency(history.total_paid)} total paid
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.payments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No payments recorded yet</p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.installment_number}
                    </TableCell>
                    <TableCell>{formatDate(payment.recorded_at)}</TableCell>
                    <TableCell>
                      {getMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.reference || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
