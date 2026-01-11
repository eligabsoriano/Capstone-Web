import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  LoginPage,
  Verify2FAPage,
  ProtectedRoute,
  GuestOnlyRoute,
  RequireRole,
} from '@/features/auth/components';

// Placeholder pages - replace with actual implementations
const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the MSME Loan Portal</p>
    </div>
  </div>
);

const LoanOfficerDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Loan Officer Dashboard</h1>
    <p className="text-muted-foreground">Review and manage loan applications</p>
  </div>
);

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p className="text-muted-foreground">System administration and analytics</p>
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

export const router = createBrowserRouter([
  // ============================================================================
  // PUBLIC ROUTES (Guest only)
  // ============================================================================
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/verify-2fa',
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
      // Dashboard - redirects based on role
      {
        path: '/',
        element: <DashboardLayout />,
      },

      // Change password (for loan officers on first login)
      {
        path: '/change-password',
        element: <ChangePasswordPage />,
      },

      // ========================================================================
      // LOAN OFFICER ROUTES
      // ========================================================================
      {
        element: <RequireRole allowedRoles={['loan_officer', 'admin']} />,
        children: [
          {
            path: '/officer',
            element: <LoanOfficerDashboard />,
          },
          // Add more loan officer routes here
        ],
      },

      // ========================================================================
      // ADMIN ONLY ROUTES
      // ========================================================================
      {
        element: <RequireRole allowedRoles={['admin']} />,
        children: [
          {
            path: '/admin',
            element: <AdminDashboard />,
          },
          // Add more admin routes here
        ],
      },
    ],
  },

  // ============================================================================
  // CATCH-ALL - Redirect to home
  // ============================================================================
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
