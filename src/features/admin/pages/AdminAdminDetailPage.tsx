import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  Key,
  KeyRound,
  Mail,
  Save,
  Shield,
  ShieldCheck,
  UserX,
  X,
} from "lucide-react";
import { useState } from "react";

// Available permissions from backend
const ADMIN_PERMISSIONS = [
  {
    key: "create_loan_officer",
    label: "Create Loan Officer",
    description: "Can create new loan officer accounts",
  },
  {
    key: "manage_loan_officers",
    label: "Manage Loan Officers",
    description: "Can edit/deactivate loan officers",
  },
  {
    key: "manage_users",
    label: "Manage Users",
    description: "Can lock/unlock any user account",
  },
  {
    key: "view_analytics",
    label: "View Analytics",
    description: "Can access system-wide analytics",
  },
  {
    key: "view_logs",
    label: "View Logs",
    description: "Can access audit logs",
  },
  {
    key: "manage_system",
    label: "Manage System",
    description: "Can modify system configurations",
  },
] as const;

import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getNameValidationError, normalizeName } from "@/lib/nameValidation";
import {
  useAdminDetail,
  useDeactivateAdmin,
  useUpdateAdmin,
  useUpdateAdminPermissions,
} from "../hooks";

export function AdminAdminDetailPage() {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const { data: admin, isLoading, error } = useAdminDetail(adminId || "");
  const updateMutation = useUpdateAdmin(adminId || "");
  const deactivateMutation = useDeactivateAdmin();
  const permissionsMutation = useUpdateAdminPermissions(adminId || "");

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check if viewing own account
  const isOwnAccount =
    currentUser && "superAdmin" in currentUser && adminId === currentUser.id;

  // Initialize edit form when admin data loads
  const startEditing = () => {
    if (admin) {
      setEditForm({
        first_name: admin.first_name,
        last_name: admin.last_name,
      });
      setFormErrors({});
      setIsEditing(true);
    }
  };

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};

    const firstNameError = getNameValidationError(
      editForm.first_name,
      "First name",
    );
    if (firstNameError) {
      errors.first_name = firstNameError;
    }

    const lastNameError = getNameValidationError(
      editForm.last_name,
      "Last name",
    );
    if (lastNameError) {
      errors.last_name = lastNameError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        ...editForm,
        first_name: normalizeName(editForm.first_name),
        last_name: normalizeName(editForm.last_name),
      });
      setIsEditing(false);
      setFormErrors({});
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      const apiMessage = err?.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        setFormErrors((prev) => ({ ...prev, ...apiErrors }));
      } else if (apiMessage) {
        setFormErrors((prev) => ({ ...prev, general: apiMessage }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          general: "Failed to update admin. Please try again.",
        }));
      }
      console.error("Failed to update admin:", err);
    }
  };

  const handleDeactivate = async () => {
    if (!adminId) return;
    try {
      await deactivateMutation.mutateAsync(adminId);
      setShowDeactivateConfirm(false);
      navigate("/admin/admins");
    } catch (err) {
      console.error("Failed to deactivate admin:", err);
    }
  };

  const handleActivate = async () => {
    try {
      await updateMutation.mutateAsync({ active: true });
      setShowActivateConfirm(false);
    } catch (err) {
      console.error("Failed to activate admin:", err);
    }
  };

  const handleToggleSuperAdmin = async () => {
    if (!admin) return;
    try {
      await permissionsMutation.mutateAsync({
        super_admin: !admin.super_admin,
      });
      setShowPromoteConfirm(false);
    } catch (err) {
      console.error("Failed to update permissions:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/admins")}
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

  if (error || !admin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/admins")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Admin Details</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>
                Failed to load admin details. The admin may not exist or you may
                not have permission.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/admin/admins")}
            >
              Back to Admins
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
            onClick={() => navigate("/admin/admins")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Details</h1>
            <p className="text-muted-foreground">Username: {admin.username}</p>
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
                  {admin.first_name[0]}
                  {admin.last_name[0]}
                </span>
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        value={editForm.first_name}
                        maxLength={50}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            first_name: e.target.value,
                          })
                        }
                        className="w-32"
                        placeholder="First name"
                      />
                      <Input
                        value={editForm.last_name}
                        maxLength={50}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            last_name: e.target.value,
                          })
                        }
                        className="w-32"
                        placeholder="Last name"
                      />
                    </div>
                    {(formErrors.first_name || formErrors.last_name) && (
                      <p className="text-destructive text-xs">
                        {formErrors.first_name || formErrors.last_name}
                      </p>
                    )}
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold">{admin.full_name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {admin.super_admin ? (
                    <Badge variant="default" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={admin.active ? "default" : "secondary"}>
              {admin.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{admin.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium font-mono">{admin.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(admin.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="font-medium">
                  {admin.super_admin
                    ? "Full Access (Super Admin)"
                    : admin.permissions.length > 0
                      ? `${admin.permissions.length} of ${ADMIN_PERMISSIONS.length}`
                      : "No permissions"}
                </p>
              </div>
            </div>
          </div>

          {(updateMutation.error || formErrors.general) && (
            <p className="text-destructive text-sm mt-4">
              {formErrors.general ||
                "Failed to update admin. Please try again."}
            </p>
          )}

          {/* Granular Permissions Card */}
          {!admin.super_admin && (
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Permissions
                </h3>
                {!isOwnAccount && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isEditingPermissions) {
                        setIsEditingPermissions(false);
                      } else {
                        setEditPermissions(admin.permissions);
                        setIsEditingPermissions(true);
                      }
                    }}
                  >
                    {isEditingPermissions ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {ADMIN_PERMISSIONS.map((perm) => {
                  const hasPermission = isEditingPermissions
                    ? editPermissions.includes(perm.key)
                    : admin.permissions.includes(perm.key);
                  return (
                    <div key={perm.key} className="flex items-start gap-2">
                      {isEditingPermissions ? (
                        <input
                          type="checkbox"
                          id={`edit-perm-${perm.key}`}
                          checked={hasPermission}
                          onChange={(e) => {
                            const newPerms = e.target.checked
                              ? [...editPermissions, perm.key]
                              : editPermissions.filter((p) => p !== perm.key);
                            setEditPermissions(newPerms);
                          }}
                          className="h-4 w-4 rounded border-gray-300 mt-1"
                        />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full mt-1 flex items-center justify-center ${hasPermission ? "bg-green-500" : "bg-muted border"}`}
                        >
                          {hasPermission && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      )}
                      <label
                        htmlFor={
                          isEditingPermissions
                            ? `edit-perm-${perm.key}`
                            : undefined
                        }
                        className="text-sm"
                      >
                        <span
                          className={`font-medium ${!hasPermission && !isEditingPermissions ? "text-muted-foreground" : ""}`}
                        >
                          {perm.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {perm.description}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
              {isEditingPermissions && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await permissionsMutation.mutateAsync({
                          permissions: editPermissions,
                        });
                        setIsEditingPermissions(false);
                      } catch (err) {
                        console.error("Failed to update permissions:", err);
                      }
                    }}
                    disabled={permissionsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {permissionsMutation.isPending
                      ? "Saving..."
                      : "Save Permissions"}
                  </Button>
                </div>
              )}
              {admin.permissions.length === 0 && !isEditingPermissions && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  No specific permissions assigned. This admin may have limited
                  access.
                </p>
              )}
            </div>
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
                  variant={admin.two_factor_enabled ? "default" : "outline"}
                >
                  {admin.two_factor_enabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Status</span>
                <Badge variant={admin.active ? "default" : "destructive"}>
                  {admin.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant={admin.super_admin ? "default" : "secondary"}>
                  {admin.super_admin ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Role Management */}
          {!isOwnAccount && (
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Role Management
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {admin.super_admin
                  ? "Demoting will remove full system access."
                  : "Promoting will grant full system access."}
              </p>
              <Button
                variant={admin.super_admin ? "outline" : "default"}
                className="w-full"
                onClick={() => setShowPromoteConfirm(true)}
              >
                {admin.super_admin
                  ? "Demote to Admin"
                  : "Promote to Super Admin"}
              </Button>
            </div>
          )}

          {/* Danger Zone / Activation */}
          {!isOwnAccount && (
            <>
              {admin.active ? (
                <div className="bg-card rounded-lg border border-destructive/20 p-4">
                  <h3 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Deactivating this admin will prevent them from logging in.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeactivateConfirm(true)}
                  >
                    Deactivate Admin
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-green-500/20 p-4">
                  <h3 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Activate Admin
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Reactivate this admin to allow them to log in again.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => setShowActivateConfirm(true)}
                  >
                    Activate Admin
                  </Button>
                </div>
              )}
            </>
          )}

          {isOwnAccount && (
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground text-center">
                You cannot deactivate or demote your own account.
              </p>
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
              <strong>{admin.full_name}</strong>? They will no longer be able to
              log in to the system.
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

      {/* Activate Confirmation Modal */}
      {showActivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-2">Confirm Activation</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to activate{" "}
              <strong>{admin.full_name}</strong>? They will be able to log in to
              the system.
            </p>
            {updateMutation.error && (
              <p className="text-destructive text-sm mb-4">
                Failed to activate. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowActivateConfirm(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleActivate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Activating..." : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Promote/Demote Confirmation Modal */}
      {showPromoteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-2">
              {admin.super_admin ? "Demote Admin" : "Promote to Super Admin"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {admin.super_admin
                ? `Are you sure you want to demote ${admin.full_name}? They will lose super admin privileges.`
                : `Are you sure you want to promote ${admin.full_name} to Super Admin? They will have full system access.`}
            </p>
            {permissionsMutation.error && (
              <p className="text-destructive text-sm mb-4">
                Failed to update permissions. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPromoteConfirm(false)}
                disabled={permissionsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleToggleSuperAdmin}
                disabled={permissionsMutation.isPending}
              >
                {permissionsMutation.isPending ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
