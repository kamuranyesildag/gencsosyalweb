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
  isAuthenticated: boolean;
  isLoading: boolean;
  suspensionInfo: SuspensionInfo | null;
  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setSuspension: (info: SuspensionInfo | null) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  suspensionInfo: (() => {
    try {
      const stored = sessionStorage.getItem('gencsosyal_suspension');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  setAuth: (user, token) => {
    try {
      sessionStorage.removeItem('gencsosyal_suspension');
    } catch {}
    set({ user, accessToken: token, isAuthenticated: true, isLoading: false, suspensionInfo: null });
  },
  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user, isAuthenticated: true }),
  setSuspension: (info) => {
    try {
      if (info) {
        sessionStorage.setItem('gencsosyal_suspension', JSON.stringify(info));
      } else {
        sessionStorage.removeItem('gencsosyal_suspension');
      }
    } catch {}
    set({ suspensionInfo: info, isAuthenticated: false, user: null, accessToken: null, isLoading: false });
  },
  logout: () => {
    try {
      sessionStorage.removeItem('gencsosyal_suspension');
    } catch {}
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, suspensionInfo: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
