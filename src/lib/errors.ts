/**
 * Parse API errors into user-friendly messages
 */
export function parseError(err: unknown): string {
  const axiosError = err as {
    response?: { data?: { message?: string }; status?: number };
  };

  // First try backend message
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // Map status codes
  const status = axiosError?.response?.status;
  if (status === 401) {
    return "Invalid credentials. Please check your email/username and password.";
  }
  if (status === 403) {
    return "Your account has been locked or deactivated. Please contact an administrator.";
  }
  if (status === 404) {
    return "Account not found. Please check your credentials.";
  }
  if (status === 500) {
    return "Server error. Please try again later.";
  }

  // Map technical messages
  const message = err instanceof Error ? err.message : String(err);
  const friendlyMessages: Record<string, string> = {
    "No refresh token available":
      "Your session has expired. Please log in again.",
    "Network Error":
      "Unable to connect to the server. Please check your internet connection.",
    "Request failed with status code 401":
      "Invalid credentials. Please try again.",
    "Request failed with status code 403":
      "Access denied. Please contact an administrator.",
    "Request failed with status code 500":
      "Server error. Please try again later.",
  };

  for (const [key, value] of Object.entries(friendlyMessages)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return "An error occurred. Please try again.";
}
