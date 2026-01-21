import { Wallet } from "lucide-react";

export function OfficerDisbursementsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Disbursements
                </h1>
                <p className="text-gray-500">
                    Process approved loan disbursements
                </p>
            </div>

            {/* Placeholder content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No pending disbursements</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Approved loans ready for disbursement will appear here
                    </p>
                </div>
            </div>
        </div>
    );
}
