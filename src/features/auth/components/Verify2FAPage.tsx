import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuthStore } from '../store/authStore';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const verify2FASchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: '',
    },
  });

  // If no temp token, redirect to login
  if (!tempToken) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: Verify2FAFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual 2FA verification API call
      // For now, this is a placeholder that shows the structure
      // const response = await verify2FA({ temp_token: tempToken, code: data.code });
      
      // Simulate API call for now
      console.log('2FA verification:', { tempToken, code: data.code });
      
      // On success, the API would return tokens and user data
      // handleLoginSuccess(response.data);
      
      setError('2FA verification not yet implemented. Please contact administrator.');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTempToken(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
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
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                autoComplete="one-time-code"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                disabled={isLoading}
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-red-500 text-center">{errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
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
            Can't access your authenticator?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setError('Backup code feature coming soon')}
            >
              Use backup code
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
