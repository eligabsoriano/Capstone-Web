import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/features/admin/components";
import {
  AdminAdminsPage,
  AdminApplicationsPage,
  AdminAuditLogsPage,
  AdminDashboardPage,
  AdminOfficerDetailPage,
  AdminOfficersPage,
  AdminProductsPage,
  AdminSettingsPage,
  AdminWorkloadPage,
} from "@/features/admin/pages";
import {
  GuestOnlyRoute,
  LoginPage,
  ProtectedRoute,
  RequireRole,
  Verify2FAPage,
} from "@/features/auth/components";
import { useAuthStore } from "@/features/auth/store/authStore";
import { OfficerLayout } from "@/features/loan-officer/components";
import {
  OfficerApplicationDetailPage,
  OfficerApplicationsPage,
  OfficerDashboardPage,
  OfficerPaymentsPage,
  OfficerSettingsPage,
} from "@/features/loan-officer/pages";

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
      // LOAN OFFICER ROUTES - With OfficerLayout
      // ========================================================================
      {
        element: <RequireRole allowedRoles={["loan_officer", "admin"]} />,
        children: [
          {
            path: "/officer",
            element: <OfficerLayout />,
            children: [
              {
                index: true,
                element: <OfficerDashboardPage />,
              },
              {
                path: "applications",
                element: <OfficerApplicationsPage />,
              },
              {
                path: "applications/:id",
                element: <OfficerApplicationDetailPage />,
              },
              {
                path: "payments",
                element: <OfficerPaymentsPage />,
              },
              {
                path: "settings",
                element: <OfficerSettingsPage />,
              },
            ],
          },
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
                path: "officers/:id",
                element: <AdminOfficerDetailPage />,
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
