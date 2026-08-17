import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
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
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { dropdownVariants } from '../../lib/motion';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useAuthModalStore();
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
        className="flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
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
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100/80 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 select-none min-w-[44px] min-h-[44px]"
        aria-label="Kullanıcı Menüsü"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar
          url={user.avatarUrl}
          name={user.displayName || user.username}
          size="sm"
          status="online"
          className="ring-2 ring-indigo-500/20"
        />
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
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
            className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden z-50 origin-top-right focus:outline-none"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60">
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
                  className="ring-2 ring-white group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {user.displayName || user.username}
                    </p>
                    {user.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-100 shrink-0" aria-label="Doğrulanmış Hesap" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">@{user.username}</p>
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
                        ? 'text-amber-700 hover:bg-amber-50/70 hover:text-amber-800'
                        : 'text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                        item.isAdmin
                          ? 'text-amber-500 group-hover:text-amber-600'
                          : 'text-slate-400 group-hover:text-indigo-600'
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
            </div>

            {/* Logout Footer */}
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/40">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors min-h-[40px]"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

