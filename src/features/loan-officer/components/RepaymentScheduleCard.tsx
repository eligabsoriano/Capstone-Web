import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
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
import type { Installment, RepaymentSchedule } from "@/types/api";
import { getRepaymentSchedule } from "../api/paymentsApi";

interface RepaymentScheduleCardProps {
  loanId: string;
  onRefresh?: number; // Increment to trigger refresh
}

export function RepaymentScheduleCard({
  loanId,
  onRefresh = 0,
}: RepaymentScheduleCardProps) {
  const [schedule, setSchedule] = useState<RepaymentSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(onRefresh);

  // Sync external refresh trigger to internal state
  useEffect(() => {
    setRefreshCount(onRefresh);
  }, [onRefresh]);

  const fetchSchedule = useCallback(async () => {
    if (!loanId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRepaymentSchedule(loanId);
      if (response.status === "success" && response.data) {
        setSchedule(response.data);
      } else {
        setError(response.message || "Failed to load schedule");
      }
    } catch {
      setError("Failed to load repayment schedule");
    } finally {
      setIsLoading(false);
    }
  }, [loanId]);

  // Fetch on mount and when loanId or refreshCount changes
  useEffect(() => {
    // Reference refreshCount to trigger refetch when it changes
    void refreshCount;
    fetchSchedule();
  }, [fetchSchedule, refreshCount]);

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

  const getStatusBadge = (status: Installment["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getRowClassName = (status: Installment["status"]) => {
    if (status === "overdue") {
      return "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30";
    }
    if (status === "paid") {
      return "bg-green-50/50 dark:bg-green-950/10";
    }
    return "";
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

  if (!schedule) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Repayment Schedule
        </CardTitle>
        <CardDescription>
          {schedule.paid_count} of {schedule.term_months} installments paid •{" "}
          {formatCurrency(schedule.remaining_balance)} remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Principal</p>
            <p className="font-semibold">
              {formatCurrency(schedule.principal)}
            </p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Total Interest</p>
            <p className="font-semibold">
              {formatCurrency(schedule.total_interest)}
            </p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Monthly</p>
            <p className="font-semibold">
              {formatCurrency(schedule.monthly_payment)}
            </p>
          </div>
        </div>

        {/* Installments Table */}
        <div className="max-h-64 overflow-y-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.installments.map((inst) => (
                <TableRow
                  key={inst.number}
                  className={getRowClassName(inst.status)}
                >
                  <TableCell className="font-semibold">{inst.number}</TableCell>
                  <TableCell>{formatDate(inst.due_date)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(inst.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {inst.paid_amount > 0
                      ? formatCurrency(inst.paid_amount)
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(inst.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
