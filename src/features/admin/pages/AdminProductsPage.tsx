import { Package } from "lucide-react";

export function AdminProductsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Loan Products</h1>
                <p className="text-muted-foreground">Configure loan products</p>
            </div>

            {/* Placeholder content */}
            <div className="bg-card rounded-lg border p-8">
                <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Product management coming soon</p>
                </div>
            </div>
        </div>
    );
}
