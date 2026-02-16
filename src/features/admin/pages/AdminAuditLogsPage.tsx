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
  Loader2,
  RefreshCw,
  Search as SearchIcon,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseError } from "@/lib/errors";
import type { AuditLog } from "@/types/api";
import { getAuditLogs } from "../api";
import { useAuditLogDetail, useAuditLogs, useAuditLogUsers } from "../hooks";

type ActionGroup = "login" | "create" | "update" | "delete";
type ExportFormat = "csv" | "excel";

const ACTION_GROUP_OPTIONS: Array<{ value: ActionGroup; label: string }> = [
  { value: "login", label: "Login" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildCsv(logs: AuditLog[]): string {
  const headers = [
    "ID",
    "Timestamp",
    "User ID",
    "User Type",
    "User Email",
    "Action",
    "Description",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "Details",
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp || "",
    log.user_id || "",
    log.user_type || "",
    log.user_email || "",
    log.action || "",
    log.description || "",
    log.resource_type || "",
    log.resource_id || "",
    log.ip_address || "",
    JSON.stringify(log.details || {}),
  ]);

  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      row.map((cell) => escapeCsvValue(String(cell))).join(","),
    ),
  ].join("\n");
}

function buildExcelHtml(logs: AuditLog[]): string {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const headerRow = `
    <tr>
      <th>ID</th>
      <th>Timestamp</th>
      <th>User ID</th>
      <th>User Type</th>
      <th>User Email</th>
      <th>Action</th>
      <th>Description</th>
      <th>Resource Type</th>
      <th>Resource ID</th>
      <th>IP Address</th>
      <th>Details</th>
    </tr>
  `;

  const dataRows = logs
    .map(
      (log) => `
      <tr>
        <td>${escapeHtml(log.id || "")}</td>
        <td>${escapeHtml(log.timestamp || "")}</td>
        <td>${escapeHtml(log.user_id || "")}</td>
        <td>${escapeHtml(log.user_type || "")}</td>
        <td>${escapeHtml(log.user_email || "")}</td>
        <td>${escapeHtml(log.action || "")}</td>
        <td>${escapeHtml(log.description || "")}</td>
        <td>${escapeHtml(log.resource_type || "")}</td>
        <td>${escapeHtml(log.resource_id || "")}</td>
        <td>${escapeHtml(log.ip_address || "")}</td>
        <td>${escapeHtml(JSON.stringify(log.details || {}))}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>${headerRow}</thead>
          <tbody>${dataRows}</tbody>
        </table>
      </body>
    </html>
  `;
}

export function AdminAuditLogsPage() {
  const [actionGroupFilter, setActionGroupFilter] = useState<
    ActionGroup | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState<string | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filters = useMemo(
    () => ({
      action_group: actionGroupFilter,
      user_id: userFilter,
      page: currentPage,
      page_size: 20,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: searchQuery || undefined,
    }),
    [actionGroupFilter, userFilter, currentPage, dateFrom, dateTo, searchQuery],
  );

  const { data, isLoading, error, refetch } = useAuditLogs(filters);
  const { data: usersData } = useAuditLogUsers("");
  const {
    data: selectedLogDetail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useAuditLogDetail(selectedLog?.id || "", !!selectedLog?.id);

  const logs = data?.logs ?? [];
  const totalPages = data?.total_pages ?? 1;
  const users = usersData?.users ?? [];
  const detail = selectedLogDetail || selectedLog;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleString(),
    };
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("approved") || action === "user_login")
      return "default" as const;
    if (action.includes("rejected")) return "destructive" as const;
    if (action.includes("registered") || action.includes("submitted"))
      return "secondary" as const;
    return "outline" as const;
  };

  const clearFilters = () => {
    setActionGroupFilter(undefined);
    setUserFilter(undefined);
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const fetchAllLogsForExport = async (): Promise<AuditLog[]> => {
    const pageSize = 200;
    const first = await getAuditLogs({
      ...filters,
      page: 1,
      page_size: pageSize,
    });
    if (first.status !== "success" || !first.data) {
      throw new Error(first.message || "Failed to fetch logs for export");
    }

    const allLogs = [...first.data.logs];
    for (let page = 2; page <= first.data.total_pages; page++) {
      const next = await getAuditLogs({
        ...filters,
        page,
        page_size: pageSize,
      });
      if (next.status !== "success" || !next.data) {
        throw new Error(next.message || "Failed to fetch logs for export");
      }
      allLogs.push(...next.data.logs);
    }

    return allLogs;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const logsToExport = await fetchAllLogsForExport();
      if (logsToExport.length === 0) {
        throw new Error("No logs to export");
      }

      const dateSuffix = new Date().toISOString().split("T")[0];
      if (exportFormat === "csv") {
        const csv = buildCsv(logsToExport);
        downloadBlob(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
          `audit-logs-${dateSuffix}.csv`,
        );
      } else {
        const excelHtml = buildExcelHtml(logsToExport);
        downloadBlob(
          new Blob([excelHtml], {
            type: "application/vnd.ms-excel;charset=utf-8;",
          }),
          `audit-logs-${dateSuffix}.xls`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : parseError(err));
    } finally {
      setIsExporting(false);
    }
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
              <p>{parseError(error)}</p>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and filter system activity logs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="audit-export-format"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Export Format:
            </label>
            <Select
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as ExportFormat)}
            >
              <SelectTrigger
                id="audit-export-format"
                size="sm"
                className="w-[120px]"
              >
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || isLoading || logs.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1 md:col-span-2 xl:col-span-4">
              <label
                htmlFor="audit-search"
                className="text-sm text-muted-foreground block flex items-center gap-1"
              >
                <SearchIcon className="h-3 w-3" />
                Search
              </label>
              <Input
                id="audit-search"
                placeholder="Search description, action, user..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="audit-action-group"
                className="text-sm text-muted-foreground block"
              >
                Action Type
              </label>
              <select
                id="audit-action-group"
                value={actionGroupFilter ?? ""}
                onChange={(e) => {
                  setActionGroupFilter(
                    (e.target.value || undefined) as ActionGroup | undefined,
                  );
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All Action Types</option>
                {ACTION_GROUP_OPTIONS.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="audit-user-filter"
                className="text-sm text-muted-foreground block"
              >
                User
              </label>
              <select
                id="audit-user-filter"
                value={userFilter ?? ""}
                onChange={(e) => {
                  setUserFilter(e.target.value || undefined);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option
                    key={`${user.user_id}-${user.user_type}`}
                    value={user.user_id}
                  >
                    {user.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="audit-date-from"
                className="text-sm text-muted-foreground block flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                From Date
              </label>
              <Input
                id="audit-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="audit-date-to"
                className="text-sm text-muted-foreground block flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                To Date
              </label>
              <Input
                id="audit-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">{time}</div>
                          <div className="text-xs text-muted-foreground">
                            {date}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <Badge variant="outline" className="capitalize">
                              {log.user_type.replace("_", " ")}
                            </Badge>
                            {log.user_email && (
                              <div className="text-xs text-muted-foreground">
                                {log.user_email}
                              </div>
                            )}
                          </div>
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

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Full details for the selected audit log entry.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading && (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {detailError && (
            <div className="text-sm text-destructive">
              {parseError(detailError)}
            </div>
          )}

          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Log ID</p>
                  <p className="font-mono">{detail.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timestamp</p>
                  <p>{formatTimestamp(detail.timestamp).full}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono">{detail.user_id || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User Type</p>
                  <p className="capitalize">
                    {detail.user_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">User Email</p>
                  <p>{detail.user_email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action</p>
                  <Badge variant={getActionBadgeVariant(detail.action)}>
                    {detail.action.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Resource Type</p>
                  <p>{detail.resource_type || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resource ID</p>
                  <p className="font-mono">{detail.resource_id || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono">{detail.ip_address || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Description</p>
                <p>{detail.description || "-"}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Changes / Details</p>
                <pre className="rounded border bg-muted/50 p-3 overflow-auto text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(detail.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
