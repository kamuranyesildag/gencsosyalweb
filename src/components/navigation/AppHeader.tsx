import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useLiveSearch } from '../../hooks/useLiveSearch';
import { Search, Bell, Mail, Plus, Menu, Hexagon, X, User } from 'lucide-react';
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
      className="sticky top-0 left-0 right-0 z-30 bg-white dark:bg-[#070A10] border-b border-slate-200/80 dark:border-white/[0.08] h-[60px] flex items-center justify-center transition-colors"
    >
      <div className="w-full max-w-7xl px-3 md:px-6 flex justify-between items-center h-full">
        {/* MOBILE VIEW (Hidden on md+) */}
        <div className="md:hidden flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Menüyü aç"
              className="flex items-center justify-center w-10 h-10 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161E2E] rounded-xl transition-all active:scale-[0.97]"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <Link to="/home" className="flex items-center gap-2 select-none group" aria-label="Genç Sosyal Ana Sayfa">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-blue-600 p-0.5 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 dark:group-hover:bg-blue-500 transition-colors">
                <Hexagon className="w-4 h-4 fill-transparent stroke-white stroke-[2]" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              aria-label="Arama"
              className="flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161E2E] rounded-xl transition-all active:scale-[0.97]"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/messages')}
                aria-label="Mesajlar"
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-[0.97] ${
                  isMessagesActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161E2E]'
                }`}
              >
                <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
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
          {/* 1. Brand */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1 -ml-1">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-blue-600 p-0.5 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 dark:group-hover:bg-blue-500 transition-colors">
              <Hexagon className="w-5 h-5 fill-transparent stroke-white stroke-[2]" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Genç Sosyal
            </span>
          </Link>

          {/* 2. Global Search */}
          <div className="flex-1 max-w-xl flex justify-center">
            <form onSubmit={handleSearch} className="w-full relative group" role="search">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                <Search className="h-4 w-4 stroke-[2]" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Genç Sosyal'de ara..."
                aria-label="Arama Yap"
                className="w-full pl-10 pr-10 py-2 h-10 bg-slate-100/70 dark:bg-[#161E2E]/70 hover:bg-slate-100 dark:hover:bg-[#161E2E] border border-slate-200/60 dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#0D121D] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-full text-sm font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all duration-150"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Aramayı temizle"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-[0.97]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Live Search Results */}
              <AnimatePresence>
                {searchFocused && query.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-[#0D121D] rounded-2xl shadow-lg border border-slate-200/80 dark:border-white/[0.08] overflow-hidden z-50"
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center text-sm text-slate-500">Aranıyor...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2 max-h-72 overflow-y-auto">
                        {searchResults.map((u: any) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              navigate(`/profile/${u.username}`);
                              setQuery('');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#161E2E] text-left transition-colors"
                          >
                            <Avatar url={u.avatarUrl} name={u.displayName || u.username} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {u.displayName || u.username}
                              </div>
                              <div className="text-xs text-slate-500 truncate">@{u.username}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">Sonuç bulunamadı</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* 3. Utility Actions */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  aria-label="Gönderi Oluştur"
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-all active:scale-[0.97]"
                >
                  <Plus className="w-5 h-5 stroke-[2]" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  aria-label="Mesajlar"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-[0.97] ${
                    isMessagesActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161E2E]'
                  }`}
                >
                  <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  aria-label="Bildirimler"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-[0.97] ${
                    isNotificationsActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161E2E]'
                  }`}
                >
                  <Bell className={`w-5 h-5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
                </button>
                <div className="ml-1 pl-2 border-l border-slate-200 dark:border-white/[0.08]">
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
