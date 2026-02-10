import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Globe,
  RefreshCw,
  Search as SearchIcon,
  User,
} from "lucide-react";
import { useState } from "react";
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
import { useAuditLogs } from "../hooks";

function exportToCSV(
  logs: Array<{
    id: string;
    user_id: string;
    user_type: string;
    action: string;
    description: string;
    resource_type: string;
    resource_id: string | null;
    ip_address: string;
    timestamp: string;
  }>,
) {
  const headers = [
    "ID",
    "User Type",
    "Action",
    "Description",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "Timestamp",
  ];
  const csvContent = [
    headers.join(","),
    ...logs.map((log) =>
      [
        log.id,
        log.user_type,
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.resource_type,
        log.resource_id || "",
        log.ip_address,
        log.timestamp,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Handler for search changes - resets page
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handler for filter changes - resets page
  const handleFilterChange = (value: string | undefined) => {
    setActionFilter(value);
    setCurrentPage(1);
  };

  const { data, isLoading, error, refetch } = useAuditLogs({
    action: actionFilter,
    page: currentPage,
    page_size: 20,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    search: searchQuery || undefined,
  });

  const logs = data?.logs ?? [];
  const totalPages = data?.total_pages ?? 1;

  const actionTypes = [
    { value: undefined, label: "All Actions" },
    { value: "user_login", label: "Login" },
    { value: "user_logout", label: "Logout" },
    { value: "user_registered", label: "User Registered" },
    { value: "profile_updated", label: "Profile Updated" },
    { value: "document_uploaded", label: "Document Uploaded" },
    { value: "document_verified", label: "Document Verified" },
    { value: "document_rejected", label: "Document Rejected" },
    { value: "loan_submitted", label: "Loan Submitted" },
    { value: "loan_approved", label: "Loan Approved" },
    { value: "loan_rejected", label: "Loan Rejected" },
    { value: "loan_disbursed", label: "Loan Disbursed" },
    { value: "payment_recorded", label: "Payment Recorded" },
    { value: "admin_action", label: "Admin Action" },
  ];

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("approved") || action === "user_login")
      return "default";
    if (action.includes("rejected")) return "destructive";
    if (action.includes("created") || action === "user_registered")
      return "secondary";
    return "outline";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View system activity logs</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load audit logs. Please try again.</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and filter system activity logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(logs)}
            disabled={logs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="search"
                className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
              >
                <SearchIcon className="h-3 w-3" />
                Search
              </label>
              <Input
                id="search"
                placeholder="Search description, action, user..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label
                htmlFor="action-filter"
                className="text-sm text-muted-foreground mb-1 block"
              >
                Action Type
              </label>
              <select
                id="action-filter"
                value={actionFilter ?? ""}
                onChange={(e) =>
                  handleFilterChange(e.target.value || undefined)
                }
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {actionTypes.map((type) => (
                  <option key={type.label} value={type.value ?? ""}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="date-from"
                className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                From Date
              </label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-[150px]"
              />
            </div>
            <div>
              <label
                htmlFor="date-to"
                className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                To Date
              </label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-[150px]"
              />
            </div>
            {(dateFrom || dateTo) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Dates
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {logs.length} {data?.total ? `of ${data.total}` : ""}{" "}
            entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 py-3 border-b">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded flex-1" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      <User className="h-4 w-4 inline mr-1" />
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                      <Globe className="h-4 w-4 inline mr-1" />
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const { date, time } = formatTimestamp(log.timestamp);
                    return (
                      <tr
                        key={log.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">{time}</div>
                          <div className="text-xs text-muted-foreground">
                            {date}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {log.user_type.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-sm text-muted-foreground">
                          {log.description}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell font-mono text-xs text-muted-foreground">
                          {log.ip_address}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
