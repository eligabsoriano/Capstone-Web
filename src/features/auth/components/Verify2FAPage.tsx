import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { parseError } from "@/lib/errors";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "../store/authStore";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const verify2FASchema = z.object({
  code: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(10, "Code is too long"),
});

type Verify2FAFormData = z.infer<typeof verify2FASchema>;

// ============================================================================
// 2FA VERIFICATION PAGE
// ============================================================================

export function Verify2FAPage() {
  const navigate = useNavigate();
  const { tempToken, setRequires2FA, setTempToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: "",
    },
  });

  // If no temp token, redirect to login
  if (!tempToken) {
    navigate("/login");
    return null;
  }

  const onSubmit = async (data: Verify2FAFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/2fa/verify/", {
        temp_token: tempToken,
        code: data.code,
        use_backup: useBackupCode,
      });

      const result = response.data;

      if (result.status === "success" && result.data) {
        // Store tokens - backend returns 'access' and 'refresh'
        localStorage.setItem("access_token", result.data.access);
        localStorage.setItem("refresh_token", result.data.refresh);

        // Determine user role and create user object
        const userData = result.data.user;
        let user: import("../store/authStore").User;

        if ("employee_id" in userData) {
          // Loan Officer
          user = {
            id: userData.id,
            email: userData.email,
            role: "loan_officer" as const,
            fullName: userData.full_name,
            department: userData.department,
            employeeId: userData.employee_id,
            mustChangePassword: false,
          };
        } else {
          // Admin
          user = {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            role: "admin" as const,
            fullName: userData.full_name,
            permissions: userData.permissions,
            superAdmin: userData.super_admin,
          };
        }

        // Update auth store
        const { setUser } = await import("../store/authStore").then((m) => ({
          setUser: m.useAuthStore.getState().setUser,
        }));
        setUser(user);
        setRequires2FA(false);
        setTempToken(null);

        // Redirect based on role
        navigate(user.role === "admin" ? "/admin" : "/officer");
      } else {
        setError(result.message || "Invalid verification code");
      }
    } catch (err: unknown) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTempToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                {useBackupCode ? "Backup Code" : "Verification Code"}
              </Label>
              <Input
                id="code"
                type="text"
                inputMode={useBackupCode ? "text" : "numeric"}
                placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                autoComplete="one-time-code"
                maxLength={useBackupCode ? 10 : 6}
                className="text-center text-2xl tracking-widest"
                disabled={isLoading}
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-red-500 text-center">
                  {errors.code.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBackToLogin}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {useBackupCode ? (
              <>
                Have your authenticator?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setUseBackupCode(false)}
                >
                  Use authenticator code
                </button>
              </>
            ) : (
              <>
                Can't access your authenticator?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setUseBackupCode(true)}
                >
                  Use backup code
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
