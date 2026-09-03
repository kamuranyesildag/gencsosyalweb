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
  const isProfileActive = isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);

  return (
    <>
      <div className="flex justify-around items-center w-full h-14 px-1 relative" role="navigation" aria-label="Mobil Gezinme">
        {/* 1. Home */}
        <NavLink
          to="/home"
          aria-label="Ana Sayfa"
          aria-current={isHomeActive ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
            isHomeActive
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:text-slate-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Home className={`w-[22px] h-[22px] md:w-6 md:h-6 transition-transform ${isHomeActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isHomeActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1"
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
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:text-slate-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Compass className={`w-[22px] h-[22px] md:w-6 md:h-6 transition-transform ${isExploreActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isExploreActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </NavLink>

        {/* 3. Create Button (Prominent Center Button) */}
        <div className="flex items-center justify-center flex-1 h-full">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (!isAuthenticated) openModal();
              else navigate('/create');
            }}
            aria-label="Oluştur"
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white shadow-lg shadow-slate-900/20 ring-4 ring-white dark:ring-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20 -mt-4"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
          </motion.button>
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
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:text-slate-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Bell className={`w-[22px] h-[22px] md:w-6 md:h-6 transition-transform ${isNotificationsActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isNotificationsActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </NavLink>

        {/* 5. Profile: Directly navigates to the user's Profile page */}
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
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative flex flex-col items-center">
            {isAuthenticated && user ? (
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username}
                size="xs"
                className={`ring-2 transition-all ${
                  isProfileActive
                    ? 'ring-slate-900 dark:ring-white scale-105'
                    : 'ring-transparent hover:ring-slate-300 dark:hover:ring-slate-700'
                }`}
              />
            ) : (
              <User className="w-[22px] h-[22px] md:w-6 md:h-6 stroke-[1.8]" />
            )}
            {isProfileActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </NavLink>
      </div>

      <CreateMenu isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
