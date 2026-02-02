import { ChangePasswordSettings } from "@/features/loan-officer/components/ChangePasswordSettings";
import { TwoFactorSettings } from "@/features/loan-officer/components/TwoFactorSettings";

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Two-Factor Authentication */}
        <TwoFactorSettings />

        {/* Change Password */}
        <ChangePasswordSettings />
      </div>
    </div>
  );
}
