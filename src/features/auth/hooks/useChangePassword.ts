import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseError } from "@/lib/errors";
import { changePassword } from "../api";
import { useAuthStore } from "../store/authStore";

interface UseChangePasswordReturn {
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
}

/**
 * Hook for handling password change functionality
 */
export function useChangePassword(): UseChangePasswordReturn {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleChangePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });

        if (response.status === "success") {
          setSuccess(true);

          // Wait briefly to show success message, then redirect
          setTimeout(() => {
            // Redirect to appropriate dashboard based on role
            if (user?.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/officer");
            }
          }, 1500);
        } else {
          setError(
            response.message || "Failed to change password. Please try again.",
          );
        }
      } catch (err: unknown) {
        setError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, user?.role],
  );

  return {
    changePassword: handleChangePassword,
    isLoading,
    error,
    success,
    clearError,
  };
}
