import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import {
  confirm2FASetup,
  disable2FA,
  generateBackupCodes,
  get2FAStatus,
  setup2FA,
} from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { parseError } from "@/lib/errors";

// ============================================================================
// TYPES
// ============================================================================

type SetupStep =
  | "idle"
  | "loading"
  | "qr-display"
  | "confirming"
  | "disabling"
  | "backup-codes";

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface SetupData {
  provisioningUri: string;
  manualEntryKey: string;
  qrCodeDataUrl?: string;
}

// ============================================================================
// TWO FACTOR SETTINGS COMPONENT
// ============================================================================

export function TwoFactorSettings() {
  const currentUser = useAuthStore((state) => state.user);
  const isAdminUser = currentUser?.role === "admin";
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [step, setStep] = useState<SetupStep>("idle");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch 2FA status on mount
  const fetchStatus = useCallback(async () => {
    try {
      const response = await get2FAStatus();
      if (response.status === "success" && response.data) {
        setStatus({
          enabled: response.data.two_factor_enabled,
          backupCodesRemaining: response.data.backup_codes_remaining,
        });
      } else {
        // Set default status on non-success response
        setStatus({ enabled: false, backupCodesRemaining: 0 });
        setError(response.message || "Failed to fetch 2FA status");
      }
    } catch (err) {
      // Set default status on error so component renders
      setStatus({ enabled: false, backupCodesRemaining: 0 });
      setError(parseError(err));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStartSetup = async () => {
    setStep("loading");
    setIsProcessing(true);
    setError(null);

    try {
      const response = await setup2FA();
      if (response.status === "success" && response.data) {
        setSetupData({
          provisioningUri: response.data.provisioning_uri,
          manualEntryKey: response.data.manual_entry_key,
          qrCodeDataUrl: response.data.qr_code_data_url,
        });
        setStep("qr-display");
      } else {
        throw new Error(response.message || "Failed to setup 2FA");
      }
    } catch (err) {
      setError(parseError(err));
      setStep("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setStep("confirming");
    setIsProcessing(true);
    setError(null);

    try {
      const response = await confirm2FASetup({ code });
      if (response.status === "success" && response.data) {
        setSuccess("Two-factor authentication has been enabled!");
        setStatus({ enabled: true, backupCodesRemaining: 10 });
        // Show backup codes if returned
        if (
          response.data.backup_codes &&
          response.data.backup_codes.length > 0
        ) {
          setBackupCodes(response.data.backup_codes);
          setStep("backup-codes");
        } else {
          setStep("idle");
        }
        setSetupData(null);
        setCode("");
      } else {
        throw new Error(response.message || "Invalid code");
      }
    } catch (err) {
      setError(parseError(err));
      setStep("qr-display");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setStep("disabling");
    setIsProcessing(true);
    setError(null);

    try {
      const response = await disable2FA({ password });
      if (response.status === "success") {
        setSuccess("Two-factor authentication has been disabled");
        setStatus({ enabled: false, backupCodesRemaining: 0 });
        setStep("idle");
        setPassword("");
      } else {
        throw new Error(response.message || "Failed to disable 2FA");
      }
    } catch (err) {
      setError(parseError(err));
      setStep("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setStep("loading");
    setIsProcessing(true);
    setError(null);

    try {
      const response = await generateBackupCodes({ password });
      if (response.status === "success" && response.data) {
        setBackupCodes(response.data.backup_codes);
        setStep("backup-codes");
        setPassword("");
        await fetchStatus(); // Refresh status to update backup codes count
      } else {
        throw new Error(response.message || "Failed to generate backup codes");
      }
    } catch (err) {
      setError(parseError(err));
      setStep("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyKey = async () => {
    if (setupData?.manualEntryKey) {
      await navigator.clipboard.writeText(setupData.manualEntryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBackupCodes = async () => {
    const codesText = backupCodes.join("\n");
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    setStep("idle");
    setSetupData(null);
    setBackupCodes([]);
    setCode("");
    setPassword("");
    setError(null);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${status.enabled ? "bg-green-100" : "bg-gray-100"}`}
          >
            {status.enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {status.enabled
                ? "Your account is protected with 2FA"
                : "Add an extra layer of security to your account"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* IDLE STATE - 2FA Disabled */}
        {step === "idle" && !status.enabled && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an additional layer of security to
              your account by requiring a code from your authenticator app when
              signing in.
            </p>
            {isAdminUser && (
              <p className="text-sm font-medium text-amber-700">
                2FA is mandatory for administrator accounts.
              </p>
            )}
            <Button onClick={handleStartSetup}>
              <Shield className="mr-2 h-4 w-4" />
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {/* IDLE STATE - 2FA Enabled */}
        {step === "idle" && status.enabled && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-700">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-medium">2FA is enabled</span>
              </div>
              <p className="mt-1 text-sm text-green-600">
                Backup codes remaining: {status.backupCodesRemaining}
              </p>
              {isAdminUser && (
                <p className="mt-1 text-xs text-green-700">
                  2FA cannot be disabled for administrator accounts.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="backup-password" className="text-sm">
                  Enter password to manage 2FA
                </Label>
                <Input
                  id="backup-password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateBackupCodes}
                disabled={!password || isProcessing}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Generate New Backup Codes
              </Button>
              {!isAdminUser && (
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={!password || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="mr-2 h-4 w-4" />
                  )}
                  Disable 2FA
                </Button>
              )}
            </div>
          </div>
        )}

        {/* QR CODE DISPLAY STATE */}
        {step === "qr-display" && setupData && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              {setupData.qrCodeDataUrl ? (
                <div className="inline-block rounded-lg border bg-white p-4">
                  <img
                    src={setupData.qrCodeDataUrl}
                    alt="2FA QR Code"
                    className="h-48 w-48"
                  />
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    QR image is unavailable. Use the manual setup key below.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="rounded-lg border bg-muted/50 p-3">
              <Label className="text-xs text-muted-foreground">
                Can't scan? Enter this key manually:
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1 font-mono text-sm">
                  {setupData.manualEntryKey}
                </code>
                <Button size="sm" variant="ghost" onClick={handleCopyKey}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">
                Enter the 6-digit code from your app
              </Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSetup}
                disabled={code.length !== 6 || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {/* BACKUP CODES DISPLAY */}
        {step === "backup-codes" && backupCodes.length > 0 && (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Save these backup codes in a secure location. Each code can only
                be used once.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
              {backupCodes.map((backupCode) => (
                <code
                  key={backupCode}
                  className="rounded bg-background px-3 py-2 text-center font-mono text-sm"
                >
                  {backupCode}
                </code>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyBackupCodes}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Codes
                  </>
                )}
              </Button>
              <Button onClick={handleCancel}>Done</Button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {step === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
