const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Resolve backend media paths to absolute URLs so they open correctly from Vite routes.
 */
export function resolveMediaUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return "";

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    return `${API_BASE_URL.replace(/\/+$/, "")}${fileUrl}`;
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}/${fileUrl}`;
}
