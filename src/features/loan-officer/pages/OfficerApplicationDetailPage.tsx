import { ArrowLeft, CheckCircle, FileText, User, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function OfficerApplicationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/officer/applications")}
                    className="text-gray-600 hover:text-teal-700 hover:bg-teal-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Application Details
                    </h1>
                    <p className="text-gray-500">Application ID: {id}</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-teal-600" />
                            Customer Profile
                        </h2>
                        <div className="text-center py-8 text-gray-500">
                            Customer profile information will be loaded here
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-teal-600" />
                            Uploaded Documents
                        </h2>
                        <div className="text-center py-8 text-gray-500">
                            Documents for verification will appear here
                        </div>
                    </div>
                </div>

                {/* Sidebar - Actions */}
                <div className="space-y-6">
                    {/* Application Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Application Status
                        </h2>
                        <div className="text-center py-4 text-gray-500">
                            Status and loan details will appear here
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Actions
                        </h2>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                disabled
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Application
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                disabled
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Application
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                                disabled
                            >
                                Disburse Loan
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                            Actions will be enabled when application data loads
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
