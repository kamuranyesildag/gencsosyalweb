import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Home, Compass, Bell, Plus, User } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { Avatar } from '../ui/Avatar';
import { CreateMenu } from './CreateMenu';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useStoryViewerStore } from '../../context/useStoryViewerStore';
import { useUnreadStore } from '../../context/useUnreadStore';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { unreadNotifications } = useUnreadStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const isStoryViewerOpen = useStoryViewerStore((s) => s.isOpen);
  
  // Custom hook to detect scroll direction
  const isVisible = useScrollDirection();

  const isHomeActive = location.pathname === '/home';
  const isExploreActive = location.pathname === '/explore';
  const isNotificationsActive = location.pathname === '/notifications';
  const isProfileActive =
    isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);

  return (
    <>
      <AnimatePresence>
        {isVisible && !isStoryViewerOpen && (
          <motion.nav
            role="navigation"
            aria-label="Mobil Gezinme Çubuğu"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed z-40 bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[24px] transition-colors"
            style={{
              bottom: 'calc(16px + env(safe-area-inset-bottom))',
              left: '16px',
              right: '16px'
            }}
          >
            <div className="flex justify-around items-center w-full h-[60px] px-2 relative">
              {/* 1. Home */}
              <NavLink
                to="/home"
                aria-label="Ana Sayfa"
                aria-current={isHomeActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                  isHomeActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Home
                    className={`w-5.5 h-5.5 transition-transform ${
                      isHomeActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.75]'
                    }`}
                  />
                  {isHomeActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 2. Explore */}
              <NavLink
                to="/explore"
                aria-label="Keşfet"
                aria-current={isExploreActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                  isExploreActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Compass
                    className={`w-5.5 h-5.5 transition-transform ${
                      isExploreActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.75]'
                    }`}
                  />
                  {isExploreActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 3. Create Button (Harmonious Center Action) */}
              <div className="flex items-center justify-center flex-1 h-full">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) openModal();
                    else setShowCreate(true);
                  }}
                  aria-label="İçerik Oluştur"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-500/25 transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Plus className="w-5.5 h-5.5 stroke-[2.2]" />
                </button>
              </div>

              {/* 4. Notifications */}
              <NavLink
                to="/notifications"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-label="Bildirimler"
                aria-current={isNotificationsActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                  isNotificationsActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Bell
                    className={`w-5.5 h-5.5 transition-transform ${
                      isNotificationsActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.75]'
                    }`}
                  />
                  {unreadNotifications > 0 && !isNotificationsActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-[#0D121D]" />
                  )}
                  {isNotificationsActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 5. Profile */}
              <NavLink
                to={isAuthenticated && user ? `/profile/${user.username}` : '#'}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-label="Profilim"
                aria-current={isProfileActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                  isProfileActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  {isAuthenticated && user ? (
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="sm"
                      className={`transition-all ${
                        isProfileActive
                          ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-105'
                          : 'ring-transparent'
                      }`}
                    />
                  ) : (
                    <User className="w-5.5 h-5.5 stroke-[1.75]" />
                  )}
                  {isProfileActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <CreateMenu isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
