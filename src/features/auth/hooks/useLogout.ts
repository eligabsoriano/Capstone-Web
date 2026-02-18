import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import { useAuthStore } from "../store/authStore";

interface UseLogoutReturn {
  handleLogout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for handling logout functionality
 */
export function useLogout(): UseLogoutReturn {
  const navigate = useNavigate();
  const { user, logout: clearAuthState } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call logout API if we have a user role.
      if (user?.role) {
        await logout(user.role);
      }
    } catch (err) {
      // Log error but don't prevent logout
      console.error("Logout API error:", err);
    } finally {
      // Always clear local state regardless of API success
      clearAuthState();
      setIsLoading(false);
      navigate("/login");
    }
  }, [user?.role, clearAuthState, navigate]);

  return {
    handleLogout,
    isLoading,
    error,
  };
}
