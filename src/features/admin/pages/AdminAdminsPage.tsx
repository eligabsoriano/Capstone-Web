import {
  AlertCircle,
  Eye,
  Key,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
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

import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateAdminRequest } from "@/types/api";
import { useAdminsList, useCreateAdmin } from "../hooks";

export function AdminAdminsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<{
    open: boolean;
    password: string;
  }>({
    open: false,
    password: "",
  });
  const [createForm, setCreateForm] = useState<CreateAdminRequest>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    super_admin: false,
    permissions: [],
  });

  // Determine active filter for API
  const apiFilter =
    activeFilter === "all" ? undefined : { active: activeFilter === "active" };
  const { data, isLoading, error } = useAdminsList(apiFilter);
  const createAdminMutation = useCreateAdmin();

  const admins = data?.admins ?? [];

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      searchQuery === "" ||
      admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleCreateAdmin = async () => {
    try {
      const response = await createAdminMutation.mutateAsync(createForm);
      if (response.status === "success" && response.data) {
        setShowCreateModal(false);
        setShowPasswordModal({
          open: true,
          password: response.data.temporary_password,
        });
        setCreateForm({
          username: "",
          email: "",
          first_name: "",
          last_name: "",
          super_admin: false,
          permissions: [],
        });
      }
    } catch (err) {
      console.error("Failed to create admin:", err);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(showPasswordModal.password);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
          <p className="text-muted-foreground">
            Manage administrator accounts (Super Admin only)
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>
                Failed to load admins. You may not have permission to view this
                page.
              </p>
            </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
          <p className="text-muted-foreground">
            Manage administrator accounts (Super Admin only)
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={activeFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <UserCog className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/admin/admins/${admin.id}`)}
                  >
                    <td className="py-3 px-4 font-mono text-sm">
                      {admin.username}
                    </td>
                    <td className="py-3 px-4 font-medium">{admin.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {admin.email}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
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
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={admin.active ? "default" : "secondary"}>
                        {admin.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/admins/${admin.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Administrator</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-username" className="text-sm font-medium">
                  Username *
                </label>
                <Input
                  id="admin-username"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                  placeholder="admin_username"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="admin-first-name"
                    className="text-sm font-medium"
                  >
                    First Name *
                  </label>
                  <Input
                    id="admin-first-name"
                    value={createForm.first_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        first_name: e.target.value,
                      })
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-last-name"
                    className="text-sm font-medium"
                  >
                    Last Name *
                  </label>
                  <Input
                    id="admin-last-name"
                    value={createForm.last_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        last_name: e.target.value,
                      })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="admin@company.com"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="super-admin-checkbox"
                  checked={createForm.super_admin}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      super_admin: e.target.checked,
                      permissions: e.target.checked
                        ? []
                        : createForm.permissions,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="super-admin-checkbox"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Grant Super Admin privileges
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Super Admins have full access to all features including managing
                other administrators.
              </p>

              {/* Granular Permissions (shown when NOT super admin) */}
              {!createForm.super_admin && (
                <div className="space-y-3 border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Key className="h-4 w-4" />
                    Permissions
                  </div>
                  <div className="space-y-2">
                    {ADMIN_PERMISSIONS.map((perm) => (
                      <div key={perm.key} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id={`perm-${perm.key}`}
                          checked={
                            createForm.permissions?.includes(perm.key) || false
                          }
                          onChange={(e) => {
                            const newPerms = e.target.checked
                              ? [...(createForm.permissions || []), perm.key]
                              : (createForm.permissions || []).filter(
                                  (p) => p !== perm.key,
                                );
                            setCreateForm({
                              ...createForm,
                              permissions: newPerms,
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 mt-0.5"
                        />
                        <label htmlFor={`perm-${perm.key}`} className="text-sm">
                          <span className="font-medium">{perm.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {perm.description}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {createAdminMutation.error && (
              <p className="text-destructive text-sm mt-4">
                Failed to create admin. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={
                  createAdminMutation.isPending ||
                  !createForm.username ||
                  !createForm.first_name ||
                  !createForm.last_name ||
                  !createForm.email
                }
              >
                {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-2">
              Admin Created Successfully!
            </h2>
            <p className="text-muted-foreground mb-4">
              Please save the temporary password below. It will not be shown
              again.
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-center text-lg">
              {showPasswordModal.password}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={copyPassword}>
                Copy Password
              </Button>
              <Button
                onClick={() =>
                  setShowPasswordModal({ open: false, password: "" })
                }
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
