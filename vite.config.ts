import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ["host.docker.internal"],
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-site",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Origin-Agent-Cluster": "?1",
      "Content-Security-Policy":
        "default-src 'self' http://localhost:* http://host.docker.internal:* ws://localhost:* ws://host.docker.internal:* data: blob:; " +
        "script-src 'self' http://localhost:* http://host.docker.internal:*; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: http://localhost:* http://host.docker.internal:*; " +
        "font-src 'self' data:; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-src 'none'; " +
        "manifest-src 'self'; " +
        "worker-src 'self' blob:; " +
        "connect-src 'self' http://localhost:* http://host.docker.internal:* ws://localhost:* ws://host.docker.internal:*; " +
        "frame-ancestors 'none'; object-src 'none'",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
