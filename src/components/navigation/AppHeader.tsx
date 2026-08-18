import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Search, Bell, Mail, Hexagon, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { UserMenu } from './UserMenu';
import { Button } from '../ui/Button';

export function AppHeader() {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

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
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-14 md:h-16 flex items-center justify-center transition-colors">
      <div className="w-full max-w-7xl px-4 sm:px-6 flex justify-between items-center h-full">
        {/* Left: Logo */}
        <Link 
          to="/home" 
          className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-xl p-1 -ml-1 select-none"
          aria-label="Genç Sosyal Ana Sayfa"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 group-hover:scale-105 transition-all duration-200 flex items-center justify-center text-white">
            <Hexagon className="w-4 h-4 md:w-6 md:h-6 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-black tracking-tight text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
              Genç Sosyal
            </span>
          </div>
        </Link>

        {/* Middle: Search Box (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-6">
          <form onSubmit={handleSearch} className="w-full relative group" role="search">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search className="h-4 w-4 stroke-[2.2]" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Genç Sosyal'de ara..."
              aria-label="Genç Sosyal'de ara"
              className="w-full pl-10 pr-10 py-2 bg-slate-100/80 hover:bg-slate-100 border border-transparent hover:border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 h-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Aramayı temizle"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            aria-label="Keşfet ve Ara"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications Button */}
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                  isNotificationsActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
                aria-label="Bildirimler"
              >
                <Bell className={`w-5 h-5 ${isNotificationsActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
              </button>
              
              {/* Messages Button (Visible on mobile & desktop header) */}
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                  isMessagesActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
                aria-label="Mesajlar"
              >
                <Mail className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.2]' : 'stroke-[2]'}`} />
              </button>

              {/* Profile / User Menu */}
              <div className="ml-1">
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

