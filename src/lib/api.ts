import { useAuthStore } from "../context/useAuth";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
}

const API_BASE = "/api/v1";

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export type RefreshResult = 
  | { success: true; accessToken: string }
  | { success: false; reason: 'unauthorized' | 'suspended' | 'network' | 'unknown' };

let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * Singleton Single-Flight Refresh Coordinator
 * Ensures all concurrent requests share the exact same refresh promise
 * and isolates network errors from explicit authorization failures.
 */
export async function requestTokenRefresh(): Promise<RefreshResult> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<RefreshResult> => {
    try {
      const storedRefreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('gencsosyal_refresh_token');

      if (!storedRefreshToken) {
        return { success: false, reason: 'unauthorized' };
      }

      const controller = new AbortController();
      const timeoutTimer = setTimeout(() => controller.abort(), 8000);

      let refreshResponse: Response;
      try {
        refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-refresh-token": storedRefreshToken,
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
          signal: controller.signal,
        });
      } catch (netErr: any) {
        // Network timeout / connection dropped / offline
        console.warn("[api] Token refresh network error, maintaining session offline:", netErr?.message);
        return { success: false, reason: 'network' };
      } finally {
        clearTimeout(timeoutTimer);
      }

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success && refreshResult.data?.accessToken) {
          const newToken = refreshResult.data.accessToken;
          const newRefreshToken = refreshResult.data.refreshToken || storedRefreshToken;
          useAuthStore.getState().setAccessToken(newToken, newRefreshToken);
          return { success: true, accessToken: newToken };
        }
      } else if (refreshResponse.status === 403) {
        const refreshResult = await refreshResponse.json().catch(() => null);
        if (refreshResult?.error?.code === "ACCOUNT_SUSPENDED") {
          useAuthStore.getState().setSuspension(refreshResult.error.suspension);
          if (window.location.pathname !== "/account-suspended") {
            window.location.href = "/account-suspended";
          }
          return { success: false, reason: 'suspended' };
        }
      } else if (refreshResponse.status === 401) {
        return { success: false, reason: 'unauthorized' };
      } else if (refreshResponse.status >= 500) {
        // Server 5xx error / proxy error
        console.warn("[api] Token refresh 5xx server error, maintaining session:", refreshResponse.status);
        return { success: false, reason: 'network' };
      }

      return { success: false, reason: 'unknown' };
    } catch {
      return { success: false, reason: 'network' };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { data, headers: customHeaders, body: customBody, ...rest } = options;

  let accessToken = useAuthStore.getState().accessToken;

  const headers = new Headers(customHeaders);
  if (data && !(data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  } else if (customBody && typeof customBody === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const finalBody = customBody !== undefined
    ? customBody
    : (data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers,
      body: finalBody,
    });
  } catch (networkError) {
    // Network failure (offline, DNS, timeout, connection reset)
    // NEVER log out user on network errors!
    throw networkError;
  }

  // Handle 401: Token expired or invalid
  if (response.status === 401 && accessToken) {
    const refreshRes = await requestTokenRefresh();
    if (refreshRes.success) {
      // Retry original request with new token
      headers.set("Authorization", `Bearer ${refreshRes.accessToken}`);
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...rest,
        headers,
        body: finalBody,
      });
    } else if (refreshRes.reason === 'unauthorized') {
      // ONLY logout if server explicitly rejected the refresh token (session revoked or expired)
      if (useAuthStore.getState().isAuthenticated || useAuthStore.getState().accessToken) {
        useAuthStore.getState().logout();
        window.dispatchEvent(new CustomEvent("session_expired"));
      }
      return response;
    } else {
      // Network issue or server 5xx: keep session alive!
      return response;
    }
  }

  if (response.status === 403) {
    try {
      const cloned = response.clone();
      const body = await cloned.json();
      if (body?.error?.code === "ACCOUNT_SUSPENDED") {
        useAuthStore.getState().setSuspension(body.error.suspension);
        if (window.location.pathname !== "/account-suspended") {
          window.location.href = "/account-suspended";
        }
      }
    } catch {}
  }

  return response;
}

export const api = {
  get: async <T = any>(url: string): Promise<{ data: ApiResponse<T> }> => {
    const endpoint = url.startsWith('/api/v1') ? url.replace('/api/v1', '') : url;
    const res = await fetchApi(endpoint);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  post: async <T = any>(url: string, data?: unknown): Promise<{ data: ApiResponse<T> }> => {
    const endpoint = url.startsWith('/api/v1') ? url.replace('/api/v1', '') : url;
    const res = await fetchApi(endpoint, { method: 'POST', data });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  patch: async <T = any>(url: string, data?: unknown): Promise<{ data: ApiResponse<T> }> => {
    const endpoint = url.startsWith('/api/v1') ? url.replace('/api/v1', '') : url;
    const res = await fetchApi(endpoint, { method: 'PATCH', data });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  delete: async <T = any>(url: string): Promise<{ data: ApiResponse<T> }> => {
    const endpoint = url.startsWith('/api/v1') ? url.replace('/api/v1', '') : url;
    const res = await fetchApi(endpoint, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  }
};
