import { CreditCard } from "lucide-react";

export function OfficerPaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Payments
                </h1>
                <p className="text-gray-500">
                    Record and manage customer payments
                </p>
            </div>

            {/* Placeholder content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No recent payments</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Recorded payments will appear here
                    </p>
                </div>
            </div>
        </div>
    );
}
