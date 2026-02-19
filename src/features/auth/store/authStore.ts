import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "loan_officer";

// Base user fields shared by both roles
interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
}

// Loan Officer specific fields
export interface LoanOfficerUser extends BaseUser {
  role: "loan_officer";
  fullName: string;
  department: string;
  employeeId: string;
  mustChangePassword: boolean;
}

// Admin specific fields
export interface AdminUser extends BaseUser {
  role: "admin";
  username: string;
  fullName: string;
  permissions: string[];
  superAdmin: boolean;
}

export type User = LoanOfficerUser | AdminUser;

interface TwoFactorSetupState {
  required: boolean;
  provisioningUri?: string;
  manualEntryKey?: string;
  qrCodeDataUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tempToken: string | null; // For 2FA flow
  requires2FA: boolean;
  twoFactorSetup: TwoFactorSetupState | null;
  setUser: (user: User | null) => void;
  setTempToken: (token: string | null) => void;
  setRequires2FA: (requires: boolean) => void;
  setTwoFactorSetup: (setup: TwoFactorSetupState | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      tempToken: null,
      requires2FA: false,
      twoFactorSetup: null,
      // setUser also updates isAuthenticated
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          requires2FA: false,
          tempToken: null,
          twoFactorSetup: null,
        }),
      setTempToken: (tempToken) => set({ tempToken }),
      setRequires2FA: (requires2FA) => set({ requires2FA }),
      setTwoFactorSetup: (twoFactorSetup) => set({ twoFactorSetup }),
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({
          user: null,
          isAuthenticated: false,
          tempToken: null,
          requires2FA: false,
          twoFactorSetup: null,
        });
      },
    }),
    {
      name: "auth-storage",
      // Persist user - isAuthenticated will be derived on rehydration
      partialize: (state) => ({ user: state.user }),
      // On rehydration, set isAuthenticated based on user
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = state.user !== null;
        }
      },
    },
  ),
);
