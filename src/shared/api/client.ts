import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
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
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token/`,
        {
          refresh: refreshToken,
        },
      );

      const { access_token } = response.data.data;
      localStorage.setItem("access_token", access_token);

      // Process queued requests with new token
      processQueue(null, access_token);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear all auth data and redirect
      processQueue(refreshError as Error, null);

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
