import { ClipboardList, UserPlus, Search, X, AlertCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useOfficerWorkload, useAssignApplication } from "../hooks";

// TODO: Create useApplicationsList hook when endpoint is available
// For now using placeholder data structure

export function AdminApplicationsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [assignModal, setAssignModal] = useState<{ open: boolean; applicationId: string | null }>({
        open: false,
        applicationId: null,
    });

    // TODO: Replace with actual useApplicationsList hook when endpoint is confirmed
    const isLoading = false;
    const error = null;

    // Placeholder applications data - will be replaced with API data
    const applications = [
        {
            id: "LA-2024-0901",
            customer_name: "Maria Santos",
            product_name: "MSME Business Loan",
            requested_amount: 150000,
            status: "submitted",
            assigned_officer: null,
            submitted_at: "2024-01-21T08:30:00Z",
        },
        {
            id: "LA-2024-0900",
            customer_name: "Juan Dela Cruz",
            product_name: "Working Capital Loan",
            requested_amount: 75000,
            status: "submitted",
            assigned_officer: null,
            submitted_at: "2024-01-21T07:15:00Z",
        },
        {
            id: "LA-2024-0899",
            customer_name: "Ana Reyes",
            product_name: "Equipment Financing",
            requested_amount: 250000,
            status: "under_review",
            assigned_officer: "John Doe",
            submitted_at: "2024-01-20T14:00:00Z",
        },
        {
            id: "LA-2024-0898",
            customer_name: "Pedro Garcia",
            product_name: "MSME Business Loan",
            requested_amount: 100000,
            status: "approved",
            assigned_officer: "Jane Smith",
            submitted_at: "2024-01-20T10:30:00Z",
        },
    ];

    const { data: workloadData, isLoading: workloadLoading } = useOfficerWorkload();
    const assignMutation = useAssignApplication();

    const officers = workloadData?.officers ?? [];

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "submitted", label: "Submitted" },
        { value: "under_review", label: "Under Review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "approved": return "default";
            case "rejected": return "destructive";
            case "under_review": return "secondary";
            default: return "outline";
        }
    };

    const filteredApplications = applications.filter((app) => {
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const matchesSearch =
            searchQuery === "" ||
            app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleAssign = async (officerId: string) => {
        if (!assignModal.applicationId) return;
        try {
            await assignMutation.mutateAsync({
                applicationId: assignModal.applicationId,
                data: { officer_id: officerId },
            });
            setAssignModal({ open: false, applicationId: null });
        } catch (err) {
            console.error("Failed to assign application:", err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                    <p className="text-muted-foreground">View and manage loan applications</p>
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
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <p className="text-muted-foreground">
                    View all loan applications and assign to officers
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        placeholder="Search by ID or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Applications Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Loan Applications</CardTitle>
                    <CardDescription>
                        {filteredApplications.length} applications found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 py-3 border-b">
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Application ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Product</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Amount</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-3 px-4 font-mono text-sm">{app.id}</td>
                                            <td className="py-3 px-4 font-medium">{app.customer_name}</td>
                                            <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{app.product_name}</td>
                                            <td className="py-3 px-4 text-right hidden sm:table-cell">{formatCurrency(app.requested_amount)}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getStatusBadgeVariant(app.status)}>
                                                    {app.status.replace("_", " ")}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                {app.assigned_officer || (
                                                    <span className="text-muted-foreground italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {!app.assigned_officer && app.status === "submitted" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAssignModal({ open: true, applicationId: app.id })}
                                                    >
                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                        Assign
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assign Modal */}
            {assignModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Assign Application</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAssignModal({ open: false, applicationId: null })}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Assign <span className="font-mono font-medium">{assignModal.applicationId}</span> to a loan officer:
                        </p>
                        {workloadLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : officers.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No officers available</p>
                        ) : (
                            <div className="space-y-2">
                                {officers.map((officer) => (
                                    <button
                                        key={officer.id}
                                        onClick={() => handleAssign(officer.id)}
                                        disabled={assignMutation.isPending}
                                        className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                                    >
                                        <div>
                                            <span className="font-medium">{officer.name}</span>
                                            <p className="text-sm text-muted-foreground">{officer.email}</p>
                                        </div>
                                        <Badge variant="outline">
                                            {officer.current_applications} active
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        )}
                        {assignMutation.error && (
                            <p className="text-destructive text-sm mt-4">Failed to assign. Please try again.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
