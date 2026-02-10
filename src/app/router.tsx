import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/features/admin/components";
import {
  AdminAdminDetailPage,
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
  ForgotPasswordPage,
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
  OfficerDocumentsPage,
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
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
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

      // ========================================================================
      // LOAN OFFICER ROUTES - With OfficerLayout
      // ========================================================================
      {
        element: <RequireRole allowedRoles={["loan_officer"]} />,
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
                path: "documents",
                element: <OfficerDocumentsPage />,
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
                path: "admins/:adminId",
                element: <AdminAdminDetailPage />,
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
