import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOfficerApplications, useOfficerDashboard } from "../hooks";

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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">
                {trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Loading your analytics...</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OfficerDashboardPage() {
  const { data, isLoading, error, refetch } = useOfficerDashboard();
  const navigate = useNavigate();

  // Fetch recent pending applications for the dashboard
  const { data: recentAppsData, isLoading: recentAppsLoading } =
    useOfficerApplications({
      status: "pending",
      page: 1,
      page_size: 5,
      sort_by: "submitted_at",
      sort_order: "desc",
    });

  const recentApplications = recentAppsData?.applications ?? [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "default" as const;
      case "medium":
        return "secondary" as const;
      case "high":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your activity
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load dashboard data. Please try again.</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardData = data!;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Approved"
          value={dashboardData.my_reviews.total_approved}
          subtitle="All-time approvals"
          icon={CheckCircle}
        />
        <StatCard
          title="Assigned to Me"
          value={dashboardData.queue.assigned_to_me}
          subtitle={`${dashboardData.queue.pending_total} total pending`}
          icon={ClipboardList}
        />
        <StatCard
          title="Approved Today"
          value={dashboardData.my_reviews.approved_today}
          subtitle="Keep up the great work!"
          icon={UserCheck}
        />
        <StatCard
          title="Approval Rate"
          value={dashboardData.performance.approval_rate}
          icon={TrendingUp}
          subtitle={`${dashboardData.performance.total_reviewed} total reviewed`}
        />
      </div>

      {/* Performance Summary */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Today's Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">Approved</span>
              </div>
              <span className="font-semibold text-card-foreground">
                {dashboardData.my_reviews.approved_today}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-muted-foreground">Rejected</span>
              </div>
              <span className="font-semibold text-card-foreground">
                {dashboardData.my_reviews.rejected_today}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            All-Time Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Reviewed</span>
              <span className="font-semibold text-card-foreground">
                {dashboardData.performance.total_reviewed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Rejected</span>
              <span className="font-semibold text-card-foreground">
                {dashboardData.my_reviews.total_rejected}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Recent Applications
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/officer/applications")}
            >
              View All
            </Button>
          </div>
          {recentAppsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse"
                >
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-5 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted" />
              <p>No recent applications to display</p>
              <p className="text-sm mt-1">
                Applications assigned to you will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentApplications.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors text-left cursor-pointer"
                  onClick={() => navigate(`/officer/applications/${app.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-card-foreground text-sm truncate">
                      {(app as { customer_name?: string }).customer_name ||
                        `Application ${app.id.slice(-8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(app.requested_amount)} ·{" "}
                      {app.product_name}
                    </p>
                  </div>
                  <Badge
                    variant={getRiskBadgeVariant(app.risk_category)}
                    className="ml-2 shrink-0"
                  >
                    {app.risk_category || "N/A"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/officer/applications")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">
                  View Application Queue
                </p>
                <p className="text-sm text-muted-foreground">
                  Review pending loan applications
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/officer/payments")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">
                  Record Payment
                </p>
                <p className="text-sm text-muted-foreground">
                  Log a new customer payment
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
