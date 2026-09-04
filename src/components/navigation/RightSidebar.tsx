import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../../context/useAuth';
import { useAuthModalStore } from '../../context/useAuthModal';
import { SuggestedUsers } from '../SuggestedUsers';
import { ProfileCompletionCard } from '../ProfileCompletionCard';
import { DailyQuestCard } from '../DailyQuestCard';
import { QuickPollCard } from '../QuickPollCard';
import { LeaderboardCard } from '../LeaderboardCard';
import { fetchApi } from '../../lib/api';
import { Users, Hash, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Community {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
}

interface TrendingTag {
  name: string;
  normalizedName: string;
  count: number;
}

export function RightSidebar() {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  // Communities State
  const [popularCommunities, setPopularCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState<boolean>(true);
  const [communitiesError, setCommunitiesError] = useState<boolean>(false);

  const loadCommunities = async () => {
    setCommunitiesLoading(true);
    setCommunitiesError(false);
    try {
      const res = await fetchApi('/communities');
      const json = await res.json();
      if (json.success) {
        setPopularCommunities((json.data || []).slice(0, 3));
      } else {
        setCommunitiesError(true);
      }
    } catch {
      setCommunitiesError(true);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  // Trending Hashtags State
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [trendingLoading, setTrendingLoading] = useState<boolean>(true);
  const [trendingError, setTrendingError] = useState<boolean>(false);

  const loadTrending = async () => {
    setTrendingLoading(true);
    setTrendingError(false);
    try {
      const res = await fetchApi('/hashtags/trending/top');
      const json = await res.json();
      if (json.success) {
        setTrendingTags(json.data || []);
      } else {
        setTrendingError(true);
      }
    } catch {
      setTrendingError(true);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Unauthenticated CTA Card */}
      {!isAuthenticated && (
        <div className="bg-white dark:bg-[#0D121D] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
            Genç Sosyal'e Katıl
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mb-4">
            Genç geliştiriciler, tasarımcılar ve üreticilerle tanış, projelerini toplulukla paylaş.
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => openModal()}
            className="rounded-xl font-semibold shadow-xs"
          >
            Giriş Yap / Kaydol
          </Button>
        </div>
      )}

      {/* 2. Primary: Suggested Users (Who to follow) */}
      {isAuthenticated && (
        <section
          aria-labelledby="suggested-users-heading"
          className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="suggested-users-heading"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Kimi Takip Etmeli
            </h3>
            <Link
              to="/explore"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Tümü
            </Link>
          </div>
          <SuggestedUsers />
        </section>
      )}

      {/* 3. Secondary: Trending Topics / Hashtags */}
      <section
        aria-labelledby="trending-heading"
        className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            id="trending-heading"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"
          >
            <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Gündemdeki Konular
          </h3>
        </div>

        {trendingLoading ? (
          <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Gündem yükleniyor...
          </div>
        ) : trendingError ? (
          <div className="py-3 px-2 flex items-center justify-between text-xs text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Gündem alınamadı</span>
            </div>
            <button
              type="button"
              onClick={loadTrending}
              aria-label="Yeniden dene"
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        ) : trendingTags.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Henüz gündem konusu yok
          </div>
        ) : (
          <div className="space-y-1">
            {trendingTags.slice(0, 5).map((tag) => (
              <Link
                key={tag.name}
                to={`/hashtags/${tag.name}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#161E2E] transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    #{tag.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{tag.count} gönderi</p>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Communities */}
      <section
        aria-labelledby="popular-communities-heading"
        className="bg-white dark:bg-[#0D121D] rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            id="popular-communities-heading"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Topluluklar
          </h3>
          <Link
            to="/communities"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Keşfet
          </Link>
        </div>

        {communitiesLoading ? (
          <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Topluluklar yükleniyor...
          </div>
        ) : communitiesError ? (
          <div className="py-3 px-2 flex items-center justify-between text-xs text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Topluluklar alınamadı</span>
            </div>
            <button
              type="button"
              onClick={loadCommunities}
              aria-label="Yeniden dene"
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        ) : popularCommunities.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Henüz topluluk bulunmuyor
          </div>
        ) : (
          <div className="space-y-2">
            {popularCommunities.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/communities/${c.slug}`)}
                className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#161E2E]/60 hover:bg-slate-100 dark:hover:bg-[#161E2E] border border-slate-200/60 dark:border-white/[0.06] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {c.memberCount || 0} üye
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 5. Tertiary: Profile Completion */}
      {isAuthenticated && <ProfileCompletionCard />}

      {/* 6. Tertiary: Quest & Leaderboard & Poll */}
      {isAuthenticated && <DailyQuestCard />}
      <LeaderboardCard />
      <QuickPollCard />

      {/* 7. Subtle Footer */}
      <footer className="px-2 pt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
        <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Kullanım Koşulları
        </Link>
        <span>&bull;</span>
        <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Gizlilik Politikası
        </Link>
        <span>&bull;</span>
        <Link to="/projects" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Projeler
        </Link>
        <span>&bull;</span>
        <Link to="/communities" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Topluluklar
        </Link>
        <div className="w-full mt-1.5 text-[11px] text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} Genç Sosyal
        </div>
      </footer>
    </div>
  );
}
