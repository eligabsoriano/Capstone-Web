import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  RotateCcw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PendingApplication } from "@/types/api";
import { useAssignApplication, useOfficerWorkload } from "../hooks";

interface AdminWorkloadPageProps {
  title?: string;
  description?: string;
}

export function AdminWorkloadPage({
  title = "Officer Workload",
  description = "Monitor officer capacity and assign applications",
}: AdminWorkloadPageProps) {
  // Search states
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");

  // Debounced search states for backend queries
  const [debouncedUnassignedSearch, setDebouncedUnassignedSearch] =
    useState("");
  const [debouncedAssignedSearch, setDebouncedAssignedSearch] = useState("");
  const [debouncedOfficerSearch, setDebouncedOfficerSearch] = useState("");

  // Pagination states
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [assignedPage, setAssignedPage] = useState(1);
  const [officerPage, setOfficerPage] = useState(1);
  const pageSize = 20;

  // Debounce unassigned search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnassignedSearch(unassignedSearch);
      setUnassignedPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [unassignedSearch]);

  // Debounce assigned search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAssignedSearch(assignedSearch);
      setAssignedPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [assignedSearch]);

  // Debounce officer search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOfficerSearch(officerSearch);
      setOfficerPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [officerSearch]);

  const {
    data: workloadData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOfficerWorkload({
    search: debouncedOfficerSearch || undefined,
    page: officerPage,
    page_size: pageSize,
    pending_search: debouncedUnassignedSearch || undefined,
    pending_page: unassignedPage,
    pending_page_size: pageSize,
    assigned_search: debouncedAssignedSearch || undefined,
    assigned_page: assignedPage,
    assigned_page_size: pageSize,
  });
  const assignMutation = useAssignApplication();

  // State management
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(
    null,
  );
  const [selectedApplication, setSelectedApplication] =
    useState<PendingApplication | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskBadgeVariant = (risk: string | null) => {
    switch (risk) {
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

  const handleAssign = () => {
    if (!selectedOfficerId || !selectedApplication) {
      toast.error("Please select an application");
      return;
    }

    assignMutation.mutate(
      {
        applicationId: selectedApplication.id,
        data: { officer_id: selectedOfficerId },
      },
      {
        onSuccess: (response) => {
          toast.success(
            response.message || "Application assigned successfully",
          );
          setIsAssignModalOpen(false);
          setSelectedApplication(null);
          setSelectedOfficerId(null);
          refetch();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to assign application");
        },
      },
    );
  };

  const handleReassign = () => {
    if (!selectedOfficerId || !selectedApplication) {
      toast.error("Please select a new officer");
      return;
    }

    assignMutation.mutate(
      {
        applicationId: selectedApplication.id,
        data: { officer_id: selectedOfficerId },
      },
      {
        onSuccess: (response) => {
          toast.success(
            response.message || "Application reassigned successfully",
          );
          setIsReassignModalOpen(false);
          setSelectedApplication(null);
          setSelectedOfficerId(null);
          refetch();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to reassign application");
        },
      },
    );
  };

  const openAssignModal = (officerId: string) => {
    setSelectedOfficerId(officerId);
    setIsAssignModalOpen(true);
  };

  const openReassignModal = (application: PendingApplication) => {
    setSelectedApplication(application);
    setSelectedOfficerId(null);
    setIsReassignModalOpen(true);
  };

  // Only show full-page loader on very first load (no cached data)
  if (isLoading && !workloadData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load workload data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const officers = workloadData?.officers || [];
  const officerTotal = workloadData?.total || 0;
  const officerTotalPages = workloadData?.total_pages || 1;

  // Unassigned applications - now backend paginated
  const unassignedApps = workloadData?.pending_applications || [];
  const unassignedCount = workloadData?.pending_count || 0;
  const unassignedTotalPages = (workloadData as any)?.pending_total_pages || 1;

  // Assigned applications - now backend paginated
  const assignedApps = (workloadData as any)?.assigned_applications || [];
  const assignedCount = (workloadData as any)?.assigned_count || 0;
  const assignedTotalPages = (workloadData as any)?.assigned_total_pages || 1;

  // Use backend data directly - no client-side filtering!

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={`space-y-6 transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {officerTotal} Active Officers
          </Badge>
          <Badge variant="outline" className="text-sm">
            {unassignedCount} Unassigned Apps
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Officers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officerTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending (All)</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unassignedCount + assignedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {unassignedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg per Officer
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officers.length > 0
                ? Math.round(
                    officers.reduce(
                      (sum, o) => sum + (o.pending_count || 0),
                      0,
                    ) / officers.length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-500" />
              Unassigned Applications ({unassignedCount})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={unassignedSearch}
                  onChange={(e) => {
                    setUnassignedSearch(e.target.value);
                  }}
                  className="pl-8"
                />
                {unassignedSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setUnassignedSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedApps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {unassignedCount === 0
                ? "No unassigned applications"
                : "No applications match your search"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Risk</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs">
                        {app.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {app.customer_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(app.requested_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {app.term_months}mo
                      </TableCell>
                      <TableCell className="text-center">
                        {app.eligibility_score ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getRiskBadgeVariant(app.risk_category)}>
                          {app.risk_category?.toUpperCase() || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(app.submitted_at)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px]">
                          <p className="text-xs font-medium">
                            {app.internal_notes_count ?? 0} note
                            {(app.internal_notes_count ?? 0) === 1 ? "" : "s"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.latest_internal_note?.content || "—"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {unassignedTotalPages > 1 && (
                <PaginationControls
                  currentPage={unassignedPage}
                  totalPages={unassignedTotalPages}
                  onPageChange={setUnassignedPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assigned Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Assigned Applications ({assignedCount})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={assignedSearch}
                  onChange={(e) => {
                    setAssignedSearch(e.target.value);
                  }}
                  className="pl-8"
                />
                {assignedSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setAssignedSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignedApps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {assignedCount === 0
                ? "No assigned applications"
                : "No applications match your search"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Assigned Officer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Risk</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedApps.map((app: PendingApplication) => {
                    const assignedOfficer = officers.find(
                      (o) => o.id === app.assigned_officer,
                    );
                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">
                          {app.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {app.customer_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {assignedOfficer?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(app.requested_amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getRiskBadgeVariant(app.risk_category)}
                          >
                            {app.risk_category?.toUpperCase() || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(app.submitted_at)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <p className="text-xs font-medium">
                              {app.internal_notes_count ?? 0} note
                              {(app.internal_notes_count ?? 0) === 1 ? "" : "s"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.latest_internal_note?.content || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReassignModal(app)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {assignedTotalPages > 1 && (
                <PaginationControls
                  currentPage={assignedPage}
                  totalPages={assignedTotalPages}
                  onPageChange={setAssignedPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Officers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Officer Assignments ({officerTotal})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search officers..."
                  value={officerSearch}
                  onChange={(e) => {
                    setOfficerSearch(e.target.value);
                  }}
                  className="pl-8"
                />
                {officerSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setOfficerSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {officers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {officerTotal === 0
                ? "No active officers found"
                : "No officers match your search"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        {officer.name}
                      </TableCell>
                      <TableCell>{officer.employee_id || "—"}</TableCell>
                      <TableCell>{officer.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            (officer.pending_count || 0) > 10
                              ? "destructive"
                              : (officer.pending_count || 0) > 5
                                ? "secondary"
                                : "default"
                          }
                        >
                          {officer.pending_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            officer.active !== false ? "default" : "secondary"
                          }
                        >
                          {officer.active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal(officer.id)}
                          disabled={
                            officer.active === false || unassignedCount === 0
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {officerTotalPages > 1 && (
                <PaginationControls
                  currentPage={officerPage}
                  totalPages={officerTotalPages}
                  onPageChange={setOfficerPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Application</DialogTitle>
            <DialogDescription>
              Select an unassigned application to assign to this officer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="applicationSelect">Select Application</Label>
              <Select
                value={selectedApplication?.id || ""}
                onValueChange={(value) => {
                  const app = unassignedApps.find((a) => a.id === value);
                  setSelectedApplication(app || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedApps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <span className="font-mono text-xs">
                        {app.id.slice(0, 8)}...
                      </span>
                      {" • "}
                      {formatCurrency(app.requested_amount)}
                      {" • "}
                      <Badge
                        variant={getRiskBadgeVariant(app.risk_category)}
                        className="ml-1"
                      >
                        {app.risk_category?.toUpperCase() || "N/A"}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedApplication && (
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">ID:</span>{" "}
                  <span className="font-mono">{selectedApplication.id}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Amount:</span>{" "}
                  {formatCurrency(selectedApplication.requested_amount)}
                </p>
                <p>
                  <span className="text-muted-foreground">Term:</span>{" "}
                  {selectedApplication.term_months} months
                </p>
                <p>
                  <span className="text-muted-foreground">Score:</span>{" "}
                  {selectedApplication.eligibility_score ?? "N/A"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedApplication}
            >
              {assignMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Modal */}
      <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Application</DialogTitle>
            <DialogDescription>
              Select a new officer to reassign this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApplication && (
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1 mb-4">
                <p>
                  <span className="text-muted-foreground">Application:</span>{" "}
                  <span className="font-mono">{selectedApplication.id}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Amount:</span>{" "}
                  {formatCurrency(selectedApplication.requested_amount)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Current Officer:
                  </span>{" "}
                  {officers.find(
                    (o) => o.id === selectedApplication.assigned_officer,
                  )?.name || "Unknown"}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="officerSelect">Select New Officer</Label>
              <Select
                value={selectedOfficerId || ""}
                onValueChange={setSelectedOfficerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an officer..." />
                </SelectTrigger>
                <SelectContent>
                  {officers
                    .filter(
                      (o) =>
                        o.active !== false &&
                        o.id !== selectedApplication?.assigned_officer,
                    )
                    .map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name} ({officer.employee_id}) -{" "}
                        {officer.pending_count || 0} pending
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReassignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={assignMutation.isPending || !selectedOfficerId}
            >
              {assignMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
