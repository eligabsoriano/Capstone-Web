import {
    CheckCircle,
    ClipboardList,
    TrendingUp,
    UserCheck,
} from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: {
        value: number;
        label: string;
    };
}

function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="h-4 w-4 text-teal-600" />
                            <span className="text-teal-600 font-medium">{trend.value}%</span>
                            <span className="text-gray-500">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-lg bg-teal-50">
                    <Icon className="h-6 w-6 text-teal-600" />
                </div>
            </div>
        </div>
    );
}

export function OfficerDashboardPage() {
    // TODO: Replace with actual data from API (GET /api/analytics/officer/)
    const stats = {
        totalApproved: 156,
        assignedToMe: 12,
        approvedToday: 5,
        approvalRate: 94.2,
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Welcome back! Here's an overview of your activity.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Approved"
                    value={stats.totalApproved}
                    subtitle="All-time approvals"
                    icon={CheckCircle}
                />
                <StatCard
                    title="Assigned to Me"
                    value={stats.assignedToMe}
                    subtitle="Pending review"
                    icon={ClipboardList}
                />
                <StatCard
                    title="Approved Today"
                    value={stats.approvedToday}
                    subtitle="Keep up the great work!"
                    icon={UserCheck}
                />
                <StatCard
                    title="Approval Rate"
                    value={`${stats.approvalRate}%`}
                    icon={TrendingUp}
                    trend={{
                        value: 2.5,
                        label: "vs last month",
                    }}
                />
            </div>

            {/* Quick Actions / Recent Activity Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Applications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Applications
                    </h2>
                    <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No recent applications to display</p>
                        <p className="text-sm mt-1">
                            Applications assigned to you will appear here
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50 transition-colors text-left"
                        >
                            <div className="p-2 rounded-lg bg-teal-50">
                                <ClipboardList className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Application Queue</p>
                                <p className="text-sm text-gray-500">Review pending loan applications</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50 transition-colors text-left"
                        >
                            <div className="p-2 rounded-lg bg-teal-50">
                                <CheckCircle className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Record Payment</p>
                                <p className="text-sm text-gray-500">Log a new customer payment</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
