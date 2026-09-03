import { VerifiedBadge } from "../VerifiedBadge";
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useThemeStore } from '../../context/useTheme';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  LogOut,
  Settings,
  User,
  Bookmark,
  Users,
  Rocket,
  Mail,
  Bell,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { dropdownVariants } from '../../lib/motion';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isAuthenticated || !user) {
    return (
      <button 
        type="button"
        onClick={() => openModal()}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        aria-label="Giriş Yap"
      >
        <User className="w-5 h-5" />
      </button>
    );
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  interface MenuItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    isAdmin?: boolean;
  }

  const menuItems: MenuItem[] = [
    { label: 'Profilim', path: `/profile/${user.username}`, icon: User },
    { label: 'Mesajlar', path: '/messages', icon: Mail },
    { label: 'Bildirimler', path: '/notifications', icon: Bell },
    { label: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark },
    { label: 'Topluluklar', path: '/communities', icon: Users },
    { label: 'Projeler', path: '/projects', icon: Rocket },
    { label: 'Ayarlar', path: '/settings', icon: Settings },
  ];

  if (user.role === 'ADMIN') {
    menuItems.push({ label: 'Admin Paneli', path: '/admin', icon: ShieldAlert, isAdmin: true });
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:focus-visible:ring-white/20 select-none min-w-[44px] min-h-[44px]"
        aria-label="Kullanıcı Menüsü"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar
          url={user.avatarUrl}
          name={user.displayName || user.username}
          size="sm"
          status="online"
          className="ring-2 ring-slate-900/10 dark:ring-white/10"
        />
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900 dark:text-white' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-800 overflow-hidden z-50 origin-top-right focus:outline-none transition-colors"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
              <Link
                to={`/profile/${user.username}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  url={user.avatarUrl}
                  name={user.displayName || user.username}
                  size="md"
                  status="online"
                  className="ring-2 ring-white dark:ring-slate-800 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {user.displayName || user.username}
                    </p>
                    {user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">@{user.username}</p>
                </div>
              </Link>
              {user.role === 'ADMIN' && (
                <div className="mt-2.5 flex items-center gap-1.5">
                  <Badge variant="primary" size="sm" dot>
                    Yönetici
                  </Badge>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1.5 max-h-[55vh] overflow-y-auto scrollbar-thin">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors group ${
                      item.isAdmin
                        ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                        item.isAdmin
                          ? 'text-amber-500 group-hover:text-amber-600'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.isAdmin && (
                      <Badge variant="warning" size="sm">
                        Admin
                      </Badge>
                    )}
                  </Link>
                );
              })}

              {/* Theme Toggle Inside Dropdown */}
              <button
                type="button"
                onClick={() => toggleTheme()}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  {actualTheme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  )}
                  <span>{actualTheme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}</span>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-500 dark:text-slate-400">
                  {actualTheme === 'dark' ? 'Koyu' : 'Açık'}
                </span>
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 rounded-xl transition-colors min-h-[40px]"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-500 dark:text-rose-400" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
