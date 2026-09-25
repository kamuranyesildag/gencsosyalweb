import { useEffect } from "react";
import { useAuthStore } from "../context/useAuth";

let initPromise: Promise<void> | null = null;

export function useAuthInit() {
  const { setAuth, logout, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Safety timeout: Never leave the app stuck in loading state for more than 5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && useAuthStore.getState().isLoading) {
        logout();
      }
    }, 5000);

    const initAuth = async () => {
      if (initPromise) {
        await initPromise;
        return;
      }

      initPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
          // 1. Try to refresh access token using httpOnly cookie with timeout
          const refreshRes = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            signal: controller.signal,
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              const token = refreshData.data.accessToken;

              // 2. Fetch authenticated user profile
              const meController = new AbortController();
              const meTimeoutId = setTimeout(() => meController.abort(), 4000);

              const meRes = await fetch("/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
                signal: meController.signal,
              });
              clearTimeout(meTimeoutId);

              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData.success && meData.data) {
                  setAuth(meData.data, token);
                  return;
                }
              } else {
                const meErr = await meRes.json().catch(() => null);
                if (meErr?.error?.code === "ACCOUNT_SUSPENDED") {
                  useAuthStore.getState().setSuspension(meErr.error.suspension);
                  if (window.location.pathname !== "/account-suspended") {
                    window.location.href = "/account-suspended";
                  }
                  return;
                }
              }
            }
          } else {
            const refreshErr = await refreshRes.json().catch(() => null);
            if (refreshErr?.error?.code === "ACCOUNT_SUSPENDED") {
              useAuthStore.getState().setSuspension(refreshErr.error.suspension);
              if (window.location.pathname !== "/account-suspended") {
                window.location.href = "/account-suspended";
              }
              return;
            }
          }

          logout();
        } catch {
          // Network failure, timeout, or abort
          logout();
        } finally {
          clearTimeout(timeoutId);
        }
      })();

      await initPromise;
      initPromise = null;
    };

    if (!isAuthenticated && isLoading) {
      initAuth();
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, [isAuthenticated, isLoading, setAuth, logout]);
}
