import { useEffect } from "react";
import { useAuthStore, sanitizeToken, isJwtExpired } from "../context/useAuth";
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
        const storedRefreshToken =
          sanitizeToken(refreshToken) ||
          sanitizeToken(localStorage.getItem('gencsosyal_refresh_token'));
        const rawStoredToken =
          sanitizeToken(accessToken) ||
          sanitizeToken(localStorage.getItem('gencsosyal_token'));
        const storedToken = rawStoredToken && !isJwtExpired(rawStoredToken) ? rawStoredToken : null;

        let needsRefresh = Boolean(!storedToken && (rawStoredToken || storedRefreshToken || useAuthStore.getState().isAuthenticated));

        // 1. If we have a non-expired accessToken, verify with /me first
        if (storedToken) {
          try {
            const meController = new AbortController();
            const meTimeout = setTimeout(() => meController.abort(), 4000);

            const meHeaders: Record<string, string> = {
              Authorization: `Bearer ${storedToken}`,
            };
            if (storedRefreshToken) {
              meHeaders["x-refresh-token"] = storedRefreshToken;
            }

            const meRes = await fetch("/api/v1/auth/me", {
              credentials: "include",
              headers: meHeaders,
              signal: meController.signal,
            });
            clearTimeout(meTimeout);

            const refreshedHeaderToken = meRes.headers.get("x-refreshed-access-token");
            const effectiveToken = refreshedHeaderToken || storedToken;

            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.success && meData.data) {
                setAuth(meData.data, effectiveToken, storedRefreshToken);
                useAuthStore.getState().setLoading(false);
                return;
              }
            } else if (meRes.status === 401) {
              needsRefresh = true;
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
          } catch {
            // Network issue or timeout; keep current session if user state exists
            if (useAuthStore.getState().user) {
              useAuthStore.getState().setLoading(false);
              return;
            }
          }
        }

        // 2. If access token is missing or expired/401, attempt single-flight refresh (via storedRefreshToken or HttpOnly cookie)
        if (needsRefresh || storedRefreshToken) {
          try {
            const refreshRes = await requestTokenRefresh();
            if (refreshRes.success) {
              const newAccessToken = refreshRes.accessToken;
              const meRes = await fetch("/api/v1/auth/me", {
                credentials: "include",
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });

              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData.success && meData.data) {
                  const currentRefreshToken =
                    refreshRes.refreshToken ||
                    sanitizeToken(useAuthStore.getState().refreshToken) ||
                    storedRefreshToken;
                  setAuth(meData.data, newAccessToken, currentRefreshToken);
                  useAuthStore.getState().setLoading(false);
                  return;
                }
              }
            } else if (refreshRes.reason === 'unauthorized') {
              // Server explicitly rejected refresh token: purge stale session so expired tokens don't linger
              logout();
              window.dispatchEvent(new CustomEvent("session_expired"));
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
        const currentToken =
          sanitizeToken(useAuthStore.getState().accessToken) ||
          sanitizeToken(localStorage.getItem('gencsosyal_token'));
        const currentRefreshToken =
          sanitizeToken(useAuthStore.getState().refreshToken) ||
          sanitizeToken(localStorage.getItem('gencsosyal_refresh_token'));

        const refreshSession = async () => {
          const refreshed = await requestTokenRefresh();
          if (refreshed.success) {
            const meRes = await fetch("/api/v1/auth/me", {
              credentials: "include",
              headers: { Authorization: `Bearer ${refreshed.accessToken}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.success && meData.data) {
                const activeRefreshToken =
                  refreshed.refreshToken ||
                  sanitizeToken(useAuthStore.getState().refreshToken) ||
                  currentRefreshToken;
                useAuthStore.getState().setAuth(meData.data, refreshed.accessToken, activeRefreshToken);
              }
            }
          } else if (refreshed.reason === 'unauthorized') {
            useAuthStore.getState().logout();
            window.dispatchEvent(new CustomEvent("session_expired"));
          }
        };

        if (currentToken && !isJwtExpired(currentToken)) {
          fetch("/api/v1/auth/me", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              ...(currentRefreshToken ? { "x-refresh-token": currentRefreshToken } : {}),
            },
          })
            .then(async (res) => {
              const refreshedHeader = res.headers.get("x-refreshed-access-token");
              if (refreshedHeader) {
                useAuthStore.getState().setAccessToken(refreshedHeader);
              }
              if (res.status === 401) {
                await refreshSession();
              } else if (res.ok) {
                const meData = await res.json();
                if (meData.success && meData.data) {
                  useAuthStore.getState().setUser(meData.data);
                }
              }
            })
            .catch(() => {
              // Network glitch on resume: do not disturb user session
            });
        } else if (currentToken || currentRefreshToken || useAuthStore.getState().isAuthenticated) {
          refreshSession().catch(() => {});
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
