import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  role: string;
  isVerified: boolean;
  isActive?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  banExpiresAt?: string | null;
  createdAt: string;
  onboardingCompleted?: boolean;
  isMinor?: boolean;
  ageVerificationStatus?: 'UNVERIFIED' | 'VERIFIED_CHILD' | 'VERIFIED_ADULT' | 'REJECTED_UNDERAGE' | string;
  ageVerificationToken?: string | null;
  ageVerifiedAt?: string | null;
  ageVerificationMethod?: string | null;
  birthDate?: string | null;
  isScreenshotProtected?: boolean;
  dailyScreenTimeLimitMinutes?: number | null;
}

export interface SuspensionInfo {
  userId: number;
  username: string;
  email?: string;
  isPermanent: boolean;
  banReason: string;
  bannedAt?: string | null;
  banExpiresAt?: string | null;
  suspensionToken?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  suspensionInfo: SuspensionInfo | null;
  setAuth: (user: User, token: string, refreshToken?: string | null) => void;
  setAccessToken: (token: string, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  setSuspension: (info: SuspensionInfo | null) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Sanitize token string to prevent 'null' or 'undefined' literals
export const sanitizeToken = (token?: string | null): string | null => {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  if (trimmed.split('.').length !== 3) return null;
  return trimmed;
};

// Check if a JWT access token is expired (or expiring within 5 seconds)
export const isJwtExpired = (token?: string | null): boolean => {
  const clean = sanitizeToken(token);
  if (!clean) return true;
  try {
    const base64Url = clean.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 <= Date.now() + 5000;
    }
    return false;
  } catch {
    return true;
  }
};

// Read persisted session from storage
const getInitialAuthState = () => {
  try {
    const storedUser = localStorage.getItem('gencsosyal_user');
    const rawToken = sanitizeToken(localStorage.getItem('gencsosyal_token'));
    const storedRefreshToken = sanitizeToken(localStorage.getItem('gencsosyal_refresh_token'));
    const storedSuspension = sessionStorage.getItem('gencsosyal_suspension');

    // Clean up corrupted literal strings in localStorage if any
    if (!rawToken && localStorage.getItem('gencsosyal_token')) {
      localStorage.removeItem('gencsosyal_token');
    }
    if (!storedRefreshToken && localStorage.getItem('gencsosyal_refresh_token')) {
      localStorage.removeItem('gencsosyal_refresh_token');
    }

    // Only keep accessToken immediately if it has not already expired
    const validAccessToken = rawToken && !isJwtExpired(rawToken) ? rawToken : null;

    const user = storedUser ? JSON.parse(storedUser) : null;
    const suspensionInfo = storedSuspension ? JSON.parse(storedSuspension) : null;

    if (user && (validAccessToken || rawToken || storedRefreshToken)) {
      return {
        user,
        accessToken: validAccessToken,
        refreshToken: storedRefreshToken,
        isAuthenticated: true,
        isLoading: !validAccessToken, // Wait for background token refresh if access token is expired
        suspensionInfo: null,
      };
    }

    return {
      user: null,
      accessToken: null,
      refreshToken: storedRefreshToken,
      isAuthenticated: false,
      isLoading: Boolean(storedRefreshToken), // if refresh token exists, wait for silent background validation
      suspensionInfo,
    };
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      suspensionInfo: null,
    };
  }
};

const initial = getInitialAuthState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  accessToken: initial.accessToken,
  refreshToken: initial.refreshToken,
  isAuthenticated: initial.isAuthenticated,
  isLoading: initial.isLoading,
  suspensionInfo: initial.suspensionInfo,

  setAuth: (user, token, refreshToken) => {
    const cleanAccess = sanitizeToken(token);
    const cleanRefresh = sanitizeToken(refreshToken) || sanitizeToken(localStorage.getItem('gencsosyal_refresh_token'));
    try {
      localStorage.setItem('gencsosyal_user', JSON.stringify(user));
      if (cleanAccess) {
        localStorage.setItem('gencsosyal_token', cleanAccess);
      }
      if (cleanRefresh) {
        localStorage.setItem('gencsosyal_refresh_token', cleanRefresh);
      }
      sessionStorage.removeItem('gencsosyal_suspension');
    } catch {}

    set({ 
      user, 
      accessToken: cleanAccess, 
      refreshToken: cleanRefresh, 
      isAuthenticated: true, 
      isLoading: false, 
      suspensionInfo: null 
    });
  },

  setAccessToken: (token, refreshToken) => {
    const cleanAccess = sanitizeToken(token);
    const cleanRefresh = sanitizeToken(refreshToken) || sanitizeToken(localStorage.getItem('gencsosyal_refresh_token'));
    try {
      if (cleanAccess) {
        localStorage.setItem('gencsosyal_token', cleanAccess);
      }
      if (cleanRefresh) {
        localStorage.setItem('gencsosyal_refresh_token', cleanRefresh);
      }
    } catch {}
    set({ 
      accessToken: cleanAccess, 
      refreshToken: cleanRefresh, 
      isAuthenticated: true,
      isLoading: false
    });
  },

  setUser: (user) => {
    try {
      localStorage.setItem('gencsosyal_user', JSON.stringify(user));
    } catch {}
    set({ user, isAuthenticated: true });
  },

  setSuspension: (info) => {
    try {
      if (info) {
        sessionStorage.setItem('gencsosyal_suspension', JSON.stringify(info));
      } else {
        sessionStorage.removeItem('gencsosyal_suspension');
      }
      localStorage.removeItem('gencsosyal_user');
      localStorage.removeItem('gencsosyal_token');
      localStorage.removeItem('gencsosyal_refresh_token');
    } catch {}
    set({ suspensionInfo: info, isAuthenticated: false, user: null, accessToken: null, refreshToken: null, isLoading: false });
  },

  logout: () => {
    try {
      localStorage.removeItem('gencsosyal_user');
      localStorage.removeItem('gencsosyal_token');
      localStorage.removeItem('gencsosyal_refresh_token');
      sessionStorage.removeItem('gencsosyal_suspension');
      // Notify backend to clear cookie and revoke token
      fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch {}
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false, suspensionInfo: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
