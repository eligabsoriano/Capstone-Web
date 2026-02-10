import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
import type { ApplicationSearchParams } from "../api/applicationsApi";
import { useOfficerApplications } from "../hooks";

type SortField = "customer_name" | "submitted_at" | "requested_amount";
type SortOrder = "asc" | "desc";

export function OfficerApplicationsPage() {
  const [searchParams, setSearchParams] = useState<ApplicationSearchParams>({
    status: "pending",
    page: 1,
    page_size: 20,
  });
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1, // Reset to page 1 when search changes
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useOfficerApplications(searchParams);

  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.total_pages ?? 1;

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "mine", label: "My Applications" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "disbursed", label: "Disbursed" },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "under_review":
        return "secondary";
      case "disbursed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleStatusChange = (status: string) => {
    setSearchParams((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleSort = (field: SortField) => {
    const newOrder: SortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setSearchParams((prev) => ({
      ...prev,
      sort_by: field as ApplicationSearchParams["sort_by"],
      sort_order: newOrder,
      page: 1,
    }));
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Queue
          </h1>
          <p className="text-muted-foreground">
            Review and manage assigned loan applications
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load applications. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Queue</h1>
        <p className="text-muted-foreground">
          Review and manage assigned loan applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <select
            value={searchParams.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, ID, or product..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `Showing ${applications.length} of ${total} applications`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No applications found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try changing the filter or search criteria
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Application ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                        <button
                          type="button"
                          className="flex items-center hover:text-foreground transition-colors cursor-pointer"
                          onClick={() => handleSort("customer_name")}
                        >
                          Customer
                          {renderSortIcon("customer_name")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                        Product
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                        Risk
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                        <button
                          type="button"
                          className="flex items-center hover:text-foreground transition-colors cursor-pointer"
                          onClick={() => handleSort("submitted_at")}
                        >
                          Submitted
                          {renderSortIcon("submitted_at")}
                        </button>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">
                            {app.id.slice(-8)}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                          {(app as { customer_name?: string }).customer_name ||
                            app.customer_id.slice(-6)}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                          {app.product_name}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(app.requested_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(app.status)}>
                            {app.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <Badge
                            variant={getRiskBadgeVariant(app.risk_category)}
                          >
                            {app.risk_category || "N/A"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                          {formatDate(app.submitted_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/officer/applications/${app.id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
