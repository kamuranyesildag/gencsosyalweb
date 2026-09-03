import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Home, Compass, Rocket, Users, Bookmark, Settings, User, LogOut, ShieldAlert, Moon, Sun } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/home' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => handleAuthAction(item.path, item.protected)}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group w-full ${
                isActive
                  ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[15px]">{item.name}</span>
            </button>
          );
        })}

        <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

        <button
          onClick={() => handleAuthAction(isAuthenticated && user ? `/profile/${user.username}` : '/login', true)}
          className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group w-full ${
            isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`)
              ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          {isAuthenticated && user ? (
            <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="xs" />
          ) : (
            <User className="w-5 h-5 stroke-[1.8]" />
          )}
          <span className="text-[15px]">Profilim</span>
        </button>

        <button
          onClick={() => handleAuthAction('/settings', true)}
          className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group w-full ${
            location.pathname === '/settings'
              ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
          <span className="text-[15px]">Ayarlar</span>
        </button>

        {/* Theme Toggle in Mobile Sidebar */}
        <button
          onClick={() => toggleTheme()}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          <div className="flex items-center gap-3.5">
            {actualTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.8]" />
            )}
            <span className="text-[15px]">{actualTheme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}</span>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-500 dark:text-slate-300">
            {actualTheme === 'dark' ? 'Koyu' : 'Açık'}
          </span>
        </button>
      </div>

      {isAuthenticated && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              if (onItemClick) onItemClick();
              navigate('/login');
            }}
            className="flex items-center gap-3.5 px-4 py-3.5 w-full rounded-2xl text-rose-600 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5 stroke-[2]" />
            <span className="text-[15px]">Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
}
