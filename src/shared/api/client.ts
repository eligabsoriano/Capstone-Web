import axios, { AxiosHeaders } from "axios";
import {
  CertificatePinMismatchError,
  validateServerPin,
} from "./certificatePinning";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CSRF_HEADER_NAME = "X-CSRFToken";
const CSRF_COOKIE_NAME = "csrftoken";
let csrfTokenCache: string | null = null;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function isUnsafeMethod(method?: string): boolean {
  const normalized = (method || "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(normalized);
}

async function ensureCsrfCookie(): Promise<void> {
  const existing = getCookie(CSRF_COOKIE_NAME);
  if (existing) {
    csrfTokenCache = existing;
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/csrf-token/`, {
      withCredentials: true,
    });

    const tokenFromBody = response?.data?.data?.csrf_token;
    if (typeof tokenFromBody === "string" && tokenFromBody.length > 0) {
      csrfTokenCache = tokenFromBody;
    }
  } catch {
    // Best effort; request interceptor will proceed and backend will reject if required.
  }
}

// Request interceptor - certificate pinning + CSRF token for unsafe requests.
apiClient.interceptors.request.use(
  async (config) => {
    // --- Certificate Pinning Validation ---
    // Validates the server's certificate pin on the first request.
    // Skips pin check for the server-pins endpoint itself (bootstrap).
    const requestUrl = config.url || "";
    const isServerPinsUrl = requestUrl.includes("/api/auth/server-pins/");

    if (!isServerPinsUrl) {
      try {
        await validateServerPin(API_BASE_URL);
      } catch (error) {
        if (error instanceof CertificatePinMismatchError) {
          console.error(
            `[Security] Certificate pin mismatch detected! Blocking request to ${requestUrl}`,
          );
          return Promise.reject(error);
        }
        // Non-pin errors are logged but don't block requests
        console.warn("[Certificate Pinning] Validation warning:", error);
      }
    }

    // --- CSRF Token ---
    if (isUnsafeMethod(config.method)) {
      await ensureCsrfCookie();
      const csrfToken = getCookie(CSRF_COOKIE_NAME) || csrfTokenCache;
      if (csrfToken) {
        const headers = AxiosHeaders.from(config.headers);
        headers.set(CSRF_HEADER_NAME, csrfToken);
        config.headers = headers;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// URLs that should NOT trigger token refresh on 401
// These are unauthenticated endpoints where a 401 means "invalid credentials",
// not "expired token". Also includes 2FA disable/backup which use password validation.
const AUTH_URLS = [
  "/api/auth/login/",
  "/api/auth/loan-officer/login/",
  "/api/auth/admin/login/",
  "/api/auth/2fa/verify/",
  "/api/auth/2fa/disable/",
  "/api/auth/2fa/backup-codes/",
  "/api/auth/forgot-password/",
  "/api/auth/verify-reset-otp/",
  "/api/auth/reset-password/",
  "/api/auth/csrf-token/",
];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthUrl = AUTH_URLS.some((url) => requestUrl.includes(url));

    // If error is not 401, request already retried, or it's an auth endpoint, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry || isAuthUrl) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await ensureCsrfCookie();
      const csrfToken = getCookie(CSRF_COOKIE_NAME) || csrfTokenCache;
      const headers = csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : undefined;

      await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token/`,
        {},
        {
          withCredentials: true,
          headers,
        },
      );

      // Process queued requests with new token
      processQueue(null);

      // Retry original request; cookies now contain the latest token pair.
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear all auth data and redirect
      processQueue(refreshError);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Clear auth store
      try {
        const { useAuthStore } = await import(
          "@/features/auth/store/authStore"
        );
        useAuthStore.getState().logout();
      } catch (e) {
        console.error("Failed to clear auth store:", e);
      }

      // Redirect to login
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
