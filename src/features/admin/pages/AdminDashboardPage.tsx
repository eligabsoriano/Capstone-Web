import {
  ClipboardList,
  FileCheck,
  TrendingUp,
  Users,
  UserCog,
  Shield,
  RefreshCw,
  Package,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "../hooks";

/**
 * Admin Dashboard Page
 *
 * Displays system-wide analytics from /api/analytics/admin/
 */
export function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">System-wide analytics</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load dashboard data. Please try again.</p>
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

  const dashboardData = data!;

  const userStats = [
    {
      title: "Total Customers",
      value: dashboardData.users.customers.toLocaleString(),
      description: "Registered MSME users",
      icon: Users,
    },
    {
      title: "Loan Officers",
      value: dashboardData.users.loan_officers.toString(),
      description: "Active officers",
      icon: UserCog,
    },
    {
      title: "Admins",
      value: dashboardData.users.admins.toString(),
      description: "System administrators",
      icon: Shield,
    },
  ];

  const loanStats = [
    {
      title: "Total Applications",
      value: dashboardData.loans.total.toLocaleString(),
      description: "All time",
      icon: ClipboardList,
    },
    {
      title: "Pending Review",
      value: (dashboardData.loans.pending + dashboardData.loans.under_review).toString(),
      description: `${dashboardData.loans.pending} pending, ${dashboardData.loans.under_review} in review`,
      icon: FileCheck,
    },
    {
      title: "Approval Rate",
      value: dashboardData.loans.total > 0
        ? `${((dashboardData.loans.approved / dashboardData.loans.total) * 100).toFixed(1)}%`
        : "0%",
      description: `${dashboardData.loans.approved} approved, ${dashboardData.loans.rejected} rejected`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            System-wide analytics and activity overview
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Users Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {userStats.map((stat) => {
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
      </div>

      {/* Loans Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Loans Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {loanStats.map((stat) => {
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
      </div>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Performance
          </CardTitle>
          <CardDescription>
            Application statistics by loan product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No products data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Product</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Applications</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Approved</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.products.map((product) => (
                    <tr key={product.name} className="border-b last:border-0">
                      <td className="py-3 font-medium">{product.name}</td>
                      <td className="py-3 text-right">{product.applications}</td>
                      <td className="py-3 text-right">{product.approved}</td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary">{product.approval_rate}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions from the audit log
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.recent_activity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recent_activity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      By {activity.user_type} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.action.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
