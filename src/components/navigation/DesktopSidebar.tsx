import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useUnreadStore } from '../../context/useUnreadStore';
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
  Trophy,
  Gamepad2,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  protected: boolean;
  badge?: number;
}

export function DesktopSidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { unreadNotifications, unreadMessages } = useUnreadStore();
  const location = useLocation();
  const navigate = useNavigate();

  const primaryGroup: NavItem[] = [
    { name: 'Ana Sayfa', path: '/home', icon: Home, protected: false },
    { name: 'Keşfet', path: '/explore', icon: Search, protected: false },
    { name: 'Bildirimler', path: '/notifications', icon: Bell, protected: true, badge: unreadNotifications },
    { name: 'Mesajlar', path: '/messages', icon: Mail, protected: true, badge: unreadMessages },
  ];

  const produceGroup: NavItem[] = [
    { name: 'Genç Quiz', path: '/quiz', icon: Gamepad2, protected: false },
    { name: '19 Mayıs Gençlik Ligi', path: '/youth-league', icon: Trophy, protected: false },
    { name: 'Projeler', path: '/projects', icon: Rocket, protected: false },
    { name: 'Topluluklar', path: '/communities', icon: Users, protected: false },
  ];

  const personalGroup: NavItem[] = [
    { name: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark, protected: true },
    { name: 'Ayarlar', path: '/settings', icon: Settings, protected: true },
  ];

  if (user?.role === 'ADMIN') {
    personalGroup.push({ name: 'Admin Paneli', path: '/admin', icon: ShieldAlert, protected: true });
  }

  const profilePath = isAuthenticated && user ? `/profile/${user.username}` : '#';

  const handleCreateClick = () => {
    if (!isAuthenticated) openModal();
    else navigate('/create');
  };

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/home' && location.pathname.startsWith(item.path + '/'));

    const content = (
      <NavLink
        to={item.path}
        onClick={(e) => {
          if (item.protected && !isAuthenticated) {
            e.preventDefault();
            openModal();
          }
        }}
        aria-current={isActive ? 'page' : undefined}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group w-full min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          isActive
            ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/30'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-100 font-medium'
        }`}
      >
        <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
          <Icon
            className={`w-4.5 h-4.5 transition-transform duration-150 group-hover:scale-105 ${
              isActive ? 'stroke-[2.2]' : 'stroke-[1.75]'
            }`}
          />
          {item.badge && item.badge > 0 ? (
            <span className="xl:hidden absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#070A10]" />
          ) : null}
        </div>
        <span className="hidden xl:inline text-[13.5px] tracking-tight truncate">{item.name}</span>
        {item.badge && item.badge > 0 ? (
          <span className="hidden xl:inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-600 text-white ml-auto">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : isActive ? (
          <div className="hidden xl:block absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        ) : null}
      </NavLink>
    );

    return (
      <div key={item.path} className="w-full">
        <div className="xl:hidden w-full flex justify-center">
          <Tooltip content={item.name} placement="right">
            {content}
          </Tooltip>
        </div>
        <div className="hidden xl:block w-full">{content}</div>
      </div>
    );
  };

  const isProfileActive =
    isAuthenticated && user && location.pathname.startsWith(`/profile/${user.username}`);

  return (
    <nav
      className="flex flex-col h-full py-4 px-2 xl:px-3 justify-between select-none bg-transparent transition-colors overflow-y-auto no-scrollbar"
      aria-label="Masaüstü Gezinme Menüsü"
    >
      <div className="flex flex-col gap-4 w-full">
        {/* GROUP 1: ANA SAYFA */}
        <div className="w-full">
          <div className="hidden xl:block px-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Akış & İletişim
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            {primaryGroup.map(renderNavLink)}
          </div>
        </div>

        {/* GROUP 2: ÜRET (Projeler & Topluluklar) */}
        <div className="w-full pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
          <div className="hidden xl:block px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Üretim & Topluluk
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            {produceGroup.map(renderNavLink)}
          </div>
        </div>

        {/* CREATE POST PRIMARY CTA */}
        <div className="w-full my-1">
          <div className="xl:hidden w-full flex justify-center">
            <Tooltip content="Gönderi Oluştur" placement="right">
              <button
                type="button"
                onClick={handleCreateClick}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-500/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
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
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-500/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 text-sm font-semibold tracking-tight min-h-[42px] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.4]" />
              <span>Gönderi Oluştur</span>
            </button>
          </div>
        </div>

        {/* GROUP 3: KİŞİSEL */}
        <div className="w-full pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
          <div className="hidden xl:block px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Kişisel
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            {/* Profile Nav Item */}
            <div className="w-full">
              {(() => {
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
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group w-full min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isProfileActive
                        ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-center shrink-0 w-5 h-5">
                      {isAuthenticated && user ? (
                        <Avatar
                          url={user.avatarUrl}
                          name={user.displayName || user.username}
                          size="xs"
                          className={`w-5 h-5 ring-1 ${
                            isProfileActive ? 'ring-blue-600 dark:ring-blue-400' : 'ring-slate-300 dark:ring-slate-700'
                          }`}
                        />
                      ) : (
                        <User className="w-4.5 h-4.5 stroke-[1.8]" />
                      )}
                    </div>
                    <span className="hidden xl:inline text-[13.5px] tracking-tight truncate">Profilim</span>
                    {isProfileActive && (
                      <div className="hidden xl:block absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
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

            {personalGroup.map(renderNavLink)}
          </div>
        </div>
      </div>

      {/* USER PROFILE FOOTER CARD (AUTHENTIC PLATFORM IDENTITY) */}
      {isAuthenticated && user && (
        <div className="w-full pt-3 mt-4 border-t border-slate-200/70 dark:border-white/[0.08]">
          <Link
            to={profilePath}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors group w-full text-left"
          >
            <Avatar
              url={user.avatarUrl}
              name={user.displayName || user.username}
              size="sm"
              className="w-8.5 h-8.5 ring-1 ring-slate-200 dark:ring-white/[0.1] shrink-0"
            />
            <div className="hidden xl:flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user.displayName || user.username}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                @{user.username}
              </span>
            </div>
          </Link>
        </div>
      )}
    </nav>
  );
}
