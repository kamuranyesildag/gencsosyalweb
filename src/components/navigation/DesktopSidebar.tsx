import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  Settings,
  ShieldAlert,
  Rocket,
  User,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { motion } from 'motion/react';

export function DesktopSidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const location = useLocation();

  const navItems = [
    { name: 'Ana Sayfa', path: '/home', icon: Home, protected: false },
    { name: 'Keşfet', path: '/explore', icon: Search, protected: false },
    { name: 'Projeler', path: '/projects', icon: Rocket, protected: false },
    { name: 'Bildirimler', path: '/notifications', icon: Bell, protected: true },
    { name: 'Mesajlar', path: '/messages', icon: Mail, protected: true },
    { name: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark, protected: true },
    { name: 'Topluluklar', path: '/communities', icon: Users, protected: false },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Paneli', path: '/admin', icon: ShieldAlert, protected: true });
  }

  const profilePath = isAuthenticated && user ? `/profile/${user.username}` : '#';

  return (
    <nav className="flex flex-col h-full py-5 px-3 xl:px-4 justify-between select-none" aria-label="Ana Gezinme">
      <div className="flex flex-col gap-1.5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/home' && location.pathname.startsWith(item.path + '/'));

          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.protected && !isAuthenticated) {
                  e.preventDefault();
                  openModal();
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group w-full min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                isActive
                  ? 'text-indigo-600 font-semibold bg-indigo-50/80 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="flex items-center justify-center shrink-0 w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-indigo-600 stroke-[2.3]' : 'text-slate-500 group-hover:text-slate-900 stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="hidden xl:inline text-sm tracking-tight truncate">{item.name}</span>
            </NavLink>
          );

          return (
            <div key={item.path} className="w-full">
              <div className="xl:hidden w-full flex justify-center">
                <Tooltip content={item.name} placement="right">
                  {linkContent}
                </Tooltip>
              </div>
              <div className="hidden xl:block w-full">
                {linkContent}
              </div>
            </div>
          );
        })}

        {/* Profile Nav Item */}
        <div className="w-full">
          {(() => {
            const isProfileActive = isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);
            const profileLink = (
              <NavLink
                to={profilePath}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-current={isProfileActive ? 'page' : undefined}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group w-full min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                  isProfileActive
                    ? 'text-indigo-600 font-semibold bg-indigo-50/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                }`}
              >
                {isProfileActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center justify-center shrink-0 w-6 h-6">
                  {isAuthenticated && user ? (
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="xs"
                      className={`ring-1 ${isProfileActive ? 'ring-indigo-600' : 'ring-slate-300'}`}
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-500 group-hover:text-slate-900 stroke-[1.8]" />
                  )}
                </div>
                <span className="hidden xl:inline text-sm tracking-tight truncate">Profilim</span>
              </NavLink>
            );

            return (
              <div key="profile-sidebar-item">
                <div className="xl:hidden w-full flex justify-center">
                  <Tooltip content="Profilim" placement="right">
                    {profileLink}
                  </Tooltip>
                </div>
                <div className="hidden xl:block w-full">
                  {profileLink}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Settings Nav Item */}
        <div className="w-full">
          {(() => {
            const isSettingsActive = location.pathname === '/settings';
            const settingsLink = (
              <NavLink
                to="/settings"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal();
                  }
                }}
                aria-current={isSettingsActive ? 'page' : undefined}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group w-full min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                  isSettingsActive
                    ? 'text-indigo-600 font-semibold bg-indigo-50/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                }`}
              >
                {isSettingsActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center justify-center shrink-0 w-6 h-6">
                  <Settings
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isSettingsActive ? 'text-indigo-600 stroke-[2.3]' : 'text-slate-500 group-hover:text-slate-900 stroke-[1.8]'
                    }`}
                  />
                </div>
                <span className="hidden xl:inline text-sm tracking-tight truncate">Ayarlar</span>
              </NavLink>
            );

            return (
              <div key="settings-sidebar-item">
                <div className="xl:hidden w-full flex justify-center">
                  <Tooltip content="Ayarlar" placement="right">
                    {settingsLink}
                  </Tooltip>
                </div>
                <div className="hidden xl:block w-full">
                  {settingsLink}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </nav>
  );
}
