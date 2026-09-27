import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useLiveSearch } from '../../hooks/useLiveSearch';
import { Search, Bell, Mail, Plus, Menu, X, Sparkles } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { UserMenu } from './UserMenu';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { results: searchResults, loading: searchLoading } = useLiveSearch(query, 'users');

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
    <header
      className="sticky top-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070A10]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] h-[60px] flex items-center justify-center transition-colors"
    >
      <div className="w-full max-w-7xl px-3 md:px-6 flex justify-between items-center h-full">
        {/* MOBILE VIEW (Hidden on md+) */}
        <div className="md:hidden flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Menüyü aç"
              className="flex items-center justify-center w-10 h-10 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <Link to="/home" className="flex items-center gap-2 select-none group" aria-label="Genç Sosyal Ana Sayfa">
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                {/* Custom Genç Sosyal geometric youth mark */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Genç Sosyal
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              aria-label="Arama"
              className="flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors active:scale-95"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/messages')}
                aria-label="Mesajlar"
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors active:scale-95 ${
                  isMessagesActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="ml-1 px-3">
                Giriş
              </Button>
            )}
          </div>
        </div>

        {/* DESKTOP VIEW (Hidden on mobile) */}
        <div className="hidden md:flex items-center justify-between w-full h-full gap-4 lg:gap-8">
          {/* 1. Brand Identity */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 shrink-0 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1 -ml-1"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-102">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                Genç Sosyal
              </span>
              <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">
                Genç Üretici Platformu
              </span>
            </div>
          </Link>

          {/* 2. Global Search with Shortcut Hint */}
          <div className="flex-1 max-w-lg flex justify-center">
            <form onSubmit={handleSearch} className="w-full relative group" role="search">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                <Search className="h-4 w-4 stroke-[1.8]" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Genç Sosyal'de kişi veya konu ara..."
                aria-label="Arama Yap"
                className="w-full pl-10 pr-12 py-2 h-10 bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#0D121D] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl text-sm font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Aramayı temizle"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-[0.97]"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-white/[0.08] border border-slate-300/40 dark:border-white/[0.08]">
                    /
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
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">Aranıyor...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2 max-h-72 overflow-y-auto">
                        <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Kişiler
                        </div>
                        {searchResults.map((u: any) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              navigate(`/profile/${u.username}`);
                              setQuery('');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                          >
                            <Avatar url={u.avatarUrl} name={u.displayName || u.username} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {u.displayName || u.username}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{u.username}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">Sonuç bulunamadı</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* 3. Utility Actions */}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  aria-label="Gönderi Oluştur"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors active:scale-95 font-semibold text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  <span className="hidden xl:inline">Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  aria-label="Mesajlar"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                    isMessagesActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  aria-label="Bildirimler"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                    isNotificationsActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Bell className={`w-5 h-5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                </button>
                <div className="ml-1 pl-2 border-l border-slate-200/80 dark:border-white/[0.08]">
                  <UserMenu />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Giriş Yap
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
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
