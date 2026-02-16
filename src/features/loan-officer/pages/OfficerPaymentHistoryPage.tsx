import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Receipt,
  RotateCcw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { parseError } from "@/lib/errors";
import {
  type PaymentSearchItem,
  type PaymentSearchParams,
  searchPayments,
} from "../api/paymentsApi";
import { usePaymentSearch } from "../hooks";

const DEFAULT_PAGE_SIZE = 20;

const defaultFilters: PaymentSearchParams = {
  page: 1,
  page_size: DEFAULT_PAGE_SIZE,
  sort_by: "recorded_at",
  sort_order: "desc",
  disbursed_only: true,
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  gcash: "GCash",
  maya: "Maya",
  check: "Check",
  other: "Other",
};

const paymentStatusLabels = {
  on_time: "On-time",
  late: "Late",
  unknown: "Unknown",
} as const;

export function OfficerPaymentHistoryPage() {
  const [filters, setFilters] = useState<PaymentSearchParams>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [paymentMethodInput, setPaymentMethodInput] = useState("all");
  const [paymentStatusInput, setPaymentStatusInput] = useState("all");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput.trim() || undefined,
        page: 1,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, error } = usePaymentSearch(filters);

  const payments = data?.payments ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.total_pages ?? 1;
  const totalAmount = data?.summary.total_amount ?? 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatusLabel = (status: PaymentSearchItem["payment_status"]) =>
    paymentStatusLabels[status] || "Unknown";

  const escapeCsvValue = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const downloadFile = (
    content: string,
    mimeType: string,
    filename: string,
  ): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchAllPaymentsForExport = async (): Promise<PaymentSearchItem[]> => {
    const pageSize = 100;
    const baseParams: PaymentSearchParams = {
      ...filters,
      page: 1,
      page_size: pageSize,
    };

    const firstResponse = await searchPayments(baseParams);
    if (firstResponse.status !== "success" || !firstResponse.data) {
      throw new Error(
        firstResponse.message || "Failed to export payment history",
      );
    }

    const allPayments = [...firstResponse.data.payments];
    const totalPagesForExport = firstResponse.data.total_pages || 1;

    for (let exportPage = 2; exportPage <= totalPagesForExport; exportPage++) {
      const response = await searchPayments({
        ...baseParams,
        page: exportPage,
      });
      if (response.status !== "success" || !response.data) {
        throw new Error(response.message || "Failed to export payment history");
      }
      allPayments.push(...response.data.payments);
    }

    return allPayments;
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodInput(value);
    setFilters((prev) => ({
      ...prev,
      payment_method:
        value === "all"
          ? undefined
          : (value as PaymentSearchParams["payment_method"]),
      page: 1,
    }));
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatusInput(value);
    setFilters((prev) => ({
      ...prev,
      payment_status:
        value === "all"
          ? undefined
          : (value as PaymentSearchParams["payment_status"]),
      page: 1,
    }));
  };

  const handleSortByChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: value as PaymentSearchParams["sort_by"],
      page: 1,
    }));
  };

  const handleSortOrderChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_order: value as PaymentSearchParams["sort_order"],
      page: 1,
    }));
  };

  const handleStartDateChange = (value: string) => {
    setStartDateInput(value);
    setFilters((prev) => ({
      ...prev,
      start_date: value || undefined,
      page: 1,
    }));
  };

  const handleEndDateChange = (value: string) => {
    setEndDateInput(value);
    setFilters((prev) => ({
      ...prev,
      end_date: value || undefined,
      page: 1,
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const records = await fetchAllPaymentsForExport();
      if (records.length === 0) {
        toast.info("No records to export");
        return;
      }

      const dateSuffix = new Date().toISOString().split("T")[0];

      if (exportFormat === "json") {
        const jsonContent = JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            filters,
            total_records: records.length,
            payments: records,
          },
          null,
          2,
        );
        downloadFile(
          jsonContent,
          "application/json;charset=utf-8",
          `payment-history-${dateSuffix}.json`,
        );
      } else {
        const headers = [
          "Date",
          "Customer",
          "Product",
          "Loan ID",
          "Installment #",
          "Due Date",
          "Status",
          "Payment Method",
          "Amount",
          "Reference",
        ];

        const rows = records.map((payment) => [
          formatDate(payment.recorded_at),
          payment.customer_name,
          payment.product_name,
          payment.loan_id,
          String(payment.installment_number),
          formatDate(payment.due_date),
          formatStatusLabel(payment.payment_status),
          paymentMethodLabels[payment.payment_method] || payment.payment_method,
          payment.amount.toFixed(2),
          payment.reference || "",
        ]);

        const csvContent = [
          headers.map(escapeCsvValue).join(","),
          ...rows.map((row) =>
            row.map((cell) => escapeCsvValue(cell)).join(","),
          ),
        ].join("\n");

        downloadFile(
          csvContent,
          "text/csv;charset=utf-8",
          `payment-history-${dateSuffix}.csv`,
        );
      }

      toast.success("Payment history exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : parseError(err));
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setStartDateInput("");
    setEndDateInput("");
    setPaymentMethodInput("all");
    setPaymentStatusInput("all");
    setFilters(defaultFilters);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            View recorded payments for disbursed loans
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{parseError(error)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">
          View recorded payments for disbursed loans
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search by customer name or reference. Results are limited to
            disbursed loans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2 md:col-span-2 xl:col-span-3">
              <Label htmlFor="payment-history-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment-history-search"
                  placeholder="Search customer name or reference..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-method">Payment Method</Label>
              <select
                id="payment-history-method"
                value={paymentMethodInput}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-status">Payment Status</Label>
              <select
                id="payment-history-status"
                value={paymentStatusInput}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="on_time">On-time</option>
                <option value="late">Late</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-sort-by">Sort By</Label>
              <select
                id="payment-history-sort-by"
                value={filters.sort_by}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="recorded_at">Date Recorded</option>
                <option value="amount">Amount</option>
                <option value="installment_number">Installment #</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-start-date">Start Date</Label>
              <Input
                id="payment-history-start-date"
                type="date"
                value={startDateInput}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-end-date">End Date</Label>
              <Input
                id="payment-history-end-date"
                type="date"
                value={endDateInput}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-history-sort-order">Sort Order</Label>
              <select
                id="payment-history-sort-order"
                value={filters.sort_order}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="payment-history-export-format">
                  Export Format
                </Label>
                <select
                  id="payment-history-export-format"
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as "csv" | "json")
                  }
                  className="h-10 min-w-32 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting || isLoading || isFetching}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>

            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payments
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading payments..."
              : `Showing ${payments.length} of ${total} payments • ${formatCurrency(totalAmount)} in this page`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No payments found</p>
              <p className="text-sm mt-1">
                Try changing the search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Loan ID
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Inst.
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          {formatDate(payment.recorded_at)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {payment.customer_name}
                        </td>
                        <td className="px-4 py-3">{payment.product_name}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link
                            to={`/officer/applications/${payment.loan_id}`}
                            className="hover:underline"
                          >
                            {payment.loan_id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {payment.installment_number}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {paymentMethodLabels[payment.payment_method] ||
                              payment.payment_method}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              payment.payment_status === "late"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {formatStatusLabel(payment.payment_status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {payment.reference || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} • {total} total records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isFetching}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
