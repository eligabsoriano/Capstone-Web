import { ClipboardList, FileCheck, TrendingUp, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Admin Dashboard Page
 *
 * This is a placeholder that will be replaced with actual analytics
 * data from the /api/analytics/admin/ endpoint.
 */
export function AdminDashboardPage() {
  // Placeholder stats - will be replaced with API data
  const stats = [
    {
      title: "Total Customers",
      value: "—",
      description: "Registered MSME users",
      icon: Users,
    },
    {
      title: "Loan Applications",
      value: "—",
      description: "Total applications",
      icon: ClipboardList,
    },
    {
      title: "Documents Verified",
      value: "—",
      description: "Verification progress",
      icon: FileCheck,
    },
    {
      title: "Approval Rate",
      value: "—",
      description: "Overall approval %",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the MSME Loan Portal admin dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Overview of recent system activity will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Connect to API to load dashboard data
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
