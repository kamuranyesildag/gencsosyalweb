import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  Home,
  Compass,
  Mail,
  Bell,
  Rocket,
  Users,
  Bookmark,
  Settings,
  LogOut,
  ShieldAlert,
  Moon,
  Sun,
  Trophy,
  Gamepad2,
  Sparkles,
  Plus,
  ChevronRight,
  LogIn,
  UserPlus,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useThemeStore } from '../../context/useTheme';
import { useUnreadStore } from '../../context/useUnreadStore';
import { Avatar } from '../ui/Avatar';

interface MobileNavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  protected: boolean;
  badge?: number;
  accentClass?: string;
}

export function MobileSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const { unreadNotifications, unreadMessages } = useUnreadStore();
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthAction = (path: string, protectedRoute: boolean) => {
    if (protectedRoute && !isAuthenticated) {
      onItemClick?.();
      openModal();
    } else {
      onItemClick?.();
      navigate(path);
    }
  };

  const primaryGroup: MobileNavItem[] = [
    { name: 'Ana Sayfa', path: '/home', icon: Home, protected: false },
    { name: 'Keşfet', path: '/explore', icon: Compass, protected: false },
    {
      name: 'Bildirimler',
      path: '/notifications',
      icon: Bell,
      protected: true,
      badge: unreadNotifications,
    },
    {
      name: 'Mesajlar',
      path: '/messages',
      icon: Mail,
      protected: true,
      badge: unreadMessages,
    },
  ];

  const discoverGroup: MobileNavItem[] = [
    {
      name: 'Genç Quiz',
      path: '/quiz',
      icon: Gamepad2,
      protected: false,
      accentClass: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      name: 'TEKNOFEST Köşesi',
      path: '/teknofest',
      icon: Sparkles,
      protected: false,
      accentClass: 'text-sky-600 dark:text-sky-400',
    },
    {
      name: '19 Mayıs Gençlik Ligi',
      path: '/youth-league',
      icon: Trophy,
      protected: false,
      accentClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      name: 'Projeler',
      path: '/projects',
      icon: Rocket,
      protected: false,
      accentClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Takımlar',
      path: '/teams',
      icon: Shield,
      protected: false,
      accentClass: 'text-violet-600 dark:text-violet-400',
    },
    {
      name: 'Topluluklar',
      path: '/communities',
      icon: Users,
      protected: false,
      accentClass: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const personalGroup: MobileNavItem[] = [
    { name: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark, protected: true },
    { name: 'Ayarlar', path: '/settings', icon: Settings, protected: true },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
    personalGroup.push({
      name: 'Admin Paneli',
      path: '/admin',
      icon: ShieldAlert,
      protected: true,
      accentClass: 'text-rose-600 dark:text-rose-400',
    });
  }

  let staggerCounter = 0;

  const renderGroup = (title: string, items: MobileNavItem[]) => (
    <div className="space-y-1">
      <div className="px-3 pt-1 pb-1 text-[11px] font-bold tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const idx = staggerCounter++;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/home' && location.pathname === '/') ||
            (item.path !== '/home' && location.pathname.startsWith(item.path + '/'));

          return (
            <motion.button
              key={item.path}
              type="button"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.22,
                delay: shouldReduceMotion ? 0 : Math.min(idx * 0.022, 0.24),
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => handleAuthAction(item.path, item.protected)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-2.5 py-2 rounded-2xl transition-all duration-150 group w-full min-h-[46px] cursor-pointer text-left active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'bg-blue-50/90 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] font-medium'
              }`}
            >
              {/* Icon Squircle */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/25'
                    : `bg-slate-100/90 dark:bg-white/[0.06] ${
                        item.accentClass || 'text-slate-600 dark:text-slate-300'
                      } group-hover:bg-white dark:group-hover:bg-white/[0.1]`
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'stroke-[2.2]' : 'stroke-[1.9]'}`} />
              </div>

              {/* Label */}
              <span className="text-[14px] tracking-tight truncate flex-1">{item.name}</span>

              {/* Unread Counter or Subtle Chevron */}
              {item.badge && item.badge > 0 ? (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-extrabold tabular-nums bg-blue-600 text-white shadow-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <nav
      className="flex flex-col h-full bg-transparent text-slate-900 dark:text-slate-100 select-none"
      aria-label="Mobil Yan Menü"
    >
      {/* Top User Identity or Guest Quick-Action Banner */}
      <div className="px-3.5 pt-3.5 pb-2 shrink-0 space-y-2.5">
        {isAuthenticated && user ? (
          <>
            <button
              type="button"
              onClick={() => handleAuthAction(`/profile/${user.username}`, true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/95 dark:bg-white/[0.04] hover:bg-slate-100/90 dark:hover:bg-white/[0.07] border border-slate-200/70 dark:border-white/[0.07] transition-all active:scale-[0.985] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Avatar
                url={user.avatarUrl}
                name={user.displayName || user.username}
                size="md"
                className="w-11 h-11 ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-tight">
                  {user.displayName || user.username}
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  @{user.username}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAuthAction('/create', true)}
              className="w-full h-11 px-4 rounded-2xl bg-gradient-to-r from-[#0F2557] via-[#2563EB] to-[#4F46E5] hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Plus className="w-4 h-4 stroke-[2.6]" />
              <span>Gönderi Oluştur</span>
            </button>
          </>
        ) : (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-[#0B1329] border border-blue-200/60 dark:border-blue-500/20 space-y-2.5">
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Genç Sosyal&apos;e Katıl
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Paylaş, yarış ve topluluklarla bağlantı kur.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onItemClick?.();
                  navigate('/register');
                }}
                className="h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Kaydol</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onItemClick?.();
                  navigate('/login');
                }}
                className="h-10 px-3 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.12] active:scale-[0.98] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Giriş Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Grouped Menu List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-4">
        {renderGroup('Akış & İletişim', primaryGroup)}
        <div className="border-t border-slate-100 dark:border-white/[0.06]" />
        {renderGroup('Etkinlik & Üretim', discoverGroup)}
        <div className="border-t border-slate-100 dark:border-white/[0.06]" />
        {renderGroup('Kişisel', personalGroup)}
      </div>

      {/* Sticky Bottom Utility Dock (Theme Switch + Logout) */}
      <div className="px-3.5 py-3 pb-safe border-t border-slate-100 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => toggleTheme()}
            aria-label={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            className="flex-1 h-11 px-3 rounded-2xl bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200 transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="flex items-center gap-2 text-xs font-bold truncate">
              {actualTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{actualTheme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              {actualTheme === 'dark' ? 'Koyu' : 'Açık'}
            </span>
          </button>

          {/* Logout Button */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                onItemClick?.();
                logout();
                navigate('/login');
              }}
              aria-label="Çıkış Yap"
              className="h-11 px-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/12 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200/70 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Çıkış</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
