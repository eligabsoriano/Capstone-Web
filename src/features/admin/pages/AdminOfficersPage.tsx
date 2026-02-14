import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import type { CreateOfficerRequest, OfficerSearchParams } from "@/types/api";
import { useCreateOfficer, useOfficersList } from "../hooks";

// Department options - can be configured as needed
const DEPARTMENT_OPTIONS = [
  "Loans Department",
  "Credit Analysis",
  "Collections",
  "Customer Service",
  "Risk Management",
  "Operations",
] as const;

export function AdminOfficersPage() {
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
  const [createForm, setCreateForm] = useState<CreateOfficerRequest>({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
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
  const searchParams: OfficerSearchParams = {
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

  const { data, isLoading, error } = useOfficersList(searchParams);
  const createOfficerMutation = useCreateOfficer();

  const officers = data?.loan_officers ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!createForm.employee_id.trim()) {
      errors.employee_id = "Employee ID is required";
    }

    if (!createForm.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!createForm.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!createForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOfficer = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await createOfficerMutation.mutateAsync(createForm);
      if (response.status === "success" && response.data) {
        setShowCreateModal(false);
        setShowPasswordModal({
          open: true,
          password: response.data.temporary_password,
        });
        setCreateForm({
          employee_id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          department: "",
        });
        setFormErrors({});
      }
    } catch (err: any) {
      console.error("Failed to create officer:", err);

      // Extract error details from API response
      // Axios wraps the response in error.response.data
      const apiResponse = err?.response?.data;

      if (apiResponse?.errors) {
        // Backend returned field-specific errors (e.g., {email: "Email already exists"})
        setFormErrors(apiResponse.errors);
      } else if (apiResponse?.message) {
        // Backend returned a general error message (e.g., "A loan officer with this email already exists")
        setFormErrors({ general: apiResponse.message });
      } else if (err?.message) {
        // Network or other error
        setFormErrors({ general: err.message });
      } else {
        // Fallback error
        setFormErrors({
          general: "Failed to create officer. Please try again.",
        });
      }
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(showPasswordModal.password);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Officers</h1>
          <p className="text-muted-foreground">Manage loan officer accounts</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load officers. Please try again.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Loan Officers</h1>
          <p className="text-muted-foreground">Manage loan officer accounts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Officer
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
            placeholder="Search by name, email, or ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {officers.length} of {total} officers
        </div>
      )}

      {/* Officers Table */}
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
        ) : officers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No officers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Employee ID
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("full_name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === "full_name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === "email" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Created
                      {sortBy === "created_at" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr
                    key={officer.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/admin/officers/${officer.id}`)}
                  >
                    <td className="py-3 px-4 font-mono text-sm">
                      {officer.employee_id}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {officer.full_name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {officer.email}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {officer.department}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={officer.active ? "default" : "secondary"}>
                        {officer.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                      {officer.created_at
                        ? new Date(officer.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/officers/${officer.id}`);
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

      {/* Create Officer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Loan Officer</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="officer-employee-id"
                  className="text-sm font-medium"
                >
                  Employee ID *
                </label>
                <Input
                  id="officer-employee-id"
                  value={createForm.employee_id}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      employee_id: e.target.value,
                    })
                  }
                  placeholder="EMP-001"
                  className={formErrors.employee_id ? "border-destructive" : ""}
                />
                {formErrors.employee_id && (
                  <p className="text-destructive text-xs mt-1">
                    {formErrors.employee_id}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="officer-first-name"
                    className="text-sm font-medium"
                  >
                    First Name *
                  </label>
                  <Input
                    id="officer-first-name"
                    value={createForm.first_name}
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
                    htmlFor="officer-last-name"
                    className="text-sm font-medium"
                  >
                    Last Name *
                  </label>
                  <Input
                    id="officer-last-name"
                    value={createForm.last_name}
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
                <label htmlFor="officer-email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="officer-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="john.doe@company.com"
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="officer-phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="officer-phone"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div>
                <label
                  htmlFor="officer-department"
                  className="text-sm font-medium"
                >
                  Department
                </label>
                <Select
                  value={createForm.department}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, department: value })
                  }
                >
                  <SelectTrigger id="officer-department">
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
              </div>
            </div>
            {formErrors.general && (
              <p className="text-destructive text-sm mt-4">
                {formErrors.general}
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
                onClick={handleCreateOfficer}
                disabled={createOfficerMutation.isPending}
              >
                {createOfficerMutation.isPending
                  ? "Creating..."
                  : "Create Officer"}
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
              Officer Created Successfully!
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
