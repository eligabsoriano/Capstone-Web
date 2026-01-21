import { UserCog } from "lucide-react";

export function AdminAdminsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
                <p className="text-muted-foreground">
                    Manage administrator accounts (Super Admin only)
                </p>
            </div>

            {/* Placeholder content */}
            <div className="bg-card rounded-lg border p-8">
                <div className="text-center py-8">
                    <UserCog className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Admin management coming soon</p>
                </div>
            </div>
        </div>
    );
}
