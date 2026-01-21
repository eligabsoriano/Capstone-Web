import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/features/admin/components";
import { AdminDashboardPage } from "@/features/admin/pages";
import {
  GuestOnlyRoute,
  LoginPage,
  ProtectedRoute,
  RequireRole,
  Verify2FAPage,
} from "@/features/auth/components";
import { useAuthStore } from "@/features/auth/store/authStore";

// ============================================================================
// ROLE-BASED REDIRECT - Redirects user to their appropriate dashboard
// ============================================================================
function RoleBasedRedirect() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "loan_officer":
      return <Navigate to="/officer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// ============================================================================
// PLACEHOLDER PAGES - Replace with actual implementations
// ============================================================================

const LoanOfficerDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Loan Officer Dashboard</h1>
    <p className="text-muted-foreground">Review and manage loan applications</p>
  </div>
);

const ChangePasswordPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
    <div className="max-w-md w-full text-center">
      <h1 className="text-2xl font-bold mb-4">Change Your Password</h1>
      <p className="text-muted-foreground">
        You must change your password before continuing.
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        (Password change form coming soon)
      </p>
    </div>
  </div>
);

// Placeholder admin sub-pages
const AdminOfficersPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Loan Officers</h1>
      <p className="text-muted-foreground">Manage loan officer accounts</p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Loan officers management coming soon
    </div>
  </div>
);

const AdminAdminsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
      <p className="text-muted-foreground">
        Manage administrator accounts (Super Admin only)
      </p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Admin management coming soon
    </div>
  </div>
);

const AdminApplicationsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
      <p className="text-muted-foreground">View and manage loan applications</p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Applications oversight coming soon
    </div>
  </div>
);

const AdminProductsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Loan Products</h1>
      <p className="text-muted-foreground">Configure loan products</p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Product management coming soon
    </div>
  </div>
);

const AdminWorkloadPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Officer Workload</h1>
      <p className="text-muted-foreground">
        View and manage loan officer assignments
      </p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Officer workload dashboard coming soon
    </div>
  </div>
);

const AdminAuditLogsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
      <p className="text-muted-foreground">View system activity logs</p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Audit logs coming soon
    </div>
  </div>
);

const AdminSettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">
        System configuration and preferences
      </p>
    </div>
    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      Settings coming soon
    </div>
  </div>
);

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

export const router = createBrowserRouter([
  // ============================================================================
  // PUBLIC ROUTES (Guest only)
  // ============================================================================
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/verify-2fa",
        element: <Verify2FAPage />,
      },
    ],
  },

  // ============================================================================
  // PROTECTED ROUTES (Requires authentication)
  // ============================================================================
  {
    element: <ProtectedRoute />,
    children: [
      // Root - Redirects based on user role
      {
        path: "/",
        element: <RoleBasedRedirect />,
      },

      // Change password (for loan officers on first login)
      {
        path: "/change-password",
        element: <ChangePasswordPage />,
      },

      // ========================================================================
      // LOAN OFFICER ROUTES
      // ========================================================================
      {
        element: <RequireRole allowedRoles={["loan_officer", "admin"]} />,
        children: [
          {
            path: "/officer",
            element: <LoanOfficerDashboard />,
          },
          // Add more loan officer routes here
        ],
      },

      // ========================================================================
      // ADMIN ONLY ROUTES - With AdminLayout
      // ========================================================================
      {
        element: <RequireRole allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboardPage />,
              },
              {
                path: "officers",
                element: <AdminOfficersPage />,
              },
              {
                path: "admins",
                element: <AdminAdminsPage />,
              },
              {
                path: "applications",
                element: <AdminApplicationsPage />,
              },
              {
                path: "workload",
                element: <AdminWorkloadPage />,
              },
              {
                path: "products",
                element: <AdminProductsPage />,
              },
              {
                path: "audit-logs",
                element: <AdminAuditLogsPage />,
              },
              {
                path: "settings",
                element: <AdminSettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // ============================================================================
  // CATCH-ALL - Redirect to home (which will then redirect based on role)
  // ============================================================================
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
