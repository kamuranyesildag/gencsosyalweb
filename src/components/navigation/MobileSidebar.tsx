import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Home,
  Compass,
  Rocket,
  Users,
  Bookmark,
  Settings,
  User,
  LogOut,
  ShieldAlert,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useThemeStore } from '../../context/useTheme';
import { Avatar } from '../ui/Avatar';

export function MobileSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthAction = (path: string, protectedRoute: boolean) => {
    if (protectedRoute && !isAuthenticated) {
      if (onItemClick) onItemClick();
      openModal();
    } else {
      if (onItemClick) onItemClick();
      navigate(path);
    }
  };

  const navItems = [
    { name: 'Ana Sayfa', path: '/home', icon: Home, protected: false },
    { name: 'Keşfet', path: '/explore', icon: Compass, protected: false },
    { name: 'Projeler', path: '/projects', icon: Rocket, protected: false },
    { name: 'Topluluklar', path: '/communities', icon: Users, protected: false },
    { name: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark, protected: true },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Paneli', path: '/admin', icon: ShieldAlert, protected: true });
  }

  return (
    <nav className="flex flex-col h-full bg-transparent text-slate-900 dark:text-slate-100 transition-colors" aria-label="Mobil Yan Menü">
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/home' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleAuthAction(item.path, item.protected)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}

        <div className="my-2 border-t border-slate-100 dark:border-white/[0.06]" />

        {/* Profile */}
        <button
          type="button"
          onClick={() =>
            handleAuthAction(isAuthenticated && user ? `/profile/${user.username}` : '/login', true)
          }
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`)
              ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
          }`}
        >
          {isAuthenticated && user ? (
            <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="xs" />
          ) : (
            <User className="w-5 h-5 shrink-0 stroke-[1.8]" />
          )}
          <span className="text-sm">Profilim</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => handleAuthAction('/settings', true)}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            location.pathname === '/settings'
              ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0 stroke-[1.8]" />
          <span className="text-sm">Ayarlar</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => toggleTheme()}
          className="flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3">
            {actualTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2] shrink-0" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.8] shrink-0" />
            )}
            <span className="text-sm">{actualTheme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}</span>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-[#161E2E] px-2 py-0.5 rounded font-semibold text-slate-500 dark:text-slate-400">
            {actualTheme === 'dark' ? 'Koyu' : 'Açık'}
          </span>
        </button>

        {/* Logout (If authenticated) */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              if (onItemClick) onItemClick();
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 font-medium border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm">Çıkış Yap</span>
          </button>
        )}
      </div>
    </nav>
  );
}
