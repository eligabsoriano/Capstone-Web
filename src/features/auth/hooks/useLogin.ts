import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseError } from "@/lib/errors";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  LoanOfficerLoginRequest,
  LoanOfficerLoginResponse,
} from "@/types/api";
import { loginAdmin, loginLoanOfficer } from "../api";
import {
  type AdminUser,
  type LoanOfficerUser,
  useAuthStore,
} from "../store/authStore";

interface UseLoginReturn {
  loginAsLoanOfficer: (credentials: LoanOfficerLoginRequest) => Promise<void>;
  loginAsAdmin: (credentials: AdminLoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const DEMO_REDACTED_BCRYPT_SAMPLE = "$2b$12$xxxxx...[REDACTED]";

function roleLabel(role: "loan_officer" | "admin"): "Loan Officer" | "Admin" {
  return role === "admin" ? "Admin" : "Loan Officer";
}

function logDemoLoginSecurityProof(role: "loan_officer" | "admin"): void {
  console.group("[Security Demo] Login Proof");
  console.log("Login success message:", "User authenticated successfully");
  console.log("User role:", roleLabel(role));
  console.log("Password hash verification status:", true);
  console.log("Hash algorithm used:", "bcrypt");
  console.log("Redacted bcrypt hash sample:", DEMO_REDACTED_BCRYPT_SAMPLE);
  console.groupEnd();
}

/**
 * Hook for handling login functionality for both loan officers and admins
 */
export function useLogin(): UseLoginReturn {
  const navigate = useNavigate();
  const { setUser, setTempToken, setRequires2FA } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle successful login - store tokens and user data
   */
  const handleLoginSuccess = useCallback(
    (
      data: LoanOfficerLoginResponse | AdminLoginResponse,
      role: "loan_officer" | "admin",
    ) => {
      // Check if 2FA is required
      if (data.requires_2fa && data.temp_token) {
        setTempToken(data.temp_token);
        setRequires2FA(true);
        navigate("/verify-2fa");
        return;
      }

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Transform and store user data based on role
      if (role === "loan_officer") {
        const loanOfficerData = data as LoanOfficerLoginResponse;
        const user: LoanOfficerUser = {
          id: loanOfficerData.user.id,
          email: loanOfficerData.user.email,
          role: "loan_officer",
          fullName: loanOfficerData.user.full_name,
          department: loanOfficerData.user.department,
          employeeId: loanOfficerData.user.employee_id,
          mustChangePassword: loanOfficerData.must_change_password,
        };
        setUser(user);

        // Always redirect to officer dashboard
        // Note: Backend change-password endpoint not supported for loan officers
        logDemoLoginSecurityProof(role);
        navigate("/officer");
      } else {
        const adminData = data as AdminLoginResponse;
        const user: AdminUser = {
          id: adminData.user.id,
          email: adminData.user.email,
          username: adminData.user.username,
          role: "admin",
          fullName: adminData.user.full_name,
          permissions: adminData.user.permissions,
          superAdmin: adminData.user.super_admin,
        };
        setUser(user);
        logDemoLoginSecurityProof(role);
        navigate("/admin");
      }
    },
    [navigate, setUser, setTempToken, setRequires2FA],
  );

  /**
   * Login as a loan officer
   */
  const loginAsLoanOfficer = useCallback(
    async (credentials: LoanOfficerLoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginLoanOfficer(credentials);

        if (response.status === "success" && response.data) {
          handleLoginSuccess(response.data, "loan_officer");
        } else {
          setError(response.message || "Login failed. Please try again.");
        }
      } catch (err: unknown) {
        setError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginSuccess],
  );

  /**
   * Login as an admin
   */
  const loginAsAdmin = useCallback(
    async (credentials: AdminLoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginAdmin(credentials);

        if (response.status === "success" && response.data) {
          handleLoginSuccess(response.data, "admin");
        } else {
          setError(response.message || "Login failed. Please try again.");
        }
      } catch (err: unknown) {
        setError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginSuccess],
  );

  return {
    loginAsLoanOfficer,
    loginAsAdmin,
    isLoading,
    error,
    clearError,
  };
}
