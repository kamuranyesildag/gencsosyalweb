import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import {
  Mail,
  Bookmark,
  Users,
  Settings,
  User,
  LogOut,
  ShieldAlert,
  Rocket,
  Bell,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { backdropVariants, bottomSheetVariants } from '../../lib/motion';

export function MoreMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    isAdmin?: boolean;
  }

  const navItems: NavItem[] = [
    { name: 'Profilim', path: `/profile/${user?.username}`, icon: User },
    { name: 'Mesajlar', path: '/messages', icon: Mail },
    { name: 'Projeler', path: '/projects', icon: Rocket },
    { name: 'Topluluklar', path: '/communities', icon: Users },
    { name: 'Kaydedilenler', path: '/bookmarks', icon: Bookmark },
    { name: 'Ayarlar', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Paneli', path: '/admin', icon: ShieldAlert, isAdmin: true });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          <motion.div
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-sheet-title"
            className="relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl border-t border-slate-200 dark:border-slate-800/90 shadow-2xl pb-[env(safe-area-inset-bottom,20px)] overflow-hidden max-h-[88vh] flex flex-col"
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-3 shrink-0" />

            <div className="px-5 sm:px-6 pb-6 pt-1">
              {/* User Header */}
              <div className="flex items-center gap-3.5 mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/70">
                <Avatar
                  url={user?.avatarUrl}
                  name={user?.displayName || user?.username}
                  size="md"
                  status="online"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 id="more-sheet-title" className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.displayName || user?.username}
                    </h3>
                    {user?.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-slate-100 fill-slate-100 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">@{user?.username}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Kapat"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Grid */}
              <div className="grid grid-cols-4 gap-y-4 gap-x-2 mb-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all group select-none min-h-[44px] ${
                          isActive
                            ? 'text-slate-900 dark:text-slate-100 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-md shadow-slate-500/20 scale-105'
                                : item.isAdmin
                                ? 'bg-amber-50 text-amber-600 border border-amber-200/70 group-hover:bg-amber-100'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 group-hover:bg-slate-200/80'
                            }`}
                          >
                            <Icon className={`w-5.5 h-5.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                          </div>
                          <span className="text-[11px] font-medium text-center truncate max-w-full leading-tight">
                            {item.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl text-rose-600 font-semibold bg-rose-50 hover:bg-rose-100/80 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-5 h-5 stroke-[2]" />
                  <span>Hesaptan Çıkış Yap</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
