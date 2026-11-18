import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useUnreadStore } from '../../context/useUnreadStore';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { triggerHaptic } from '../../utils/haptics';
import { cn } from '../../lib/utils';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { unreadNotifications, fetchUnread } = useUnreadStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
    }
  }, [isAuthenticated, fetchUnread]);

  // Hide on active chat room to give full keyboard space
  if (/^\/messages\/\d+/.test(location.pathname)) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home' || location.pathname === '/feed';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string, requiresAuth?: boolean, e?: React.MouseEvent) => {
    triggerHaptic('selection');
    if (requiresAuth && !isAuthenticated) {
      e?.preventDefault();
      openModal();
      return;
    }
    if (isActive(path)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const homeActive = isActive('/home');
  const exploreActive = isActive('/explore');
  const createActive = isActive('/create');
  const notifActive = isActive('/notifications');
  const profilePath = user ? `/profile/${user.username}` : '/login';
  const profileActive = user ? isActive(`/profile/${user.username}`) : false;

  return (
    <nav
      aria-label="Mobil Alt Gezinme Çubuğu"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080E1A]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-4px_20px_rgba(15,23,42,0.04)] transition-colors"
    >
      <div className="grid grid-cols-5 items-center h-[64px] max-w-md mx-auto px-1.5">
        {/* 1. Ana Sayfa */}
        <Link
          to="/home"
          onClick={(e) => handleNavClick('/home', false, e)}
          aria-current={homeActive ? 'page' : undefined}
          className="flex flex-col items-center justify-center h-full gap-0.5 group active:scale-95 transition-transform"
        >
          <div
            className={cn(
              'w-11 h-7 rounded-full flex items-center justify-center transition-colors',
              homeActive
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Home className={cn('w-5 h-5', homeActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
          </div>
          <span
            className={cn(
              'text-[10.5px] tracking-tight leading-none',
              homeActive
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            )}
          >
            Ana Sayfa
          </span>
        </Link>

        {/* 2. Keşfet */}
        <Link
          to="/explore"
          onClick={(e) => handleNavClick('/explore', false, e)}
          aria-current={exploreActive ? 'page' : undefined}
          className="flex flex-col items-center justify-center h-full gap-0.5 group active:scale-95 transition-transform"
        >
          <div
            className={cn(
              'w-11 h-7 rounded-full flex items-center justify-center transition-colors',
              exploreActive
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Compass className={cn('w-5 h-5', exploreActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
          </div>
          <span
            className={cn(
              'text-[10.5px] tracking-tight leading-none',
              exploreActive
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            )}
          >
            Keşfet
          </span>
        </Link>

        {/* 3. Oluştur (Center Primary Action) */}
        <button
          type="button"
          onClick={(e) => {
            triggerHaptic('medium');
            if (!isAuthenticated) {
              e.preventDefault();
              openModal();
              return;
            }
            navigate('/create');
          }}
          aria-label="Yeni Gönderi Oluştur"
          className="flex flex-col items-center justify-center h-full gap-1 group active:scale-95 transition-transform cursor-pointer"
        >
          <div
            className={cn(
              'w-12 h-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/25 transition-all',
              createActive && 'ring-2 ring-blue-300 dark:ring-blue-800'
            )}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span
            className={cn(
              'text-[10.5px] tracking-tight leading-none',
              createActive
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'font-medium text-slate-600 dark:text-slate-400'
            )}
          >
            Oluştur
          </span>
        </button>

        {/* 4. Bildirimler */}
        <Link
          to="/notifications"
          onClick={(e) => handleNavClick('/notifications', true, e)}
          aria-current={notifActive ? 'page' : undefined}
          className="flex flex-col items-center justify-center h-full gap-0.5 group active:scale-95 transition-transform"
        >
          <div
            className={cn(
              'relative w-11 h-7 rounded-full flex items-center justify-center transition-colors',
              notifActive
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Bell className={cn('w-5 h-5', notifActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-[9.5px] font-extrabold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#080E1A]">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-[10.5px] tracking-tight leading-none',
              notifActive
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            )}
          >
            Bildirimler
          </span>
        </Link>

        {/* 5. Profil */}
        <Link
          to={profilePath}
          onClick={(e) => handleNavClick(profilePath, true, e)}
          aria-current={profileActive ? 'page' : undefined}
          className="flex flex-col items-center justify-center h-full gap-0.5 group active:scale-95 transition-transform"
        >
          <div
            className={cn(
              'w-11 h-7 rounded-full flex items-center justify-center transition-colors',
              profileActive
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {isAuthenticated && user ? (
              <Avatar
                url={user.avatarUrl}
                name={user.displayName || user.username}
                size="xs"
                className={cn(
                  'w-6 h-6 transition-all',
                  profileActive
                    ? 'ring-2 ring-blue-600 dark:ring-blue-400'
                    : 'ring-1 ring-slate-200 dark:ring-white/15'
                )}
              />
            ) : (
              <User className={cn('w-5 h-5', profileActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
            )}
          </div>
          <span
            className={cn(
              'text-[10.5px] tracking-tight leading-none',
              profileActive
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            )}
          >
            Profil
          </span>
        </Link>
      </div>
    </nav>
  );
}
