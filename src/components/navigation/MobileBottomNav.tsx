import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Home, Compass, Bell, Plus, User } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { Avatar } from '../ui/Avatar';
import { CreateMenu } from './CreateMenu';
import { motion } from 'motion/react';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const isHomeActive = location.pathname === '/home';
  const isExploreActive = location.pathname === '/explore';
  const isNotificationsActive = location.pathname === '/notifications';
  const isProfileActive =
    isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Mobil Gezinme Çubuğu"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-[#0D121D]/85 backdrop-blur-md border-t border-slate-200/80 dark:border-white/[0.08] shadow-xs pb-[var(--sab,0px)] transition-colors"
      >
        <div className="flex justify-around items-center w-full h-[56px] px-2 max-w-lg mx-auto relative">
          {/* 1. Home */}
          <NavLink
            to="/home"
            aria-label="Ana Sayfa"
            aria-current={isHomeActive ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
              isHomeActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative flex flex-col items-center">
              <Home
                className={`w-5 h-5 transition-transform ${
                  isHomeActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`}
              />
              {isHomeActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
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
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative flex flex-col items-center">
              <Compass
                className={`w-5 h-5 transition-transform ${
                  isExploreActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`}
              />
              {isExploreActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
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
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:hover:bg-slate-100 dark:active:bg-slate-200 text-white dark:text-slate-900 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
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
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative flex flex-col items-center">
              <Bell
                className={`w-5 h-5 transition-transform ${
                  isNotificationsActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`}
              />
              {isNotificationsActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
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
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative flex flex-col items-center">
              {isAuthenticated && user ? (
                <Avatar
                  url={user.avatarUrl}
                  name={user.displayName || user.username}
                  size="xs"
                  className={`ring-1.5 transition-all ${
                    isProfileActive
                      ? 'ring-blue-600 dark:ring-blue-400'
                      : 'ring-transparent'
                  }`}
                />
              ) : (
                <User className="w-5 h-5 stroke-[1.8]" />
              )}
              {isProfileActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
          </NavLink>
        </div>
      </nav>

      <CreateMenu isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
