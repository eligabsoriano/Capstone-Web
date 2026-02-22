/**
 * Extract seconds remaining from a throttle/rate-limit message.
 * Handles both DRF default ("Expected available in 59 seconds.")
 * and custom backend ("Please try again in 30 seconds.") formats.
 */
function extractThrottleSeconds(text: string): number | null {
  const match = text.match(/(\d+)\s*seconds?/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

/**
 * Format seconds into a human-readable wait time string.
 */
function formatWaitTime(totalSeconds: number): string {
  if (totalSeconds >= 60) {
    const minutes = Math.ceil(totalSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  return `${totalSeconds} second${totalSeconds !== 1 ? "s" : ""}`;
}

/**
 * Parse API errors into user-friendly messages
 */
export function parseError(err: unknown): string {
  const axiosError = err as {
    config?: {
      url?: string;
    };
    response?: {
      data?: {
        message?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
      status?: number;
    };
  };
  const requestUrl = axiosError?.config?.url || "";
  const isLoginRequest = [
    "/api/auth/login/",
    "/api/auth/loan-officer/login/",
    "/api/auth/admin/login/",
  ].some((path) => requestUrl.includes(path));
  const status = axiosError?.response?.status;

  // Enforce generic auth failures for login endpoints to prevent user enumeration.
  if (isLoginRequest && status === 429) {
    return "Too many login attempts. Please try again later.";
  }
  if (isLoginRequest && [401, 403, 404, 423].includes(status ?? 0)) {
    return "Invalid credentials. Please check your email/username and password.";
  }

  // Handle field-specific validation errors
  if (axiosError?.response?.data?.errors) {
    const errors = axiosError.response.data.errors;
    const errorMessages: string[] = [];

    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        // Format field name (convert snake_case to Title Case)
        const fieldName = field
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        errorMessages.push(`${fieldName}: ${messages[0]}`);
      }
    }

    if (errorMessages.length > 0) {
      return errorMessages.join(". ");
    }
  }

  // First try backend message
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // Handle rate limiting (429)
  if (status === 429) {
    const detail =
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.message ||
      "";
    const seconds = extractThrottleSeconds(detail);
    if (seconds) {
      return `Too many requests. Please try again in ${formatWaitTime(seconds)}.`;
    }
    return "Too many requests. Please wait a few minutes before trying again.";
  }

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
