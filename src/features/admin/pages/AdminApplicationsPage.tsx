import { ClipboardList } from "lucide-react";

export function AdminApplicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <p className="text-muted-foreground">View and manage loan applications</p>
            </div>

            {/* Placeholder content */}
            <div className="bg-card rounded-lg border p-8">
                <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Applications oversight coming soon</p>
                </div>
            </div>
        </div>
    );
}
