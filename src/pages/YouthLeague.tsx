import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import { 
  Trophy, 
  Flame, 
  Swords, 
  Award, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Archive,
  RefreshCw,
  Zap,
  BookOpen
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { showToast } from "../components/ui/Toast";
import { motion } from "motion/react";

interface LeagueData {
  season: {
    id: number;
    year: number;
    title: string;
    theme: string;
    description: string;
    registrationStartDate: string;
    registrationEndDate: string;
    startDate: string;
    endDate: string;
    status: "UPCOMING" | "REGISTRATION_OPEN" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    totalParticipants: number;
    totalMatches: number;
    settings: {
      ageGroups: string[];
      pointsCorrect: number;
      pointsHardBonus: number;
      maxSpeedBonus: number;
      questionTimeLimit: number;
      questionsPerMatch: number;
      simulationMode?: boolean;
    };
  };
  stats: {
    activeQuestionsCount: number;
    topLeaders: Array<{
      id: number;
      userId: number;
      username: string;
      avatarUrl: string | null;
      totalPoints: number;
      matchesWon: number;
      matchesPlayed: number;
      ageGroup: string;
    }>;
  };
  userState: {
    isRegistered: boolean;
    participation: {
      id: number;
      ageGroup: string;
      totalPoints: number;
      matchesPlayed: number;
      matchesWon: number;
      correctAnswersCount: number;
      currentRound: string;
      rank: number;
    } | null;
    calculatedAge: number;
    suggestedAgeGroup: string;
  };
}

export default function YouthLeague() {
  useSEO({
    title: "19 Mayıs Gençlik Ligi | Genç Sosyal",
    description: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı Bilgi ve Yetenek Ligi. Tarih, bilim, teknoloji ve sporda Türkiye'nin gençleriyle yarış!",
  });

  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeagueData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "rules" | "badges">("overview");

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("16-17");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [startingMatch, setStartingMatch] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchLeagueData = async () => {
    try {
      const res = await fetch("/api/v1/league/current");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.userState?.suggestedAgeGroup) {
          setSelectedAgeGroup(json.userState.suggestedAgeGroup);
        }
      }
    } catch (err) {
      console.error("Failed to load league data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueData();
  }, [isAuthenticated]);

  // Countdown ticker
  useEffect(() => {
    if (!data?.season) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      let targetDate = new Date(data.season.startDate).getTime();

      // If already started, count down to end date
      if (data.season.status === "IN_PROGRESS") {
        targetDate = new Date(data.season.endDate).getTime();
      } else if (data.season.status === "UPCOMING") {
        targetDate = new Date(data.season.registrationStartDate).getTime();
      }

      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data?.season]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }

    if (!acceptedTerms) {
      showToast({ title: "Lütfen katılım koşullarını onaylayın.", type: "error" });
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch("/api/v1/league/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageGroup: selectedAgeGroup }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: json.message || "✓ Katılımın tamamlandı!", type: "success" });
        setShowRegisterModal(false);
        fetchLeagueData();
      } else {
        showToast({ title: json.error?.message || "Kayıt olunamadı.", type: "error" });
      }
    } catch (err) {
      showToast({ title: "Bir ağ hatası oluştu.", type: "error" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStartMatch = async () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }

    setStartingMatch(true);
    try {
      const res = await fetch("/api/v1/league/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success && json.match) {
        showToast({ title: "Maç hazır! Başarılar dileriz.", type: "success" });
        navigate(`/youth-league/match/${json.match.id}`);
      } else {
        showToast({ title: json.error?.message || "Maç başlatılamadı.", type: "error" });
      }
    } catch (err) {
      showToast({ title: "Sunucu bağlantı hatası.", type: "error" });
    } finally {
      setStartingMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">19 Mayıs Gençlik Ligi yükleniyor...</p>
      </div>
    );
  }

  const season = data?.season;
  const isRegistered = data?.userState?.isRegistered;
  const userParticipation = data?.userState?.participation;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. HERO BANNER: 19 Mayıs Milli Mücadele Ruhu */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-red-500/30">
        {/* Decorative background badges */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none select-none text-9xl font-black">
          1919
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-red-100">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {season?.title || "19 Mayıs Gençlik Ligi"}
            </h1>

            <p className="text-red-100/90 text-sm sm:text-base leading-relaxed font-normal">
              {season?.description ||
                "Atatürk'ün gençliğe emanet ettiği cumhuriyet meşalesini bilgi, bilim ve teknolojiyle geleceğe taşıyoruz. Hemen katıl, 1v1 düellolarda yarış ve şampiyonluk rozetini kazan!"}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isRegistered ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleStartMatch}
                    isLoading={startingMatch}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg hover:shadow-amber-500/25 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <Swords className="w-5 h-5 text-slate-950" />
                    Hemen Maça Başla (1v1 Düello)
                  </Button>
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Kayıtlı Katılımcı ({userParticipation?.ageGroup} Kategorisi)
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    if (!isAuthenticated) openModal();
                    else setShowRegisterModal(true);
                  }}
                  className="bg-white hover:bg-slate-100 text-red-700 font-extrabold shadow-lg px-8 py-3.5 rounded-2xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Gençlik Ligi'ne Katıl
                </Button>
              )}

              <Link to="/youth-league/archive">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-2xl flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Archive className="w-4 h-4" />
                  Geçmiş Sezonlar
                </Button>
              </Link>
            </div>
          </div>

          {/* Countdown & Status Block */}
          <div className="bg-black/30 backdrop-blur-md p-5 rounded-3xl border border-white/15 space-y-4 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-red-200">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {season?.status === "IN_PROGRESS"
                  ? "Lig Bitişine Kalan Süre"
                  : season?.status === "REGISTRATION_OPEN"
                  ? "Lig Başlangıcına Kalan"
                  : "Geri Sayım"}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-mono font-bold text-white">
                {season?.status === "IN_PROGRESS"
                  ? "CANLI LİG"
                  : season?.status === "REGISTRATION_OPEN"
                  ? "KAYITLAR AÇIK"
                  : season?.status || "UPCOMING"}
              </span>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/10 rounded-2xl p-2.5">
                <div className="text-xl sm:text-2xl font-black font-mono">{timeLeft.days}</div>
                <div className="text-[10px] text-red-200 uppercase font-semibold">Gün</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5">
                <div className="text-xl sm:text-2xl font-black font-mono">{timeLeft.hours}</div>
                <div className="text-[10px] text-red-200 uppercase font-semibold">Saat</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5">
                <div className="text-xl sm:text-2xl font-black font-mono">{timeLeft.minutes}</div>
                <div className="text-[10px] text-red-200 uppercase font-semibold">Dk</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5">
                <div className="text-xl sm:text-2xl font-black font-mono">{timeLeft.seconds}</div>
                <div className="text-[10px] text-red-200 uppercase font-semibold">Sn</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-red-200">
              <span>Toplam Katılımcı:</span>
              <span className="font-bold text-white">{season?.totalParticipants || 0} Genç</span>
            </div>
            <div className="flex items-center justify-between text-xs text-red-200">
              <span>Oynanan Maçlar:</span>
              <span className="font-bold text-white">{season?.totalMatches || 0} Maç</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. USER STATS CARD (If Registered) */}
      {isRegistered && userParticipation && (
        <Card className="p-6 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/80 dark:border-blue-800/40 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                #{userParticipation.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Lig Performansın</h3>
                  <Badge variant="primary" className="text-xs">
                    {userParticipation.ageGroup} Yaş Kategorisi
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Her kazandığın maç ve hızlı cevap seni zirveye taşır!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[90px]">
                <div className="text-xs text-slate-500 font-medium">Toplam Puan</div>
                <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {userParticipation.totalPoints}
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[90px]">
                <div className="text-xs text-slate-500 font-medium">Galibiyet</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {userParticipation.matchesWon} / {userParticipation.matchesPlayed}
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[90px]">
                <div className="text-xs text-slate-500 font-medium">Doğru Cevap</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {userParticipation.correctAnswersCount}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Genel Bakış & Ödüller
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "leaderboard"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          Canlı Liderlik Tablosu
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "rules"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Format & Kurallar
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "badges"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Award className="w-4 h-4 text-rose-500" />
          Lig Rozetleri
        </button>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Yarışma Soru Kategorileri</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Her maçta bu 6 temel milli ve evrensel bilgi dalından dengeli sorular yöneltilir.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                {data?.stats?.activeQuestionsCount || 12}+ Onaylı Soru
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: "Tarih ve Kültür", icon: "🇹🇷", desc: "Milli mücadele, cumhuriyet ve sanat", color: "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10" },
                { name: "Bilim", icon: "🔬", desc: "Fizik, kimya, biyoloji ve astronomi", color: "border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/10" },
                { name: "Teknoloji", icon: "💻", desc: "Yazılım, yapay zeka, milli uydu", color: "border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10" },
                { name: "Genel Kültür", icon: "🌍", desc: "Dünya mirası, coğrafya ve keşif", color: "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10" },
                { name: "Mantık", icon: "🧠", desc: "Problem çözme ve örüntüler", color: "border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/10" },
                { name: "Spor", icon: "🏆", desc: "Olimpiyatlar, milli sporcular", color: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10" },
              ].map((c) => (
                <Card key={c.name} className={`p-4 rounded-2xl border ${c.color} text-center space-y-2`}>
                  <div className="text-3xl select-none">{c.icon}</div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{c.desc}</div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top 3 Champions Podium Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Liderlik Kürsüsü</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Şu an ligin zirvesinde yer alan genç şampiyon adayları.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data?.stats?.topLeaders && data.stats.topLeaders.length > 0 ? (
                data.stats.topLeaders.map((leader, idx) => (
                  <Card
                    key={leader.id}
                    className={`p-5 rounded-3xl border transition-all text-center relative overflow-hidden ${
                      idx === 0
                        ? "border-amber-300/80 bg-gradient-to-b from-amber-500/10 to-amber-500/5"
                        : idx === 1
                        ? "border-slate-300/80 bg-gradient-to-b from-slate-400/10 to-slate-400/5"
                        : "border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-amber-700/5"
                    }`}
                  >
                    <div className="absolute top-3 right-3 text-lg font-black">
                      {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : "🥉 #3"}
                    </div>
                    <Avatar
                      url={leader.avatarUrl || undefined}
                      name={leader.username}
                      size="lg"
                      className="mx-auto ring-4 ring-white dark:ring-slate-900 shadow-md mb-3"
                    />
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      @{leader.username}
                    </div>
                    <Badge variant="outline" className="text-[11px] mt-1">
                      {leader.ageGroup} Yaş
                    </Badge>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-around text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Puan</div>
                        <div className="font-black text-blue-600 dark:text-blue-400">{leader.totalPoints}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Galibiyet</div>
                        <div className="font-bold text-slate-700 dark:text-slate-300">{leader.matchesWon}</div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  Henüz maç tamamlanmadı. İlk maçı kazanarak zirveye adını yazdır!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Gençlik Ligi Sıralaması</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gizlilik politikamız gereği sadece platform içi kullanıcı adı ve puan bilgileri listelenir.
              </p>
            </div>
            <Link to="/youth-league/leaderboard">
              <Button size="sm" variant="outline" className="rounded-xl flex items-center gap-1.5 text-xs">
                <BarChart3 className="w-3.5 h-3.5" />
                Detaylı Tabloyu Aç
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.stats?.topLeaders && data.stats.topLeaders.length > 0 ? (
                data.stats.topLeaders.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      user?.username === p.username ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-black text-base w-6 text-center text-slate-500">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </span>
                      <Avatar url={p.avatarUrl || undefined} name={p.username} size="sm" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          @{p.username}
                          {user?.username === p.username && (
                            <Badge variant="primary" className="text-[10px]">Sen</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{p.ageGroup} Kategorisi</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[10px] text-slate-400">Galibiyet</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {p.matchesWon} / {p.matchesPlayed}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Puan</div>
                        <div className="text-base font-black text-blue-600 dark:text-blue-400">
                          {p.totalPoints}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  Liderlik tablosunda henüz yarışmacı bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RULES & FORMAT */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              19 Mayıs Gençlik Ligi Formatı ve Eşleşme İlkeleri
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Otomatik Sezon:</strong> Her yıl 1 Mayıs'ta kayıtlar otomatik olarak açılır, 19 Mayıs'ta lig heyecanı başlar ve gün sonunda şampiyonlar belirlenir.
              </p>
              <p>
                <strong>2. Yaş Grupları:</strong> Kullanıcıların profilindeki doğum yılına göre sistem otomatik olarak <em>13–15</em>, <em>16–17</em> ve <em>18+</em> kategorilerine yerleştirir.
              </p>
              <p>
                <strong>3. 1v1 Maç Sistemi:</strong> Her maçta 8 soru yöneltilir. Sorular için katılımcılara 20 saniye süre verilir.
              </p>
              <p>
                <strong>4. Puanlama & Hız Bonusu:</strong> Her doğru cevap +100 puan kazandırır. Zor sorular ek +50 bonus getirir. Soruyu 10 saniyenin altında doğru cevaplayanlar +25'e kadar hız bonusu kazanır.
              </p>
              <p>
                <strong>5. Adil Yarışma & Anti-Cheat:</strong> Sekme değiştirme (blur), bot hızında tıklama (450ms altı) ve çoklu hesap kullanımı otomatik olarak tespit edilir ve şüpheli hesaplar ligden diskalifiye edilir.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: BADGES & REWARDS */}
      {activeTab === "badges" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              key: "LEAGUE_CHAMPION",
              name: "🏆 19 Mayıs Gençlik Ligi Şampiyonu",
              desc: "Sezon finalinde en yüksek puanı toplayarak şampiyonluk tacını takan genç deha.",
              color: "border-amber-400 bg-amber-500/10 text-amber-500",
            },
            {
              key: "LEAGUE_FINALIST",
              name: "🥇 Gençlik Ligi Finalisti",
              desc: "19 Mayıs Gençlik Ligi final aşamasına kadar yükselme başarısı gösteren yarışmacı.",
              color: "border-slate-400 bg-slate-500/10 text-slate-400",
            },
            {
              key: "LEAGUE_SPEED_DEMON",
              name: "⚡ Hızlı Cevapçı",
              desc: "Soruları 5 saniyenin altında doğru yanıtlayarak hız bonusunu silip süpüren yarışmacı.",
              color: "border-blue-400 bg-blue-500/10 text-blue-500",
            },
            {
              key: "LEAGUE_KNOWLEDGE_MASTER",
              name: "🧠 Bilgi Ustası",
              desc: "Gençlik Ligi'nde tek bir maçta tüm soruları firesiz doğru yanıtlayan yarışmacı.",
              color: "border-purple-400 bg-purple-500/10 text-purple-500",
            },
          ].map((b) => (
            <Card key={b.key} className="p-5 rounded-3xl border space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border ${b.color}`}>
                  {b.key === "LEAGUE_CHAMPION" ? "🏆" : b.key === "LEAGUE_SPEED_DEMON" ? "⚡" : b.key === "LEAGUE_KNOWLEDGE_MASTER" ? "🧠" : "🥇"}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-bold">
                  🇹🇷
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Gençlik Ligi'ne Katıl</h3>
                  <p className="text-xs text-slate-500">19 Mayıs Sezonu Kayıt Formu</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Yaş Kategorisi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["13-15", "16-17", "18+"].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedAgeGroup(grp)}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                        selectedAgeGroup === grp
                          ? "border-red-600 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {grp} Yaş
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Doğum yılınıza göre sistem otomatik olarak kategorinizi doğrular.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Yarışma Şartları & Gizlilik
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Sıralamalarda gerçek ad, okul veya telefon bilgisi paylaşılmaz.</li>
                  <li>Sekme değiştirme veya şüpheli bot faaliyetleri diskalifiye sebebidir.</li>
                  <li>Maçlar centilmenlik ve milli bayram coşkusu ruhuyla oynanır.</li>
                </ul>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  19 Mayıs Gençlik Ligi katılım ve adil yarışma koşullarını kabul ediyorum.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="w-1/2 rounded-2xl"
                onClick={() => setShowRegisterModal(false)}
              >
                Vazgeç
              </Button>
              <Button
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl"
                isLoading={isRegistering}
                onClick={handleRegister}
              >
                Katılımı Tamamla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
