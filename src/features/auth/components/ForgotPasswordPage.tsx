import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
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
import { forgotPassword, resetPassword, verifyResetOTP } from "../api";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const resetSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

type Step = "email" | "otp" | "reset" | "success";

// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ============================================================================
  // STEP 1: EMAIL SUBMISSION
  // ============================================================================

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await forgotPassword({ email: data.email });
      if (response.status === "success") {
        setEmail(data.email);
        setSuccess("A 6-digit OTP has been sent to your email");
        setStep("otp");
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // STEP 2: OTP VERIFICATION
  // ============================================================================

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const handleOTPSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyResetOTP({ email, otp: data.otp });
      if (response.status === "success") {
        setOtp(data.otp);
        setSuccess("OTP verified! Set your new password.");
        setStep("reset");
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // STEP 3: NEW PASSWORD
  // ============================================================================

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const handleResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await resetPassword({
        email,
        otp,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      if (response.status === "success") {
        setStep("success");
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {step === "success" ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <KeyRound className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
            {step === "success" && "Password Reset!"}
          </CardTitle>
          <CardDescription>
            {step === "email" &&
              "Enter your email address and we'll send you a verification code"}
            {step === "otp" && `Enter the 6-digit code sent to ${email}`}
            {step === "reset" && "Choose a new password for your account"}
            {step === "success" && "Your password has been reset successfully"}
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

          {/* Success Alert */}
          {success && step !== "success" && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Email */}
          {step === "email" && (
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form
              onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  {...otpForm.register("otp")}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-500 text-center">
                    {otpForm.formState.errors.otp.message}
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
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setSuccess(null);
                }}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Use Different Email
              </Button>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === "reset" && (
            <form
              onSubmit={resetForm.handleSubmit(handleResetSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  disabled={isLoading}
                  {...resetForm.register("new_password")}
                />
                {resetForm.formState.errors.new_password && (
                  <p className="text-sm text-red-500">
                    {resetForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  {...resetForm.register("confirm_password")}
                />
                {resetForm.formState.errors.confirm_password && (
                  <p className="text-sm text-red-500">
                    {resetForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <Check className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm text-green-700">
                  Your password has been changed. You can now sign in with your
                  new password.
                </p>
              </div>

              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
