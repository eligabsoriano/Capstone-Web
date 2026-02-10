import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type UserRole, useAuth } from "../hooks";

// ============================================================================
// PROTECTED ROUTE - Requires authentication
// ============================================================================

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard that requires the user to be authenticated.
 * Redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, requires2FA } = useAuth();
  const location = useLocation();

  // If 2FA is required, redirect to 2FA verification
  if (requires2FA) {
    return <Navigate to="/verify-2fa" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children or Outlet for nested routes
  return children ? children : <Outlet />;
}

// ============================================================================
// REQUIRE ROLE - Requires specific role(s)
// ============================================================================

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Route guard that requires the user to have one of the allowed roles.
 * Must be used inside a ProtectedRoute.
 */
export function RequireRole({
  allowedRoles,
  children,
  fallbackPath = "/",
}: RequireRoleProps) {
  const { role, isAuthenticated } = useAuth();

  // If not authenticated, ProtectedRoute should handle this
  // but we add this check for safety
  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}

// ============================================================================
// GUEST ONLY ROUTE - Only for non-authenticated users
// ============================================================================

interface GuestOnlyRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard that only allows non-authenticated users.
 * Redirects to home if already authenticated.
 */
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the intended destination from state, or default to home
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children ? children : <Outlet />;
}

// ============================================================================
// REQUIRE PERMISSION - Requires specific permission (Admin only)
// ============================================================================

interface RequirePermissionProps {
  permission: string;
  children?: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Route guard that requires the admin user to have a specific permission.
 * Super admins automatically have all permissions.
 */
export function RequirePermission({
  permission,
  children,
  fallbackPath = "/admin",
}: RequirePermissionProps) {
  const { isAdmin, hasPermission } = useAuth();

  // Only admins can have permissions
  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has the required permission
  if (!hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}

// ============================================================================
// REQUIRE SUPER ADMIN - Only for super admins
// ============================================================================

interface RequireSuperAdminProps {
  children?: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Route guard that requires the user to be a super admin.
 */
export function RequireSuperAdmin({
  children,
  fallbackPath = "/admin",
}: RequireSuperAdminProps) {
  const { isSuperAdmin, isAdmin } = useAuth();

  // Must be an admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Must be a super admin
  if (!isSuperAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}
