import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useSEO } from "../hooks/useSEO";
import { 
  Trophy, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Users, 
  Flame, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";

interface Participant {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  matchesWon: number;
  matchesPlayed: number;
  correctAnswersCount: number;
  ageGroup: string;
  currentRound: string;
  rank: number;
}

export default function YouthLeagueLeaderboard() {
  useSEO({
    title: "Canlı Liderlik Tablosu | 19 Mayıs Gençlik Ligi",
    description: "19 Mayıs Gençlik Ligi resmi sıralaması. Yaş gruplarına göre en yüksek puan toplayan genç yetenekler.",
  });

  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ageGroup !== "all") params.append("ageGroup", ageGroup);
      params.append("page", page.toString());
      params.append("limit", "25");

      const res = await fetch(`/api/v1/league/leaderboard?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLeaderboard(json.leaderboard || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [ageGroup, page]);

  const filteredList = leaderboard.filter((p) =>
    searchQuery ? p.username.toLowerCase().includes(searchQuery.toLowerCase().trim()) : true
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/youth-league"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Gençlik Ligi Ana Sayfası
          </Link>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
            <span>Canlı Liderlik Tablosu</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Öğrenci güvenliği ve gizliliği gereği sadece platform içi kullanıcı adı ve yarışma skorları listelenir.
          </p>
        </div>

        {/* Age Group Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl shrink-0 overflow-x-auto no-scrollbar max-w-full">
          {[
            { key: "all", label: "Tümü" },
            { key: "13-15", label: "13–15 Yaş" },
            { key: "16-17", label: "16–17 Yaş" },
            { key: "18+", label: "18+ Yaş" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setAgeGroup(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                ageGroup === f.key
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Yarışmacı kullanıcı adı ara..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Leaderboard Table Card */}
      <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-500">Sıralama yükleniyor...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map((p) => {
              const isCurrentUser = user?.username === p.username;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 px-6 transition-colors ${
                    isCurrentUser
                      ? "bg-blue-50/70 dark:bg-blue-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-black text-sm w-7 text-center">
                      {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                    </span>

                    <Avatar url={p.avatarUrl || undefined} name={p.username} size="sm" />

                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        @{p.username}
                        {isCurrentUser && (
                          <Badge variant="primary" className="text-[10px]">Sen</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.ageGroup} Kategorisi
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <div className="text-[10px] text-slate-400">Galibiyet / Maç</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {p.matchesWon} / {p.matchesPlayed}
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <div className="text-[10px] text-slate-400">Doğru Cevap</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {p.correctAnswersCount}
                      </div>
                    </div>

                    <div className="min-w-[70px]">
                      <div className="text-[10px] text-slate-400">Toplam Puan</div>
                      <div className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                        {p.totalPoints}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">
            {searchQuery ? "Arama kriterine uygun yarışmacı bulunamadı." : "Bu kategoride henüz yarışmacı bulunmuyor."}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Önceki
            </Button>
            <span className="font-semibold text-slate-500">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl flex items-center gap-1"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
