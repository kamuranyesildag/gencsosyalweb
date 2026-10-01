import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useSEO } from "../hooks/useSEO";
import { 
  Archive, 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  Users, 
  Swords, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

interface SeasonArchiveItem {
  id: number;
  year: number;
  title: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  totalParticipants: number;
  totalMatches: number;
  championUserId: number | null;
  championUsername: string | null;
  championAvatar: string | null;
}

export default function YouthLeagueArchive() {
  useSEO({
    title: "Geçmiş Sezonlar ve Şampiyonlar — 19 Mayıs Ligi | Genç Sosyal",
    description: "19 Mayıs Gençlik Ligi geçmiş sezon şampiyonları, final maçları istatistikleri ve turnuva arşivini detaylı olarak inceleyin.",
    canonicalPath: "/youth-league/archive"
  });

  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<SeasonArchiveItem[]>([]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch("/api/v1/league/seasons");
      const json = await res.json();
      if (json.success) {
        setSeasons(json.seasons || []);
      }
    } catch (err) {
      console.error("Failed to load seasons archive:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-1">
        <Link
          to="/youth-league"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Gençlik Ligi Ana Sayfası
        </Link>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Archive className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 shrink-0" />
          <span>Geçmiş Sezonlar Arşivi</span>
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          Her yıl 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı'nda düzenlenen ligin altın geçmişi.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
          <p className="text-xs text-slate-500">Sezonlar yükleniyor...</p>
        </div>
      ) : seasons.length > 0 ? (
        <div className="space-y-4">
          {seasons.map((s) => (
            <Card
              key={s.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 font-mono font-black text-lg flex items-center justify-center">
                    {s.year}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      {s.title}
                      {s.status === "COMPLETED" && (
                        <Badge variant="success" className="text-[10px]">Tamamlandı</Badge>
                      )}
                      {s.status === "IN_PROGRESS" && (
                        <Badge variant="danger" className="text-[10px]">Canlı Sezon</Badge>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">{s.theme}</p>
                  </div>
                </div>

                {/* Champion highlight if completed */}
                {s.championUsername && (
                  <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-2 px-3.5 rounded-2xl shrink-0">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                        Sezon Şampiyonu
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        @{s.championUsername}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {s.description}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    {s.totalParticipants} Katılımcı
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Swords className="w-4 h-4 text-slate-400" />
                    {s.totalMatches} Oynanan Maç
                  </span>
                </div>

                <Link to={`/youth-league/leaderboard?seasonId=${s.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold">
                    Sıralamayı İncele
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-sm text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Henüz arşivlenmiş sezon bulunmuyor.
        </div>
      )}
    </div>
  );
}
