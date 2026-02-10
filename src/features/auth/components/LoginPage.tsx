import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useLogin } from "../hooks";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const loanOfficerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean().optional(),
});

const adminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoanOfficerFormData = z.infer<typeof loanOfficerSchema>;
type AdminFormData = z.infer<typeof adminSchema>;

// ============================================================================
// LOGIN PAGE COMPONENT
// ============================================================================

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<"loan_officer" | "admin">(
    "loan_officer",
  );
  const { loginAsLoanOfficer, loginAsAdmin, isLoading, error, clearError } =
    useLogin();

  // Handle tab change - clear any existing errors
  const handleTabChange = (value: string) => {
    setActiveTab(value as "loan_officer" | "admin");
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">MSME Loan Portal</CardTitle>
          <CardDescription>
            Sign in to access the loan management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="loan_officer"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Loan Officer
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="loan_officer">
              <LoanOfficerLoginForm
                onSubmit={loginAsLoanOfficer}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="admin">
              <AdminLoginForm onSubmit={loginAsAdmin} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LOAN OFFICER LOGIN FORM
// ============================================================================

interface LoanOfficerLoginFormProps {
  onSubmit: (data: LoanOfficerFormData) => Promise<void>;
  isLoading: boolean;
}

function LoanOfficerLoginForm({
  onSubmit,
  isLoading,
}: LoanOfficerLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoanOfficerFormData>({
    resolver: zodResolver(loanOfficerSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="officer-email">Email</Label>
        <Input
          id="officer-email"
          type="email"
          placeholder="officer@company.com"
          autoComplete="email"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="officer-password">Password</Label>
        <div className="relative">
          <Input
            id="officer-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="remember-me"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          disabled={isLoading}
          {...register("remember_me")}
        />
        <Label htmlFor="remember-me" className="text-sm font-normal">
          Remember me for 3 days
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in as Loan Officer"
        )}
      </Button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}

// ============================================================================
// ADMIN LOGIN FORM
// ============================================================================

interface AdminLoginFormProps {
  onSubmit: (data: AdminFormData) => Promise<void>;
  isLoading: boolean;
}

function AdminLoginForm({ onSubmit, isLoading }: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-username">Username</Label>
        <Input
          id="admin-username"
          type="text"
          placeholder="admin"
          autoComplete="username"
          disabled={isLoading}
          {...register("username")}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in as Admin"
        )}
      </Button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
