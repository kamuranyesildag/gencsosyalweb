import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../context/useAuth";
import { useAuthModalStore } from "../../context/useAuthModal";
import { SuggestedUsers } from "../SuggestedUsers";
import { ProfileCompletionCard } from "../ProfileCompletionCard";
import { fetchApi } from "../../lib/api";
import { Users, Hash, ArrowRight, Sparkles, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

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

  const trendingTags = [
    { name: "yazilim", count: "128 gönderi" },
    { name: "yapayzeka", count: "94 gönderi" },
    { name: "tasarim", count: "67 gönderi" },
    { name: "gencsosyal", count: "210 gönderi" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* 1. Unauthenticated CTA Card */}
      {!isAuthenticated && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-100/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center mb-3 shadow-xs shadow-slate-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight mb-1">
            Genç Sosyal'e Katıl
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
            Genç geliştiriciler, üreticiler ve yaratıcı zihinlerle tanış, projelerini paylaş.
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => openModal()}
            className="rounded-xl font-bold shadow-xs shadow-slate-500/20"
          >
            Giriş Yap / Kaydol
          </Button>
        </div>
      )}

      {/* 2. Profile Completion */}
      {isAuthenticated && <ProfileCompletionCard />}

      {/* 3. Suggested Users (Who to follow) */}
      {isAuthenticated && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-900" />
              Kimi Takip Etmeli
            </h3>
            <Link
              to="/explore"
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
            >
              Tümü
            </Link>
          </div>
          <SuggestedUsers />
        </div>
      )}

      {/* 4. Popular Communities */}
      {popularCommunities.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-900" />
              Popüler Topluluklar
            </h3>
            <Link
              to="/communities"
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
            >
              Keşfet
            </Link>
          </div>
          <div className="space-y-2.5">
            {popularCommunities.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/communities/${c.slug}`)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100/50 border border-slate-200/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 font-bold text-xs">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {c.memberCount || 0} üye
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Trending Topics / Hashtags */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-900" />
            Gündemdeki Konular
          </h3>
        </div>
        <div className="space-y-1.5">
          {trendingTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/hashtags/${tag.name}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  #{tag.name}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{tag.count}</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-900">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Footer Links */}
      <div className="px-2 pt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-400">
        <Link to="/terms" className="hover:text-slate-600 transition-colors">
          Kullanım Koşulları
        </Link>
        <span>&bull;</span>
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">
          Gizlilik Politikası
        </Link>
        <span>&bull;</span>
        <Link to="/projects" className="hover:text-slate-600 transition-colors">
          Projeler
        </Link>
        <span>&bull;</span>
        <Link to="/communities" className="hover:text-slate-600 transition-colors">
          Topluluklar
        </Link>
        <div className="w-full mt-1 text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Genç Sosyal. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
