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

let refreshPromise: Promise<string | null> | null = null;

async function requestTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success && refreshResult.data?.accessToken) {
          const newToken = refreshResult.data.accessToken;
          useAuthStore.getState().setAccessToken(newToken);
          return newToken;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { data, headers: customHeaders, ...rest } = options;

  let accessToken = useAuthStore.getState().accessToken;

  const headers = new Headers(customHeaders);
  if (data && !(data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
    body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
  });

  if (response.status === 401 && accessToken) {
    const newToken = await requestTokenRefresh();
    if (newToken) {
      // Retry original request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...rest,
        headers,
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      });
    } else {
      // Refresh failed or session expired
      if (useAuthStore.getState().isAuthenticated || useAuthStore.getState().accessToken) {
        useAuthStore.getState().logout();
        window.dispatchEvent(new CustomEvent("session_expired"));
      }
      return response; // Return the 401 response
    }
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
