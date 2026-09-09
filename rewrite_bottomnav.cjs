const fs = require('fs');

const content = `import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Home, Compass, Bell, Plus, User } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { Avatar } from '../ui/Avatar';
import { CreateMenu } from './CreateMenu';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollDirection } from '../../hooks/useScrollDirection';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  
  // Custom hook to detect scroll direction
  const isVisible = useScrollDirection();

  const isHomeActive = location.pathname === '/home';
  const isExploreActive = location.pathname === '/explore';
  const isNotificationsActive = location.pathname === '/notifications';
  const isProfileActive =
    isAuthenticated && user && location.pathname.startsWith(\`/profile/\${user.username}\`);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            role="navigation"
            aria-label="Mobil Gezinme Çubuğu"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed z-40 bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[24px] transition-colors"
            style={{
              bottom: 'max(16px, env(safe-area-inset-bottom))',
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
                className={\`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors \${
                  isHomeActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }\`}
              >
                <div className="relative flex flex-col items-center">
                  <Home
                    className={\`w-6 h-6 transition-transform \${
                      isHomeActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8]'
                    }\`}
                  />
                  {isHomeActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 dark:bg-white"
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
                className={\`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors \${
                  isExploreActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }\`}
              >
                <div className="relative flex flex-col items-center">
                  <Compass
                    className={\`w-6 h-6 transition-transform \${
                      isExploreActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8]'
                    }\`}
                  />
                  {isExploreActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 dark:bg-white"
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
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:hover:bg-slate-200 dark:active:bg-slate-300 text-white dark:text-slate-900 shadow-sm transition-all active:scale-[0.95] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Plus className="w-6 h-6 stroke-[2]" />
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
                className={\`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors \${
                  isNotificationsActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }\`}
              >
                <div className="relative flex flex-col items-center">
                  <Bell
                    className={\`w-6 h-6 transition-transform \${
                      isNotificationsActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8]'
                    }\`}
                  />
                  {isNotificationsActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 dark:bg-white"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </NavLink>

              {/* 5. Profile */}
              <NavLink
                to={isAuthenticated && user ? \`/profile/\${user.username}\` : '#'}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-label="Profilim"
                aria-current={isProfileActive ? 'page' : undefined}
                className={\`relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors \${
                  isProfileActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }\`}
              >
                <div className="relative flex flex-col items-center">
                  {isAuthenticated && user ? (
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="sm"
                      className={\`transition-all \${
                        isProfileActive
                          ? 'ring-2 ring-slate-900 dark:ring-white scale-105'
                          : 'ring-transparent'
                      }\`}
                    />
                  ) : (
                    <User className="w-6 h-6 stroke-[1.8]" />
                  )}
                  {isProfileActive && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 dark:bg-white"
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
`;
fs.writeFileSync('src/components/navigation/MobileBottomNav.tsx', content);
