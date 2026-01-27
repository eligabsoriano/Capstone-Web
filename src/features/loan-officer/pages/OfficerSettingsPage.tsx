import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type LoanOfficerUser,
  useAuthStore,
} from "@/features/auth/store/authStore";
import { ChangePasswordSettings, TwoFactorSettings } from "../components";

export function OfficerSettingsPage() {
  const { user } = useAuthStore();
  const officerUser = user as LoanOfficerUser | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500">Your account and security preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Full Name
              </dt>
              <dd className="mt-1 text-sm">{officerUser?.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-sm">{officerUser?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Employee ID
              </dt>
              <dd className="mt-1 text-sm">{officerUser?.employeeId || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Department
              </dt>
              <dd className="mt-1 text-sm">{officerUser?.department || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Settings */}
      <TwoFactorSettings />

      {/* Change Password */}
      <ChangePasswordSettings />
    </div>
  );
}
