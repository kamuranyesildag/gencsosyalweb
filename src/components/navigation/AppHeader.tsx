import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Menu, Search, Bell, Mail, Hexagon, X, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useThemeStore } from '../../context/useTheme';
import { useLiveSearch } from "../../hooks/useLiveSearch";
import { Avatar } from "../ui/Avatar";
import { motion, AnimatePresence } from "motion/react";
import { UserMenu } from './UserMenu';
import { Button } from '../ui/Button';

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { results: searchResults, loading: searchLoading } = useLiveSearch(query, "users");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const isNotificationsActive = location.pathname === '/notifications';
  const isMessagesActive = location.pathname === '/messages';

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800/80 h-14 md:h-[60px] flex items-center justify-center transition-colors">
      <div className="w-full max-w-7xl px-4 sm:px-6 flex justify-between items-center h-full">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="Menüyü aç"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
          
          <Link 
            to="/home" 
            className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded-xl p-1 -ml-1 select-none"
            aria-label="Genç Sosyal Ana Sayfa"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-xl bg-slate-900 dark:bg-indigo-600 p-0.5 group-hover:bg-slate-800 dark:group-hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center text-white">
              <Hexagon className="w-4 h-4 md:w-6 md:h-6 fill-transparent stroke-white stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
                Genç Sosyal
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Search Box (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-6">
          <form onSubmit={handleSearch} className="w-full relative group" role="search">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 dark:text-slate-100 dark:group-focus-within:text-white transition-colors">
              <Search className="h-4 w-4 stroke-[2.2]" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Genç Sosyal'de ara..."
              aria-label="Genç Sosyal'de ara"
              className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-700 rounded-full text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 transition-all duration-200 h-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Aramayı temizle"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <AnimatePresence>
              {searchFocused && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aranıyor...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2 max-h-72 overflow-y-auto">
                      {searchResults.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            navigate(`/profile/${user.username}`);
                            setQuery('');
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.displayName || user.username}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Sonuç bulunamadı</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
          {/* Quick Theme Toggle Button (Desktop & Mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            title={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            className="flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
          >
            {actualTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[2]" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications Button */}
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className={`hidden md:flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                  isNotificationsActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Bildirimler"
              >
                <Bell className={`w-5 h-5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
              </button>
              
              {/* Messages Button (Visible on desktop header) */}
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className={`hidden md:flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                  isMessagesActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Mesajlar"
              >
                <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
              </button>

              {/* Profile / User Menu */}
              <div className="hidden md:block ml-1">
                <UserMenu />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex"
              >
                Giriş Yap
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Kayıt Ol
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
