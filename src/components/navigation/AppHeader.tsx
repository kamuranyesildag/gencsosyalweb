import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useThemeStore } from '../../context/useTheme';
import { useUnreadStore } from '../../context/useUnreadStore';
import { useLiveSearch } from '../../hooks/useLiveSearch';
import {
  Search,
  Bell,
  Mail,
  Plus,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../VerifiedBadge';
import { UserMenu } from './UserMenu';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const {
    unreadNotifications,
    unreadMessages,
    fetchUnread,
    markNotificationsRead,
    markMessagesRead,
  } = useUnreadStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { results: searchResults, loading: searchLoading } = useLiveSearch(query, 'users');

  // 1. Fetch unread counts on mount and poll
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      const onFocus = () => fetchUnread();
      window.addEventListener('focus', onFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', onFocus);
      };
    }
  }, [isAuthenticated, fetchUnread]);

  // 2. Mark as read based on active page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      markNotificationsRead();
    } else if (location.pathname.startsWith('/messages')) {
      markMessagesRead();
    }
  }, [location.pathname, markNotificationsRead, markMessagesRead]);

  // 3. Global keyboard shortcut listener for search (/ or Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === 'Escape' && searchFocused) {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  // 4. Click outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
      setSearchFocused(false);
    } else {
      navigate('/explore');
      setSearchFocused(false);
    }
  };

  const isNotificationsActive = location.pathname === '/notifications';
  const isMessagesActive = location.pathname === '/messages';

  // Dynamic context label for desktop header
  const getContextLabel = () => {
    const p = location.pathname;
    if (p.startsWith('/explore')) return 'Keşfet';
    if (p.startsWith('/projects')) return 'Projeler';
    if (p.startsWith('/communities')) return 'Topluluklar';
    if (p.startsWith('/notifications')) return 'Bildirimler';
    if (p.startsWith('/messages')) return 'Mesajlar';
    if (p.startsWith('/bookmarks')) return 'Kaydedilenler';
    if (p.startsWith('/settings')) return 'Ayarlar';
    if (p.startsWith('/admin')) return 'Yönetim';
    if (p.startsWith('/create')) return 'Yeni Gönderi';
    return null;
  };

  const contextLabel = getContextLabel();

  return (
    <header
      role="banner"
      className="sticky top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] h-[60px] flex items-center justify-center transition-colors"
    >
      <div className="w-full max-w-7xl px-3 sm:px-4 md:px-6 flex justify-between items-center h-full gap-2 md:gap-4">
        {/* ===================== MOBILE HEADER ===================== */}
        <div className="md:hidden flex items-center justify-between w-full h-full">
          {/* Left: Drawer Trigger + Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Gezinme menüsünü aç"
              className="relative flex items-center justify-center w-10 h-10 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95 cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#070A10]" />
              )}
            </button>

            <Link
              to="/home"
              className="flex items-center gap-2 select-none group"
              aria-label="Genç Sosyal Ana Sayfa"
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Genç Sosyal
              </span>
            </Link>
          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              aria-label="Arama"
              className="flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95 cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {/* Direct Theme Switcher on Mobile */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95 cursor-pointer"
            >
              {actualTheme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 stroke-[1.8] text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 stroke-[1.8] text-slate-600" />
              )}
            </button>

            {/* Messages Icon on Mobile */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/messages')}
                aria-label="Mesajlar"
                className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                  isMessagesActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Mail className="w-4.5 h-4.5 stroke-[1.8]" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#070A10]">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            )}

            {/* User Menu or Login on Mobile */}
            {isAuthenticated ? (
              <div className="ml-0.5">
                <UserMenu />
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
              >
                Giriş
              </Button>
            )}
          </div>
        </div>

        {/* ===================== DESKTOP HEADER ===================== */}
        <div className="hidden md:flex items-center justify-between w-full h-full gap-4 lg:gap-6">
          {/* 1. Brand Identity & Context Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/home"
              className="flex items-center gap-2.5 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1 -ml-1 transition-transform active:scale-[0.98]"
              aria-label="Genç Sosyal Ana Sayfa"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-102">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    Genç Sosyal
                  </span>
                  {contextLabel && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900/40 ml-0.5 animate-fadeIn">
                      {contextLabel}
                    </span>
                  )}
                </div>
                <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">
                  Genç Üretici Platformu
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Global Search with Keyboard Shortcut (Cmd+K / /) */}
          <div ref={searchContainerRef} className="flex-1 max-w-md lg:max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative group" role="search">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                <Search className="h-4 w-4 stroke-[1.8]" />
              </div>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Genç Sosyal'de kişi veya konu ara..."
                aria-label="Arama Yap"
                className="w-full pl-10 pr-12 py-2 h-10 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#0D121D] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl text-sm font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Aramayı temizle"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-[0.95] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-white/[0.08] border border-slate-300/40 dark:border-white/[0.08]">
                    ⌘K
                  </kbd>
                </div>
              )}

              {/* Live Search Results Dropdown */}
              <AnimatePresence>
                {searchFocused && query.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-[#0D121D] rounded-2xl shadow-xl border border-slate-200/90 dark:border-white/[0.09] overflow-hidden z-50"
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        Aranıyor...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2 max-h-72 overflow-y-auto">
                        <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Kişiler
                        </div>
                        {searchResults.map((u: any) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              navigate(`/profile/${u.username}`);
                              setQuery('');
                              setSearchFocused(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                          >
                            <Avatar
                              url={u.avatarUrl}
                              name={u.displayName || u.username}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {u.displayName || u.username}
                                </span>
                                {u.isVerified && (
                                  <VerifiedBadge iconClassName="w-3.5 h-3.5 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                @{u.username}
                              </div>
                            </div>
                          </button>
                        ))}

                        {/* View all results button */}
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
                            setSearchFocused(false);
                          }}
                          className="flex items-center justify-between w-full px-4 py-2.5 mt-1 border-t border-slate-100 dark:border-white/[0.06] text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                        >
                          <span>&quot;{query}&quot; için tüm sonuçları gör</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        Sonuç bulunamadı
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* 3. Utility Actions (Modern Quick Action Bar) */}
          <div className="flex items-center justify-end gap-1.5 lg:gap-2 shrink-0">
            {/* Quick Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              title={actualTheme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors active:scale-95 cursor-pointer"
            >
              {actualTheme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 stroke-[1.8] text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4.5 h-4.5 stroke-[1.8] text-slate-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Quick Post Creator Button */}
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  aria-label="Yeni Gönderi Oluştur"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/40 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  <span className="hidden xl:inline">Yeni Gönderi</span>
                </button>

                {/* Direct Messages Icon with Badge */}
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  aria-label="Mesajlar"
                  title="Mesajlar"
                  className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                    isMessagesActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Mail className={`w-4.5 h-4.5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#070A10] shadow-xs">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>

                {/* Notifications Icon with Badge */}
                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  aria-label="Bildirimler"
                  title="Bildirimler"
                  className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                    isNotificationsActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Bell className={`w-4.5 h-4.5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#070A10] shadow-xs">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* User Menu Avatar Dropdown */}
                <div className="ml-1 pl-2 border-l border-slate-200/80 dark:border-white/[0.08]">
                  <UserMenu />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="rounded-xl font-semibold text-xs"
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="rounded-xl font-semibold text-xs shadow-xs"
                >
                  Kayıt Ol
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
