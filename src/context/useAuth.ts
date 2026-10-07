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

// Read persisted session from storage
const getInitialAuthState = () => {
  try {
    const storedUser = localStorage.getItem('gencsosyal_user');
    const storedToken = localStorage.getItem('gencsosyal_token');
    const storedRefreshToken = localStorage.getItem('gencsosyal_refresh_token');
    const storedSuspension = sessionStorage.getItem('gencsosyal_suspension');

    const user = storedUser ? JSON.parse(storedUser) : null;
    const suspensionInfo = storedSuspension ? JSON.parse(storedSuspension) : null;

    if (user && (storedToken || storedRefreshToken)) {
      return {
        user,
        accessToken: storedToken || null,
        refreshToken: storedRefreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        suspensionInfo: null,
      };
    }

    return {
      user: null,
      accessToken: null,
      refreshToken: storedRefreshToken || null,
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
    try {
      localStorage.setItem('gencsosyal_user', JSON.stringify(user));
      localStorage.setItem('gencsosyal_token', token);
      if (refreshToken) {
        localStorage.setItem('gencsosyal_refresh_token', refreshToken);
      }
      sessionStorage.removeItem('gencsosyal_suspension');
    } catch {}

    set({ 
      user, 
      accessToken: token, 
      refreshToken: refreshToken || localStorage.getItem('gencsosyal_refresh_token') || null, 
      isAuthenticated: true, 
      isLoading: false, 
      suspensionInfo: null 
    });
  },

  setAccessToken: (token, refreshToken) => {
    try {
      localStorage.setItem('gencsosyal_token', token);
      if (refreshToken) {
        localStorage.setItem('gencsosyal_refresh_token', refreshToken);
      }
    } catch {}
    set({ 
      accessToken: token, 
      refreshToken: refreshToken || localStorage.getItem('gencsosyal_refresh_token') || null, 
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
      fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false, suspensionInfo: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
