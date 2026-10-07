import { useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { requestTokenRefresh } from "../lib/api";

let initPromise: Promise<void> | null = null;

export function useAuthInit() {
  const { setAuth, logout, accessToken, refreshToken } = useAuthStore();

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

        // 1. If we have an accessToken, verify with /me first
        if (storedToken) {
          try {
            const meController = new AbortController();
            const meTimeout = setTimeout(() => meController.abort(), 4000);

            const meRes = await fetch("/api/v1/auth/me", {
              headers: { Authorization: `Bearer ${storedToken}` },
              signal: meController.signal,
            });
            clearTimeout(meTimeout);

            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.success && meData.data) {
                setAuth(meData.data, storedToken, storedRefreshToken);
                useAuthStore.getState().setLoading(false);
                return;
              }
            } else if (meRes.status === 403) {
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
            // Network issue or timeout; keep current session if user state exists
            if (useAuthStore.getState().user) {
              useAuthStore.getState().setLoading(false);
              return;
            }
          }
        }

        // 2. If access token is missing or expired, attempt single-flight refresh
        if (storedRefreshToken) {
          try {
            const refreshRes = await requestTokenRefresh();
            if (refreshRes.success) {
              const newAccessToken = refreshRes.accessToken;
              const meRes = await fetch("/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });

              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData.success && meData.data) {
                  const currentRefreshToken = useAuthStore.getState().refreshToken || storedRefreshToken;
                  setAuth(meData.data, newAccessToken, currentRefreshToken);
                  useAuthStore.getState().setLoading(false);
                  return;
                }
              }
            } else if (refreshRes.reason === 'unauthorized') {
              // Only if server explicitly rejects refresh token, log out
              logout();
              return;
            }
          } catch {
            // Network error: maintain offline state without logout
          }
        }

        useAuthStore.getState().setLoading(false);
      })();

      await initPromise;
      initPromise = null;
    };

    // Run auth initialization immediately
    initAuth();

    // 3. Proactive session validation on window focus / mobile tab resume
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentToken = useAuthStore.getState().accessToken || localStorage.getItem('gencsosyal_token');
        const currentRefreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('gencsosyal_refresh_token');
        
        if (currentToken) {
          fetch("/api/v1/auth/me", {
            headers: { Authorization: `Bearer ${currentToken}` }
          }).then(async (res) => {
            if (res.status === 401 && currentRefreshToken) {
              // Silently refresh token in background
              const refreshed = await requestTokenRefresh();
              if (refreshed.success) {
                const meRes = await fetch("/api/v1/auth/me", {
                  headers: { Authorization: `Bearer ${refreshed.accessToken}` }
                });
                if (meRes.ok) {
                  const meData = await meRes.json();
                  if (meData.success && meData.data) {
                    useAuthStore.getState().setAuth(meData.data, refreshed.accessToken, currentRefreshToken);
                  }
                }
              }
            } else if (res.ok) {
              const meData = await res.json();
              if (meData.success && meData.data) {
                useAuthStore.getState().setUser(meData.data);
              }
            }
          }).catch(() => {
            // Network glitch on resume: do not disturb user session
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);
}
