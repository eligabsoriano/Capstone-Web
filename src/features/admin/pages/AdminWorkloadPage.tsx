import { ClipboardList, Loader2, UserPlus, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAssignApplication,
  useOfficerWorkload,
} from "../hooks/useWorkloadAndProducts";

export default function AdminWorkloadPage() {
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
  const [applicationId, setApplicationId] = useState("");

  const handleAssign = () => {
    if (!selectedOfficerId || !applicationId.trim()) {
      toast.error("Please enter an application ID");
      return;
    }

    assignMutation.mutate(
      {
        applicationId: applicationId.trim(),
        data: { officer_id: selectedOfficerId },
      },
      {
        onSuccess: (response) => {
          toast.success(
            response.message || "Application assigned successfully",
          );
          setIsAssignModalOpen(false);
          setApplicationId("");
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
        <Badge variant="secondary" className="text-sm">
          {officers.length} Active Officers
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officers.reduce(
                (sum, o) =>
                  sum + (o.pending_count || o.current_applications || 0),
                0,
              )}
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
                        disabled={officer.active === false}
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
              Enter the application ID to assign to this officer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                placeholder="Enter application ID"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
              />
            </div>
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
              disabled={assignMutation.isPending || !applicationId.trim()}
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
