import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Key,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { getNameValidationError, normalizeName } from "@/lib/nameValidation";
import type { AdminSearchParams, CreateAdminRequest } from "@/types/api";
import { useAdminsList, useCreateAdmin } from "../hooks";

export function AdminAdminsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"full_name" | "email" | "created_at">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handler for filter changes - resets page
  const handleFilterChange = (filter: "all" | "active" | "inactive") => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Handler for column sorting
  const handleSort = (column: "full_name" | "email" | "created_at") => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column with ascending order
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Build search params for API
  const searchParams: AdminSearchParams = {
    page: currentPage,
    page_size: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  // Only add search if not empty
  if (debouncedSearch.trim()) {
    searchParams.search = debouncedSearch.trim();
  }

  // Only add active filter if not "all"
  if (activeFilter !== "all") {
    searchParams.active = activeFilter === "active";
  }

  const { data, isLoading, error } = useAdminsList(searchParams);
  const createAdminMutation = useCreateAdmin();

  const admins = data?.admins ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!createForm.username.trim()) {
      errors.username = "Username is required";
    } else if (createForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!createForm.first_name.trim()) {
      errors.first_name = "First name is required";
    } else {
      const nameError = getNameValidationError(
        createForm.first_name,
        "First name",
      );
      if (nameError) {
        errors.first_name = nameError;
      }
    }

    if (!createForm.last_name.trim()) {
      errors.last_name = "Last name is required";
    } else {
      const nameError = getNameValidationError(
        createForm.last_name,
        "Last name",
      );
      if (nameError) {
        errors.last_name = nameError;
      }
    }

    if (!createForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAdmin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload: CreateAdminRequest = {
        ...createForm,
        first_name: normalizeName(createForm.first_name),
        last_name: normalizeName(createForm.last_name),
      };

      const response = await createAdminMutation.mutateAsync(payload);
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
        setFormErrors({});
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
            onClick={() => handleFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("active")}
          >
            Active
          </Button>
          <Button
            variant={activeFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("inactive")}
          >
            Inactive
          </Button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {admins.length} of {total} admins
        </div>
      )}

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
        ) : admins.length === 0 ? (
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
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("full_name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === "full_name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === "email" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                    Role
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortBy === "created_at" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        ))}
                    </div>
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
                {admins.map((admin) => (
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
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(admin.created_at).toLocaleDateString()}
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

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

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
                  className={formErrors.username ? "border-destructive" : ""}
                />
                {formErrors.username && (
                  <p className="text-destructive text-xs mt-1">
                    {formErrors.username}
                  </p>
                )}
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
                    maxLength={50}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        first_name: e.target.value,
                      })
                    }
                    placeholder="John"
                    className={
                      formErrors.first_name ? "border-destructive" : ""
                    }
                  />
                  {formErrors.first_name && (
                    <p className="text-destructive text-xs mt-1">
                      {formErrors.first_name}
                    </p>
                  )}
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
                    maxLength={50}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        last_name: e.target.value,
                      })
                    }
                    placeholder="Doe"
                    className={formErrors.last_name ? "border-destructive" : ""}
                  />
                  {formErrors.last_name && (
                    <p className="text-destructive text-xs mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
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
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
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
                onClick={() => {
                  setShowCreateModal(false);
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={createAdminMutation.isPending}
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
