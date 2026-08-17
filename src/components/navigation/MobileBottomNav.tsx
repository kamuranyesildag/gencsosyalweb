import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Home, Compass, Bell, Plus, User } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { Avatar } from '../ui/Avatar';
import { CreateMenu } from './CreateMenu';
import { MoreMenu } from './MoreMenu';
import { motion } from 'motion/react';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const isHomeActive = location.pathname === '/home';
  const isExploreActive = location.pathname === '/explore';
  const isNotificationsActive = location.pathname === '/notifications';
  const isProfileActive = isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);

  return (
    <>
      <div className="flex justify-around items-center w-full h-16 px-2 relative" role="navigation" aria-label="Mobil Gezinme">
        {/* 1. Home */}
        <NavLink
          to="/home"
          aria-label="Ana Sayfa"
          aria-current={isHomeActive ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
            isHomeActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 active:text-indigo-600'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Home className={`w-6 h-6 transition-transform ${isHomeActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isHomeActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1"
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
            isExploreActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 active:text-indigo-600'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Compass className={`w-6 h-6 transition-transform ${isExploreActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isExploreActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1"
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
              else setShowCreate(true);
            }}
            aria-label="Oluştur"
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40 -mt-5"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
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
            isNotificationsActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 active:text-indigo-600'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Bell className={`w-6 h-6 transition-transform ${isNotificationsActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
            {isNotificationsActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </NavLink>

        {/* 5. Profile / More */}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              openModal();
            } else {
              setShowMore(true);
            }
          }}
          aria-label="Profil ve Menü"
          className={`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
            isProfileActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            {isAuthenticated && user ? (
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username}
                size="xs"
                className={`ring-2 transition-all ${
                  isProfileActive ? 'ring-indigo-600 scale-105' : 'ring-transparent hover:ring-slate-300'
                }`}
              />
            ) : (
              <User className="w-6 h-6 stroke-[1.8]" />
            )}
            {isProfileActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </button>
      </div>

      <CreateMenu isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <MoreMenu isOpen={showMore} onClose={() => setShowMore(false)} />
    </>
  );
}
