import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import {
  Home,
  Plus,
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
  const navigate = useNavigate();

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

  const handleCreateClick = () => {
    if (!isAuthenticated) openModal();
    else navigate('/create');
  };

  return (
    <nav
      className="flex flex-col h-full py-4 px-2 xl:px-3 justify-between select-none bg-transparent transition-colors"
      aria-label="Masaüstü Gezinme Menüsü"
    >
      <div className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/home' && location.pathname.startsWith(item.path + '/'));

          const linkContent = (
            <NavLink
              to={item.path}
              onClick={(e) => {
                if (item.protected && !isAuthenticated) {
                  e.preventDefault();
                  openModal();
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
              }`}
            >
              <div className="flex items-center justify-center shrink-0 w-5 h-5">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'
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
              <div className="hidden xl:block w-full">{linkContent}</div>
            </div>
          );
        })}

        {/* Create Post Action Button */}
        <div className="w-full my-2">
          <div className="xl:hidden w-full flex justify-center">
            <Tooltip content="Gönderi Oluştur" placement="right">
              <button
                type="button"
                onClick={handleCreateClick}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:hover:bg-slate-100 dark:active:bg-slate-200 text-white dark:text-slate-900 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Gönderi Oluştur"
              >
                <Plus className="w-5 h-5 stroke-[2.4]" />
              </button>
            </Tooltip>
          </div>
          <div className="hidden xl:block w-full">
            <button
              type="button"
              onClick={handleCreateClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:hover:bg-slate-100 dark:active:bg-slate-200 text-white dark:text-slate-900 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 text-sm font-semibold tracking-tight min-h-[44px]"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.4]" />
              <span>Gönderi Oluştur</span>
            </button>
          </div>
        </div>

        {/* Profile Nav Item */}
        <div className="w-full">
          {(() => {
            const isProfileActive =
              isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);
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
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isProfileActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
                }`}
              >
                <div className="flex items-center justify-center shrink-0 w-5 h-5">
                  {isAuthenticated && user ? (
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="xs"
                      className={`ring-1 ${
                        isProfileActive ? 'ring-blue-600 dark:ring-blue-400' : 'ring-slate-300 dark:ring-slate-700'
                      }`}
                    />
                  ) : (
                    <User className="w-5 h-5 stroke-[1.8]" />
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
                <div className="hidden xl:block w-full">{profileLink}</div>
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
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group w-full min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSettingsActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent'
                }`}
              >
                <div className="flex items-center justify-center shrink-0 w-5 h-5">
                  <Settings
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isSettingsActive ? 'stroke-[2.3]' : 'stroke-[1.8]'
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
                <div className="hidden xl:block w-full">{settingsLink}</div>
              </div>
            );
          })()}
        </div>
      </div>
    </nav>
  );
}
