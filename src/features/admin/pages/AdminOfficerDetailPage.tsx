import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  Edit,
  Mail,
  Phone,
  Save,
  Shield,
  UserX,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeactivateOfficer,
  useOfficerDetail,
  useUpdateOfficer,
} from "../hooks";

// Department options - can be configured as needed
const DEPARTMENT_OPTIONS = [
  "Loans Department",
  "Credit Analysis",
  "Collections",
  "Customer Service",
  "Risk Management",
  "Operations",
] as const;

export function AdminOfficerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const { data: officer, isLoading, error } = useOfficerDetail(id || "");
  const updateMutation = useUpdateOfficer(id || "");
  const deactivateMutation = useDeactivateOfficer();

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
  });

  // Initialize edit form when officer data loads
  const startEditing = () => {
    if (officer) {
      setEditForm({
        first_name: officer.first_name,
        last_name: officer.last_name,
        phone: officer.phone || "",
        department: officer.department || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update officer:", err);
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await deactivateMutation.mutateAsync(id);
      setShowDeactivateConfirm(false);
      navigate("/admin/officers");
    } catch (err) {
      console.error("Failed to deactivate officer:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/officers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 bg-card rounded-lg border p-6">
            <div className="space-y-4">
              <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !officer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/officers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Officer Details</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load officer details. The officer may not exist.</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/admin/officers")}
            >
              Back to Officers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/officers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Officer Details
            </h1>
            <p className="text-muted-foreground">
              Employee ID: {officer.employee_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {officer.first_name[0]}
                  {officer.last_name[0]}
                </span>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={editForm.first_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, first_name: e.target.value })
                      }
                      className="w-32"
                      placeholder="First name"
                    />
                    <Input
                      value={editForm.last_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, last_name: e.target.value })
                      }
                      className="w-32"
                      placeholder="Last name"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold">{officer.full_name}</h2>
                )}
                {isEditing ? (
                  <Select
                    value={editForm.department}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, department: value })
                    }
                  >
                    <SelectTrigger className="mt-2 w-64">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-muted-foreground">{officer.department}</p>
                )}
              </div>
            </div>
            <Badge variant={officer.active ? "default" : "secondary"}>
              {officer.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{officer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="h-8 mt-1"
                    placeholder="+63 912 345 6789"
                  />
                ) : (
                  <p className="font-medium">
                    {officer.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">
                  {officer.department || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(officer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {updateMutation.error && (
            <p className="text-destructive text-sm mt-4">
              Failed to update officer. Please try again.
            </p>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Security Status */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">2FA Enabled</span>
                <Badge
                  variant={officer.two_factor_enabled ? "default" : "outline"}
                >
                  {officer.two_factor_enabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Status</span>
                <Badge variant={officer.active ? "default" : "destructive"}>
                  {officer.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Verified</span>
                <Badge variant={officer.verified ? "default" : "outline"}>
                  {officer.verified ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {officer.active && (
            <div className="bg-card rounded-lg border border-destructive/20 p-4">
              <h3 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Deactivating this officer will prevent them from logging in.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeactivateConfirm(true)}
              >
                Deactivate Officer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-2">Confirm Deactivation</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to deactivate{" "}
              <strong>{officer.full_name}</strong>? They will no longer be able
              to log in to the system.
            </p>
            {deactivateMutation.error && (
              <p className="text-destructive text-sm mb-4">
                Failed to deactivate. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateConfirm(false)}
                disabled={deactivateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending
                  ? "Deactivating..."
                  : "Deactivate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
