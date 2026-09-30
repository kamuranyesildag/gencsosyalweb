import { useEffect } from "react";
import { useAuthStore } from "../context/useAuth";

let initPromise: Promise<void> | null = null;

export function useAuthInit() {
  const { setAuth, logout, isAuthenticated, isLoading, accessToken, refreshToken } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Safety timer: ensure loading state never hangs
    const safetyTimer = setTimeout(() => {
      if (mounted && useAuthStore.getState().isLoading) {
        useAuthStore.getState().setLoading(false);
      }
    }, 4000);

    const initAuth = async () => {
      if (initPromise) {
        await initPromise;
        return;
      }

      initPromise = (async () => {
        const storedRefreshToken = refreshToken || localStorage.getItem('gencsosyal_refresh_token');
        const storedToken = accessToken || localStorage.getItem('gencsosyal_token');

        // 1. If we already have an accessToken, verify if it's still valid with /me
        if (storedToken) {
          try {
            const meController = new AbortController();
            const meTimeout = setTimeout(() => meController.abort(), 3500);

            const meRes = await fetch("/api/v1/auth/me", {
              headers: { Authorization: `Bearer ${storedToken}` },
              signal: meController.signal,
            });
            clearTimeout(meTimeout);

            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.success && meData.data) {
                setAuth(meData.data, storedToken, storedRefreshToken);
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
          } catch (e) {
            // Network issue or timeout; keep current session if user exists
            if (useAuthStore.getState().user) {
              useAuthStore.getState().setLoading(false);
              return;
            }
          }
        }

        // 2. Try to refresh access token using both cookie and storedRefreshToken (for iframe compatibility)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const refreshRes = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(storedRefreshToken ? { "x-refresh-token": storedRefreshToken } : {}),
            },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              const newAccessToken = refreshData.data.accessToken;
              const newRefreshToken = refreshData.data.refreshToken || storedRefreshToken;

              // Fetch updated user profile
              const meRes = await fetch("/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });

              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData.success && meData.data) {
                  setAuth(meData.data, newAccessToken, newRefreshToken);
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
            // Only if explicitly 401 and no valid session, logout
            if (refreshRes.status === 401 && !storedToken) {
              logout();
              return;
            }
          }
        } catch {
          // Network issue
        }

        useAuthStore.getState().setLoading(false);
      })();

      await initPromise;
      initPromise = null;
    };

    // Run auth initialization
    initAuth();

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);
}
