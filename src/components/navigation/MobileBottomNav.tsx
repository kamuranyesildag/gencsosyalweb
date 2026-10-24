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
import { triggerHaptic } from '../../utils/haptics';

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
  const isMessageThread = location.pathname.startsWith('/messages/') && location.pathname !== '/messages';

  if (isMessageThread) {
    return <CreateMenu isOpen={showCreate} onClose={() => setShowCreate(false)} />;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && !isStoryViewerOpen && (
          <motion.nav
            role="navigation"
            aria-label="Mobil Gezinme Çubuğu"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm rounded-full bg-white/80 dark:bg-[#0B1329]/80 backdrop-blur-xl border border-white/40 dark:border-white/[0.12] shadow-2xl shadow-black/10 transition-all p-1.5"
          >
            <div className="flex justify-around items-center w-full h-12 px-1 relative">
              {/* 1. Home */}
              <NavLink
                to="/home"
                onClick={() => triggerHaptic("selection")}
                aria-label="Ana Sayfa"
                aria-current={isHomeActive ? 'page' : undefined}
                className={`relative flex items-center justify-center flex-1 h-full rounded-full transition-all ${
                  isHomeActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Home
                    className={`w-5 h-5 transition-transform ${
                      isHomeActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'
                    }`}
                  />
                  {isHomeActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs shadow-blue-500/50"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 2. Explore */}
              <NavLink
                to="/explore"
                onClick={() => triggerHaptic("selection")}
                aria-label="Keşfet"
                aria-current={isExploreActive ? 'page' : undefined}
                className={`relative flex items-center justify-center flex-1 h-full rounded-full transition-all ${
                  isExploreActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Compass
                    className={`w-5 h-5 transition-transform ${
                      isExploreActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'
                    }`}
                  />
                  {isExploreActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs shadow-blue-500/50"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 3. Floating Rounded Center Action Button */}
              <div className="flex items-center justify-center px-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    if (!isAuthenticated) openModal();
                    else setShowCreate(true);
                  }}
                  aria-label="İçerik Oluştur"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white shadow-md shadow-blue-500/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* 4. Notifications */}
              <NavLink
                to="/notifications"
                onClick={(e) => {
                  triggerHaptic("selection");
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-label="Bildirimler"
                aria-current={isNotificationsActive ? 'page' : undefined}
                className={`relative flex items-center justify-center flex-1 h-full rounded-full transition-all ${
                  isNotificationsActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <Bell
                    className={`w-5 h-5 transition-transform ${
                      isNotificationsActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'
                    }`}
                  />
                  {unreadNotifications > 0 && !isNotificationsActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-[#0B1329]" />
                  )}
                  {isNotificationsActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs shadow-blue-500/50"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 5. Profile */}
              <NavLink
                to={isAuthenticated && user ? `/profile/${user.username}` : '#'}
                onClick={(e) => {
                  triggerHaptic("selection");
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-label="Profilim"
                aria-current={isProfileActive ? 'page' : undefined}
                className={`relative flex items-center justify-center flex-1 h-full rounded-full transition-all ${
                  isProfileActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  {isAuthenticated && user ? (
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="sm"
                      className={`transition-all w-6 h-6 ${
                        isProfileActive
                          ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-105'
                          : 'ring-transparent opacity-80'
                      }`}
                    />
                  ) : (
                    <User className="w-5 h-5 stroke-[1.8]" />
                  )}
                  {isProfileActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs shadow-blue-500/50"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
