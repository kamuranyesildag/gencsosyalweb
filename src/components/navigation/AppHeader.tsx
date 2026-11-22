import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
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
  Compass,
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
  const { isAuthenticated } = useAuthStore();
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

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

  // 2. Mark as read based on active page & close mobile search on navigation
  useEffect(() => {
    setMobileSearchOpen(false);
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
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === 'Escape') {
        if (searchFocused) {
          setSearchFocused(false);
          searchInputRef.current?.blur();
        }
        if (mobileSearchOpen) {
          setMobileSearchOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused, mobileSearchOpen]);

  // 4. Click outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (
        mobileSearchOpen &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
    }
  }, [mobileSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
      setSearchFocused(false);
      setMobileSearchOpen(false);
    } else {
      navigate('/explore');
      setSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  const isNotificationsActive = location.pathname === '/notifications';
  const isMessagesActive = location.pathname === '/messages';
  const isExploreActive = location.pathname.startsWith('/explore');

  // Dynamic context label for active section
  const getContextLabel = () => {
    const p = location.pathname;
    if (p.startsWith('/explore')) return 'Keşfet';
    if (p.startsWith('/projects')) return 'Projeler';
    if (p.startsWith('/communities')) return 'Topluluklar';
    if (p.startsWith('/teams')) return 'Takımlar';
    if (p.startsWith('/teknofest')) return 'Teknofest';
    if (p.startsWith('/notifications')) return 'Bildirimler';
    if (p.startsWith('/messages')) return 'Mesajlar';
    if (p.startsWith('/bookmarks')) return 'Kaydedilenler';
    if (p.startsWith('/settings')) return 'Ayarlar';
    if (p.startsWith('/admin')) return 'Yönetim';
    if (p.startsWith('/create')) return 'Yeni Gönderi';
    return null;
  };

  const contextLabel = getContextLabel();

  const renderSearchResultsDropdown = () => (
    <AnimatePresence>
      {(searchFocused || mobileSearchOpen) && query.trim().length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-[#0B1329]/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-white/[0.10] overflow-hidden z-50"
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
                    setMobileSearchOpen(false);
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

              <button
                type="button"
                onClick={() => {
                  navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
                  setSearchFocused(false);
                  setMobileSearchOpen(false);
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
  );

  return (
    <header
      role="banner"
      className="sticky top-0 left-0 right-0 z-40 h-[60px] bg-white/88 dark:bg-[#080E1A]/88 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center transition-colors"
    >
      {/* Subtle Top Ambient Accent Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/45 to-transparent"
      />

      <div className="w-full max-w-7xl px-3 sm:px-4 md:px-6 flex items-center justify-between h-full relative">
        {/* ===================== MOBILE HEADER ===================== */}
        <div
          ref={mobileSearchContainerRef}
          className="md:hidden flex items-center justify-between w-full h-full relative"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileSearchOpen ? (
              <motion.form
                key="mobile-search-bar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 w-full relative"
                role="search"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={mobileSearchInputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Genç Sosyal'de kişi veya konu ara..."
                    aria-label="Genç Sosyal içinde ara"
                    className="w-full h-10 pl-9 pr-9 rounded-full bg-slate-100/90 dark:bg-white/[0.07] border border-blue-500/50 dark:border-blue-400/40 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        mobileSearchInputRef.current?.focus();
                      }}
                      aria-label="Aramayı temizle"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
                >
                  Vazgeç
                </button>
                {renderSearchResultsDropdown()}
              </motion.form>
            ) : (
              <motion.div
                key="mobile-standard-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="flex items-center justify-between w-full h-full"
              >
                {/* Left Actions: Menu Trigger + Quick Search */}
                <div className="flex items-center gap-1 shrink-0 z-10">
                  <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Gezinme menüsünü aç"
                    className="flex items-center justify-center w-9 h-9 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    <Menu className="w-5 h-5 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileSearchOpen(true)}
                    aria-label="Arama aç"
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                      isExploreActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <Search className="w-4.5 h-4.5 stroke-[2]" />
                  </button>
                </div>

                {/* Center Brand Wordmark (No GS Box, "Sosyal" in Blue) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto">
                  <Link
                    to="/home"
                    aria-label="Genç Sosyal Ana Sayfa"
                    className="group flex flex-col items-center justify-center select-none px-2 py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <span className="text-[19px] font-black tracking-[-0.03em] leading-none text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Genç</span>
                      <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors">
                        Sosyal
                      </span>
                    </span>
                    {contextLabel && (
                      <span className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 leading-none mt-1">
                        {contextLabel}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Right Mobile Actions */}
                <div className="flex items-center gap-1 shrink-0 z-10">
                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate('/messages')}
                        aria-label="Mesajlar"
                        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                          isMessagesActive
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 2L11 13" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                        {unreadMessages > 0 && (
                          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-[9.5px] font-extrabold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#080E1A]">
                            {unreadMessages > 9 ? '9+' : unreadMessages}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/notifications')}
                        aria-label="Bildirimler"
                        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                          isNotificationsActive
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <Bell className="w-5 h-5 stroke-[1.9]" />
                        {unreadNotifications > 0 && (
                          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#080E1A]" />
                        )}
                      </button>

                      <div className="ml-0.5">
                        <UserMenu />
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="ml-1 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Giriş Yap
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================== DESKTOP HEADER ===================== */}
        <div className="hidden md:grid md:grid-cols-3 items-center w-full h-full gap-4">
          {/* 1. Left Zone: Global Search + Active Section Tag */}
          <div className="flex items-center gap-3 min-w-0 justify-self-start w-full max-w-xs lg:max-w-sm">
            <div ref={searchContainerRef} className="w-full relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative group" role="search">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                  <Search className="h-4 w-4 stroke-[1.9]" />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Kişi, proje veya konu ara..."
                  aria-label="Arama Yap"
                  className="w-full pl-9 pr-12 py-1.5 h-9.5 bg-slate-100/75 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#0B1329] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-full text-[13px] font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
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
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-white/[0.08] border border-slate-300/40 dark:border-white/[0.08]">
                      ⌘K
                    </kbd>
                  </div>
                )}

                {renderSearchResultsDropdown()}
              </form>
            </div>
          </div>

          {/* 2. Center Zone: Iconic Centered "Genç Sosyal" Wordmark (No GS Box) */}
          <div className="flex items-center justify-center justify-self-center">
            <Link
              to="/home"
              aria-label="Genç Sosyal Ana Sayfa"
              className="group relative flex flex-col items-center justify-center select-none px-4 py-1.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] lg:text-[23px] font-black tracking-[-0.035em] text-slate-900 dark:text-white leading-none transition-colors">
                  Genç
                </span>
                <span className="text-[22px] lg:text-[23px] font-black tracking-[-0.035em] text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 leading-none transition-colors">
                  Sosyal
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-[2px] w-4 rounded-full bg-blue-600/70 dark:bg-blue-400/70 group-hover:w-7 transition-all duration-300" />
                {contextLabel ? (
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400 leading-none">
                    {contextLabel}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 leading-none">
                    Üretici Ağı
                  </span>
                )}
                <span className="h-[2px] w-4 rounded-full bg-blue-600/70 dark:bg-blue-400/70 group-hover:w-7 transition-all duration-300" />
              </div>
            </Link>
          </div>

          {/* 3. Right Zone: Modern Quick Action Bar */}
          <div className="flex items-center justify-end gap-1.5 lg:gap-2 justify-self-end shrink-0">
            {/* Explore quick shortcut on desktop */}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              aria-label="Keşfet"
              title="Keşfet"
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors active:scale-95 cursor-pointer ${
                isExploreActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Compass className={`w-4.5 h-4.5 ${isExploreActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </button>

            {/* Quick Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={actualTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              title={actualTheme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors active:scale-95 cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.3]" />
                  <span className="hidden xl:inline">Paylaş</span>
                </button>

                {/* Direct Messages Icon with Badge */}
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  aria-label="Mesajlar"
                  title="Mesajlar"
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors active:scale-95 cursor-pointer ${
                    isMessagesActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Mail className={`w-4.5 h-4.5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#080E1A] shadow-xs">
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
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors active:scale-95 cursor-pointer ${
                    isNotificationsActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Bell className={`w-4.5 h-4.5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#080E1A] shadow-xs">
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
