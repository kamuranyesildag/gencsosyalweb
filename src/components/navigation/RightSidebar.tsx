import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../context/useAuth";
import { useAuthModalStore } from "../../context/useAuthModal";
import { SuggestedUsers } from "../SuggestedUsers";
import { ProfileCompletionCard } from "../ProfileCompletionCard";
import { DailyQuestCard } from "../DailyQuestCard";
import { QuickPollCard } from "../QuickPollCard";
import { fetchApi } from "../../lib/api";
import { Users, Hash, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

import { LeaderboardCard } from "../LeaderboardCard";

export function RightSidebar() {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();
  const [popularCommunities, setPopularCommunities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await fetchApi("/communities");
        const json = await res.json();
        if (json.success && isMounted) {
          setPopularCommunities((json.data || []).slice(0, 3));
        }
      } catch (e) {
        // silent fallback
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const [trendingTags, setTrendingTags] = useState<{name: string, normalizedName: string, count: number}[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadTrending = async () => {
      try {
        const res = await fetchApi("/hashtags/trending/top");
        const json = await res.json();
        if (json.success && isMounted) {
          setTrendingTags(json.data || []);
        }
      } catch (e) {
        // silent fallback
      }
    };
    loadTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* 1. Unauthenticated CTA Card */}
      {!isAuthenticated && (
        <div className="bg-slate-900 dark:bg-indigo-950/80 text-white rounded-2xl p-5 border border-slate-100/80 dark:border-indigo-800/40 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-600 text-slate-900 dark:text-white flex items-center justify-center mb-3 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight mb-1">
            Genç Sosyal'e Katıl
          </h3>
          <p className="text-xs text-slate-300 dark:text-indigo-200 font-medium leading-relaxed mb-4">
            Genç geliştiriciler, üreticiler ve yaratıcı zihinlerle tanış, projelerini paylaş.
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => openModal()}
            className="rounded-xl font-bold shadow-xs"
          >
            Giriş Yap / Kaydol
          </Button>
        </div>
      )}

      {/* 2. Profile Completion */}
      {isAuthenticated && <ProfileCompletionCard />}

      {/* Quest of the day */}
      {isAuthenticated && <DailyQuestCard />}

      {/* Leaderboard */}
      <LeaderboardCard />

      {/* Quick Poll */}
      <QuickPollCard />

      {/* 3. Suggested Users (Who to follow) */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-900 dark:text-indigo-400" />
              Kimi Takip Etmeli
            </h3>
            <Link
              to="/explore"
              className="text-xs font-semibold text-slate-900 dark:text-indigo-400 hover:underline transition-colors"
            >
              Tümü
            </Link>
          </div>
          <SuggestedUsers />
        </div>
      )}

      {/* 4. Popular Communities */}
      {popularCommunities.length > 0 && (
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-900 dark:text-indigo-400" />
              Popüler Topluluklar
            </h3>
            <Link
              to="/communities"
              className="text-xs font-semibold text-slate-900 dark:text-indigo-400 hover:underline transition-colors"
            >
              Keşfet
            </Link>
          </div>
          <div className="space-y-2.5">
            {popularCommunities.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/communities/${c.slug}`)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {c.memberCount || 0} üye
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Trending Topics / Hashtags */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-900 dark:text-indigo-400" />
            Gündemdeki Konular
          </h3>
        </div>
        <div className="space-y-1.5">
          {trendingTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/hashtags/${tag.name}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  #{tag.name}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{tag.count} gönderi</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Footer Links */}
      <div className="px-2 pt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <Link to="/terms" className="hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          Kullanım Koşulları
        </Link>
        <span>&bull;</span>
        <Link to="/privacy" className="hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          Gizlilik Politikası
        </Link>
        <span>&bull;</span>
        <Link to="/projects" className="hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          Projeler
        </Link>
        <span>&bull;</span>
        <Link to="/communities" className="hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          Topluluklar
        </Link>
        <div className="w-full mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Genç Sosyal. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
