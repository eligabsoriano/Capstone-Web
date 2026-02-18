import { onlineManager } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getInitialOnlineStatus(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine;
}

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);
  const [showRecovered, setShowRecovered] = useState(false);
  const hideRecoveredTimerRef = useRef<number | null>(null);
  const wasOfflineRef = useRef(!getInitialOnlineStatus());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onlineManager.setOnline(true);

      if (wasOfflineRef.current) {
        setShowRecovered(true);
      }
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRecovered(false);
      wasOfflineRef.current = true;
      onlineManager.setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync Query online state on mount.
    onlineManager.setOnline(getInitialOnlineStatus());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!showRecovered) {
      return;
    }

    hideRecoveredTimerRef.current = window.setTimeout(() => {
      setShowRecovered(false);
    }, 3000);

    return () => {
      if (hideRecoveredTimerRef.current !== null) {
        window.clearTimeout(hideRecoveredTimerRef.current);
      }
    };
  }, [showRecovered]);

  if (isOnline && !showRecovered) {
    return null;
  }

  const isOffline = !isOnline;
  return (
    <div className="fixed inset-x-0 top-0 z-[70] px-4 pt-3">
      <output
        aria-live="polite"
        className={[
          "mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm",
          isOffline
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-emerald-600/20 bg-emerald-100 text-emerald-800",
        ].join(" ")}
      >
        {isOffline ? (
          <WifiOff className="h-4 w-4 shrink-0" />
        ) : (
          <Wifi className="h-4 w-4 shrink-0" />
        )}
        <span>
          {isOffline
            ? "You are offline. Some actions may not work until your connection is restored."
            : "Connection restored. Data will sync automatically."}
        </span>
      </output>
    </div>
  );
}
