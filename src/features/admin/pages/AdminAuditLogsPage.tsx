import { FileText, RefreshCw, Filter, Clock, User, Globe, AlertCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuditLogs } from "../hooks";

export function AdminAuditLogsPage() {
    const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
    const [limit, setLimit] = useState<number>(25);

    const { data, isLoading, error, refetch } = useAuditLogs({
        action: actionFilter,
        limit
    });

    const logs = data?.logs ?? [];

    const actionTypes = [
        { value: undefined, label: "All Actions" },
        { value: "login", label: "Login" },
        { value: "logout", label: "Logout" },
        { value: "officer_created", label: "Officer Created" },
        { value: "loan_approved", label: "Loan Approved" },
        { value: "loan_rejected", label: "Loan Rejected" },
        { value: "document_verified", label: "Document Verified" },
    ];

    const limitOptions = [10, 25, 50, 100];

    const getActionBadgeVariant = (action: string) => {
        if (action.includes("approved") || action === "login") return "default";
        if (action.includes("rejected")) return "destructive";
        if (action.includes("created")) return "secondary";
        return "outline";
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">View system activity logs</p>
                </div>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p>Failed to load audit logs. Please try again.</p>
                        </div>
                        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
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
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">
                        View and filter system activity logs
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Action Type</label>
                            <select
                                value={actionFilter ?? ""}
                                onChange={(e) => setActionFilter(e.target.value || undefined)}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                                {actionTypes.map((type) => (
                                    <option key={type.label} value={type.value ?? ""}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Show</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                                {limitOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt} entries
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        Showing {logs.length} {data?.total ? `of ${data.total}` : ""} entries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4 py-3 border-b">
                                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-48 bg-muted animate-pulse rounded flex-1" />
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No logs found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                            <Clock className="h-4 w-4 inline mr-1" />
                                            Time
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                            <User className="h-4 w-4 inline mr-1" />
                                            User
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                                            <Globe className="h-4 w-4 inline mr-1" />
                                            IP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const { date, time } = formatTimestamp(log.timestamp);
                                        return (
                                            <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="text-sm font-medium">{time}</div>
                                                    <div className="text-xs text-muted-foreground">{date}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {log.user_type.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {log.action.replace(/_/g, " ")}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell text-sm text-muted-foreground">
                                                    {log.description}
                                                </td>
                                                <td className="py-3 px-4 hidden lg:table-cell font-mono text-xs text-muted-foreground">
                                                    {log.ip_address}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
