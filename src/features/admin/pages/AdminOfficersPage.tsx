import { AlertCircle, Eye, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateOfficerRequest } from "@/types/api";
import { useCreateOfficer, useOfficersList } from "../hooks";

export function AdminOfficersPage() {
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
  const [createForm, setCreateForm] = useState<CreateOfficerRequest>({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
  });

  // Determine active filter for API
  const apiFilter =
    activeFilter === "all" ? undefined : { active: activeFilter === "active" };
  const { data, isLoading, error } = useOfficersList(apiFilter);
  const createOfficerMutation = useCreateOfficer();

  const officers = data?.loan_officers ?? [];

  const filteredOfficers = officers.filter((officer) => {
    const matchesSearch =
      searchQuery === "" ||
      officer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.employee_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleCreateOfficer = async () => {
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
      }
    } catch (err) {
      console.error("Failed to create officer:", err);
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
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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
        ) : filteredOfficers.length === 0 ? (
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                    Department
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
                {filteredOfficers.map((officer) => (
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
                />
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
                  />
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
                  />
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
                />
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
                <Input
                  id="officer-department"
                  value={createForm.department}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, department: e.target.value })
                  }
                  placeholder="Loans Department"
                />
              </div>
            </div>
            {createOfficerMutation.error && (
              <p className="text-destructive text-sm mt-4">
                Failed to create officer. Please try again.
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
                onClick={handleCreateOfficer}
                disabled={
                  createOfficerMutation.isPending ||
                  !createForm.employee_id ||
                  !createForm.first_name ||
                  !createForm.last_name ||
                  !createForm.email
                }
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
