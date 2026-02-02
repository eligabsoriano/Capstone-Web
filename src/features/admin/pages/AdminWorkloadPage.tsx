import {
  ClipboardList,
  FileText,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
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
import {
  useAssignApplication,
  useOfficerWorkload,
} from "../hooks/useWorkloadAndProducts";

export function AdminWorkloadPage() {
  const {
    data: workloadData,
    isLoading,
    error,
    refetch,
  } = useOfficerWorkload();
  const assignMutation = useAssignApplication();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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

  const openAssignModal = (officerId: string) => {
    setSelectedOfficerId(officerId);
    setIsAssignModalOpen(true);
  };

  if (isLoading) {
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
  const pendingApplications =
    (workloadData as { pending_applications?: PendingApplication[] })
      ?.pending_applications || [];
  const unassignedApps = pendingApplications.filter(
    (app) => !app.assigned_officer && app.status === "submitted",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Officer Workload</h1>
          <p className="text-muted-foreground">
            Monitor officer capacity and assign applications
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {officers.length} Active Officers
          </Badge>
          <Badge variant="outline" className="text-sm">
            {unassignedApps.length} Unassigned Apps
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
            <div className="text-2xl font-bold">{officers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending (All)</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApplications.length}
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
              {unassignedApps.length}
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
                      (sum, o) =>
                        sum + (o.pending_count || o.current_applications || 0),
                      0,
                    ) / officers.length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Table */}
      {unassignedApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-500" />
              Unassigned Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Officers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Officer Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {officers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active officers found
            </div>
          ) : (
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
                          (officer.pending_count ||
                            officer.current_applications ||
                            0) > 10
                            ? "destructive"
                            : (officer.pending_count ||
                                  officer.current_applications ||
                                  0) > 5
                              ? "secondary"
                              : "default"
                        }
                      >
                        {officer.pending_count ??
                          officer.current_applications ??
                          0}
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
                          officer.active === false ||
                          unassignedApps.length === 0
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

            {/* Selected Application Details */}
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
    </div>
  );
}
