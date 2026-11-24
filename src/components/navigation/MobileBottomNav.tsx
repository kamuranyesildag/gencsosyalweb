import React, { useEffect, useRef, useState } from 'react';
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

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
    }
  }, [isAuthenticated, fetchUnread]);

  // Reset visibility on route change
  useEffect(() => {
    setIsVisible(true);
    lastScrollY.current = window.scrollY || 0;
  }, [location.pathname]);

  // Auto-hide when page is scrolled up (moving down the feed) and show when scrolled back
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      let currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;

      if (target && target !== document && 'scrollTop' in target) {
        const el = target as HTMLElement;
        if (el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 200) {
          currentScrollY = el.scrollTop;
        }
      }

      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (delta > 7) {
        // Page pushed up (scrolling down) -> hide
        setIsVisible(false);
      } else if (delta < -7) {
        // Page pulled down (scrolling up) -> show
        setIsVisible(true);
      }

      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true } as EventListenerOptions);
    };
  }, []);

  // Hide on active chat room to give full keyboard space
  if (/^\/messages\/\d+/.test(location.pathname)) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home' || location.pathname === '/feed';
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

  const homeActive = isActive('/');
  const exploreActive = isActive('/explore');
  const createActive = isActive('/create');
  const notifActive = isActive('/notifications');
  const profilePath = user ? `/profile/${user.username}` : '/login';
  const profileActive = user ? isActive(`/profile/${user.username}`) : false;

  return (
    <nav
      aria-label="Mobil Alt Gezinme Çubuğu"
      className={cn(
        'md:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3.5rem)] max-w-[272px] rounded-full bg-white/95 dark:bg-[#0B1221]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.12] select-none shadow-[0_8px_28px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
      )}
    >
      <div className="grid grid-cols-5 items-center h-[46px] px-1.5">
        {/* 1. Ana Sayfa */}
        <Link
          to="/"
          onClick={(e) => handleNavClick('/', false, e)}
          aria-label="Ana Sayfa"
          aria-current={homeActive ? 'page' : undefined}
          className="flex items-center justify-center h-full group active:scale-90 transition-transform"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              homeActive
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200/70 dark:ring-blue-800/50'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Home className={cn('w-[18px] h-[18px]', homeActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
          </div>
        </Link>

        {/* 2. Keşfet */}
        <Link
          to="/explore"
          onClick={(e) => handleNavClick('/explore', false, e)}
          aria-label="Keşfet"
          aria-current={exploreActive ? 'page' : undefined}
          className="flex items-center justify-center h-full group active:scale-90 transition-transform"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              exploreActive
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200/70 dark:ring-blue-800/50'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Compass className={cn('w-[18px] h-[18px]', exploreActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
          </div>
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
          className="flex items-center justify-center h-full group active:scale-90 transition-transform cursor-pointer"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-600/30 transition-all',
              createActive && 'ring-2 ring-blue-300 dark:ring-blue-800'
            )}
          >
            <Plus className="w-[18px] h-[18px] stroke-[2.6]" />
          </div>
        </button>

        {/* 4. Bildirimler */}
        <Link
          to="/notifications"
          onClick={(e) => handleNavClick('/notifications', true, e)}
          aria-label="Bildirimler"
          aria-current={notifActive ? 'page' : undefined}
          className="flex items-center justify-center h-full group active:scale-90 transition-transform"
        >
          <div
            className={cn(
              'relative w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              notifActive
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200/70 dark:ring-blue-800/50'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
            )}
          >
            <Bell className={cn('w-[18px] h-[18px]', notifActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
            {unreadNotifications > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-600 text-[8.5px] font-extrabold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0B1221]">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </div>
        </Link>

        {/* 5. Profil */}
        <Link
          to={profilePath}
          onClick={(e) => handleNavClick(profilePath, true, e)}
          aria-label="Profil"
          aria-current={profileActive ? 'page' : undefined}
          className="flex items-center justify-center h-full group active:scale-90 transition-transform"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              profileActive
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200/70 dark:ring-blue-800/50'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {isAuthenticated && user ? (
              <Avatar
                url={user.avatarUrl}
                name={user.displayName || user.username}
                size="xs"
                className={cn(
                  'w-6 h-6 rounded-full transition-all',
                  profileActive
                    ? 'ring-2 ring-blue-600 dark:ring-blue-400'
                    : 'ring-1 ring-slate-200 dark:ring-white/15'
                )}
              />
            ) : (
              <User className={cn('w-[18px] h-[18px]', profileActive ? 'stroke-[2.4]' : 'stroke-[1.9]')} />
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}
