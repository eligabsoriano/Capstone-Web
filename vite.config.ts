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
      "Content-Security-Policy":
        "default-src 'self' http://localhost:* http://host.docker.internal:* ws://localhost:* ws://host.docker.internal:* data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://host.docker.internal:*; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: http://localhost:* http://host.docker.internal:*; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http://localhost:* http://host.docker.internal:* ws://localhost:* ws://host.docker.internal:*; " +
        "frame-ancestors 'none'; object-src 'none'",
      "Cache-Control": "no-store, max-age=0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
