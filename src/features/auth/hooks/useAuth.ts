import { useAuthStore, type User, type LoanOfficerUser, type AdminUser, type UserRole } from '../store/authStore';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoanOfficer: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  requires2FA: boolean;
  tempToken: string | null;
}

/**
 * Hook for accessing auth state and user information
 */
export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, requires2FA, tempToken } = useAuthStore();

  const role = user?.role ?? null;
  const isLoanOfficer = role === 'loan_officer';
  const isAdmin = role === 'admin';

  // Check if user is super admin (admins with all permissions)
  const isSuperAdmin = isAdmin && (user as AdminUser)?.superAdmin === true;

  /**
   * Check if the user has a specific permission
   * Super admins have all permissions (their permissions array contains '*')
   */
  const hasPermission = (permission: string): boolean => {
    if (!isAdmin || !user) return false;
    
    const adminUser = user as AdminUser;
    
    // Super admin has all permissions
    if (adminUser.superAdmin || adminUser.permissions.includes('*')) {
      return true;
    }
    
    return adminUser.permissions.includes(permission);
  };

  return {
    user,
    isAuthenticated,
    role,
    isLoanOfficer,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    requires2FA,
    tempToken,
  };
}

// Re-export types for convenience
export type { User, LoanOfficerUser, AdminUser, UserRole };
