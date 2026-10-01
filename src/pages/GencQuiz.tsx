import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import { 
  Gamepad2, 
  PlusCircle, 
  Layers, 
  Trophy, 
  Compass, 
  History, 
  Users, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Search,
  BookOpen,
  Zap,
  Globe,
  Lock,
  Share2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { toast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  "Genel Kültür",
  "Bilim",
  "Teknoloji",
  "Tarih",
  "Coğrafya",
  "Sanat",
  "Spor",
  "Mantık",
  "Yazılım",
  "Deneyap",
  "Türkiye",
  "Uzay",
  "Doğa",
  "Karışık"
];

const DIFFICULTIES = ["Kolay", "Orta", "Zor", "Karışık"];
const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_LIMITS = [10, 15, 20, 30, 60];

export function GencQuiz() {
  useSEO({
    title: "Genç Quiz — Canlı Çok Oyunculu Bilgi Yarışması | Genç Sosyal",
    description: "Arkadaşlarınla canlı bilgi yarışması odaları kur, oda kodunu paylaş, genel kültür ve teknoloji sorularıyla 1v1 düellolara katıl ve zirveye yerleş!",
    canonicalPath: "/quiz"
  });

  const { user, isAuthenticated, accessToken } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"hub" | "create" | "sets" | "leaderboard" | "categories" | "history">("hub");

  // Join Room Code State
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Public Rooms State
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // User Stats & History
  const [quizStats, setQuizStats] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // User Question Sets State
  const [mySets, setMySets] = useState<any[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [showCreateSetModal, setShowCreateSetModal] = useState(false);

  // Create Room Form State
  const [roomTitle, setRoomTitle] = useState("");
  const [roomCategory, setRoomCategory] = useState("Karışık");
  const [roomDifficulty, setRoomDifficulty] = useState("Karışık");
  const [roomQuestionCount, setRoomQuestionCount] = useState(10);
  const [roomTimePerQuestion, setRoomTimePerQuestion] = useState(20);
  const [roomType, setRoomType] = useState<"PUBLIC" | "CODE_ONLY" | "PRIVATE">("PUBLIC");
  const [roomSourceType, setRoomSourceType] = useState<"SYSTEM" | "QUESTION_SET" | "MIXED">("SYSTEM");
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // New Question Set Form State
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDesc, setNewSetDesc] = useState("");
  const [newSetCategory, setNewSetCategory] = useState("Genel Kültür");
  const [newSetDifficulty, setNewSetDifficulty] = useState("Orta");
  const [newSetIsPublic, setNewSetIsPublic] = useState(false);
  const [newSetQuestions, setNewSetQuestions] = useState<any[]>([
    {
      question: "",
      explanation: "",
      options: [
        { key: "A", text: "", isCorrect: true },
        { key: "B", text: "", isCorrect: false },
        { key: "C", text: "", isCorrect: false },
        { key: "D", text: "", isCorrect: false },
      ]
    }
  ]);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Fetch Public Rooms
  const fetchPublicRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch("/api/v1/quiz/rooms/public");
      const json = await res.json();
      if (json.success) {
        setPublicRooms(json.rooms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/v1/quiz/leaderboard");
      const json = await res.json();
      if (json.success) {
        setLeaderboard(json.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Fetch User History & Stats
  const fetchHistoryAndStats = async () => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const [histRes, statsRes] = await Promise.all([
        fetch("/api/v1/quiz/history", { headers }),
        fetch("/api/v1/quiz/stats", { headers }),
      ]);
      const [histJson, statsJson] = await Promise.all([histRes.json(), statsRes.json()]);
      if (histJson.success) setQuizHistory(histJson.history || []);
      if (statsJson.success) setQuizStats(statsJson.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch User Question Sets
  const fetchMySets = async () => {
    if (!isAuthenticated) return;
    setLoadingSets(true);
    try {
      const res = await fetch("/api/v1/quiz/sets", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const json = await res.json();
      if (json.success) {
        setMySets(json.sets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSets(false);
    }
  };

  useEffect(() => {
    fetchPublicRooms();
  }, []);

  useEffect(() => {
    if (activeTab === "leaderboard") fetchLeaderboard();
    if (activeTab === "history" || activeTab === "hub") fetchHistoryAndStats();
    if (activeTab === "sets" || activeTab === "create") fetchMySets();
  }, [activeTab, isAuthenticated]);

  // Join Room by Code Handler
  const handleJoinByCode = async (codeToJoin?: string) => {
    const rawCode = (codeToJoin || joinCode).trim();
    if (!rawCode) {
      setJoinError("Lütfen 6 haneli oda kodunu giriniz.");
      return;
    }
    if (!isAuthenticated) {
      openModal();
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch(`/api/v1/quiz/rooms/${rawCode}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setJoinError(json.error?.message || "Bu kodla aktif bir quiz bulunamadı.");
        setIsJoining(false);
        return;
      }

      // Route directly to room
      navigate(`/quiz/room/${json.room.code}`);
    } catch (err) {
      setJoinError("Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
      setIsJoining(false);
    }
  };

  // Create Room Handler
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openModal();
      return;
    }

    if (!roomTitle.trim()) {
      toast.error("Lütfen quiz odası için bir başlık belirleyiniz.");
      return;
    }

    setIsCreatingRoom(true);

    try {
      const res = await fetch("/api/v1/quiz/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          title: roomTitle.trim(),
          category: roomCategory,
          difficulty: roomDifficulty,
          questionCount: roomQuestionCount,
          timePerQuestion: roomTimePerQuestion,
          roomType,
          sourceType: roomSourceType,
          questionSetId: roomSourceType === "QUESTION_SET" ? selectedSetId : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Oda oluşturulamadı.");
        setIsCreatingRoom(false);
        return;
      }

      toast.success("Quiz odası oluşturuldu! Lobiye yönlendiriliyorsunuz.");
      navigate(`/quiz/room/${json.code}`);
    } catch (err) {
      toast.error("Sunucu hatası oluştu.");
      setIsCreatingRoom(false);
    }
  };

  // Save Custom Question Set Handler
  const handleSaveQuestionSet = async () => {
    if (!newSetTitle.trim()) {
      toast.error("Lütfen soru setinize bir başlık veriniz.");
      return;
    }

    // Validate questions
    for (let i = 0; i < newSetQuestions.length; i++) {
      const q = newSetQuestions[i];
      if (!q.question.trim()) {
        toast.error(`Soru #${i + 1} için metin girmelisiniz.`);
        return;
      }
      const filledOpts = q.options.filter((o: any) => o.text.trim().length > 0);
      if (filledOpts.length < 2) {
        toast.error(`Soru #${i + 1} için en az 2 seçenek doldurmalısınız.`);
        return;
      }
      const hasCorrect = q.options.some((o: any) => o.isCorrect && o.text.trim().length > 0);
      if (!hasCorrect) {
        toast.error(`Soru #${i + 1} için doğru seçeneği işaretlemelisiniz.`);
        return;
      }
    }

    setIsSavingSet(true);

    try {
      const res = await fetch("/api/v1/quiz/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          title: newSetTitle.trim(),
          description: newSetDesc.trim(),
          category: newSetCategory,
          difficulty: newSetDifficulty,
          isPublic: newSetIsPublic,
          questions: newSetQuestions.map(q => ({
            question: q.question.trim(),
            explanation: q.explanation.trim(),
            options: q.options.filter((o: any) => o.text.trim().length > 0),
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Soru seti kaydedilemedi.");
        setIsSavingSet(false);
        return;
      }

      toast.success("Soru setiniz başarıyla oluşturuldu!");
      setShowCreateSetModal(false);
      // Reset form
      setNewSetTitle("");
      setNewSetDesc("");
      setNewSetQuestions([
        {
          question: "",
          explanation: "",
          options: [
            { key: "A", text: "", isCorrect: true },
            { key: "B", text: "", isCorrect: false },
            { key: "C", text: "", isCorrect: false },
            { key: "D", text: "", isCorrect: false },
          ]
        }
      ]);
      fetchMySets();
    } catch (err) {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setIsSavingSet(false);
    }
  };

  // Delete Question Set
  const handleDeleteSet = async (id: number) => {
    if (!confirm("Bu soru setini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/v1/quiz/sets/${id}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Soru seti silindi.");
        fetchMySets();
      }
    } catch (err) {
      toast.error("İşlem başarısız.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* HERO HEADER - DISTINCT GENÇ SOSYAL BRANDING */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-950 p-5 sm:p-10 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Canlı Quiz Odaları & Bilgi Arenası</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Genç Quiz
            </h1>
            <p className="text-xs sm:text-base text-blue-100/90 font-medium leading-relaxed">
              Arkadaşlarınla aynı anda canlı odalara katıl, 6 haneli oda koduyla arkadaşlarına meydan oku, kendi soru setlerini hazırla veya genel bilgi havuzunda hızını kanıtla!
            </p>
          </div>

          {/* QUICK JOIN BOX IN HERO */}
          <div className="bg-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/20 w-full md:w-80 shrink-0 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Hızlı Quiz'e Katıl</span>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6 Haneli Kod (örn. 482731)"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                    setJoinError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white placeholder-slate-400 text-center font-mono font-bold tracking-widest text-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {joinError && (
                <p className="text-xs text-rose-300 font-semibold text-center">{joinError}</p>
              )}
              <Button
                variant="primary"
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30"
                onClick={() => handleJoinByCode()}
                isLoading={isJoining}
              >
                Odaya Katıl 🚀
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200 dark:border-white/10">
        {[
          { id: "hub", label: "🎮 Quiz Ana Sayfa", icon: Gamepad2 },
          { id: "create", label: "➕ Quiz Odası Oluştur", icon: PlusCircle },
          { id: "sets", label: "🧠 Soru Setlerim", icon: Layers },
          { id: "leaderboard", label: "🏆 Sıralama", icon: Trophy },
          { id: "categories", label: "📚 Kategoriler", icon: Compass },
          { id: "history", label: "📖 Geçmiş Quizlerim", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: HUB (PUBLIC ROOMS + QUICK STATS + CATEGORIES SHORTCUT) */}
      {activeTab === "hub" && (
        <div className="space-y-8">
          {/* USER QUICK SUMMARY CARDS */}
          {isAuthenticated && quizStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Katıldığın Quiz</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{quizStats.totalQuizes || 0}</p>
              </Card>
              <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Kazandığın Quiz</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{quizStats.wins || 0}</p>
              </Card>
              <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Toplam Puan</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{quizStats.totalScore?.toLocaleString() || 0}</p>
              </Card>
              <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-900/40">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Doğruluk Oranı</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">%{quizStats.accuracyRate || 0}</p>
              </Card>
            </div>
          )}

          {/* ACTIVE PUBLIC ROOMS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Şu Anda Canlı Olan Açık Odalar</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Hemen bir odaya katıl ve lobideki arkadaşlarınla kapışmaya başla!</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchPublicRooms}
                isLoading={loadingRooms}
                className="rounded-xl text-xs font-bold"
              >
                Yenile
              </Button>
            </div>

            {loadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : publicRooms.length === 0 ? (
              <Card className="p-8 text-center space-y-4 border-dashed border-2 border-slate-200 dark:border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center">
                  <Gamepad2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Şu an aktif herkese açık oda yok</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">İlk odayı sen kurarak arkadaşlarını davet edebilir veya diğer kullanıcıların katılmasını bekleyebilirsin!</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("create")}
                  className="rounded-xl font-bold"
                >
                  ➕ İlk Odayı Sen Oluştur
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicRooms.map((r) => (
                  <Card key={r.code} className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 dark:border-white/10 group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          #{r.code}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span>{r.playerCount} / {r.maxPlayers} Oyuncu</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {r.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="neutral" className="text-[11px] font-semibold">{r.category}</Badge>
                          <Badge variant="info" className="text-[11px] font-semibold">{r.difficulty}</Badge>
                          <span className="text-[11px] text-slate-400 font-medium">⏱️ {r.questionCount} Soru ({r.timePerQuestion}s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                      <Button
                        variant="primary"
                        className="w-full rounded-xl font-bold text-xs"
                        onClick={() => handleJoinByCode(r.code)}
                      >
                        Odaya Katıl 🎮
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* QUICK CATEGORIES PREVIEW */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span>Popüler Quiz Kategorileri</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Tüm Kategorileri Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setRoomCategory(cat);
                    setRoomTitle(`${cat} Bilgi Yarışması`);
                    setActiveTab("create");
                  }}
                  className="p-3.5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                    {cat}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">Oda Oluştur ➔</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE ROOM */}
      {activeTab === "create" && (
        <Card className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-blue-600" />
              <span>Yeni Quiz Odası Oluştur</span>
            </h2>
            <p className="text-xs text-slate-500">
              Odanı yapılandır, benzersiz 6 haneli kodunu al ve arkadaşlarını canlı yarışmaya davet et.
            </p>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-5">
            {/* Room Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Quiz Adı *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Örn: Teknoloji & Bilim Meydan Okuması"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Question Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Soru Kaynağı
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoomSourceType("SYSTEM")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    roomSourceType === "SYSTEM"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600"
                      : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold block">🌐 Sistem Rastgele Seçsin</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Merkezi soru havuzundan otomatik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomSourceType("QUESTION_SET")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    roomSourceType === "QUESTION_SET"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600"
                      : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold block">🧠 Benim Soru Setim</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Kendi hazırladığın sorularla</span>
                </button>
              </div>
            </div>

            {/* If Custom Set Chosen */}
            {roomSourceType === "QUESTION_SET" && (
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Kullanılacak Soru Seti:
                </label>
                {mySets.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">
                    Henüz bir soru setiniz yok.{" "}
                    <button
                      type="button"
                      onClick={() => setShowCreateSetModal(true)}
                      className="text-blue-600 font-bold underline cursor-pointer"
                    >
                      Yeni set oluştur
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedSetId || ""}
                    onChange={(e) => setSelectedSetId(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-sm font-semibold"
                  >
                    <option value="">Set Seçiniz...</option>
                    {mySets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.questionCount} Soru - {s.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kategori
                </label>
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Zorluk
                </label>
                <select
                  value={roomDifficulty}
                  onChange={(e) => setRoomDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Count & Time Per Question */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Soru Sayısı
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {QUESTION_COUNTS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setRoomQuestionCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        roomQuestionCount === cnt
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Soru Başına Süre
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIME_LIMITS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRoomTimePerQuestion(sec)}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        roomTimePerQuestion === sec
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Oda Tipi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "PUBLIC", label: "Herkese Açık", desc: "Listede görünür", icon: Globe },
                  { id: "CODE_ONLY", label: "Oda Koduyla", desc: "Sadece kod ile", icon: Lock },
                  { id: "PRIVATE", label: "Özel", desc: "Sadece davetliler", icon: ShieldCheck },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRoomType(type.id as any)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      roomType === type.id
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600"
                        : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <type.icon className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                    <span className="text-xs font-bold block">{type.label}</span>
                    <span className="text-[10px] text-slate-400 block">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isCreatingRoom}
              className="w-full rounded-xl font-bold py-3 text-base shadow-lg shadow-blue-500/25"
            >
              Quiz Odasını Oluştur ve Lobiye Git 🚀
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 3: USER QUESTION SETS (SORU SETLERİM) */}
      {activeTab === "sets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                <span>Soru Setlerim</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Kendi hazırladığın soru setlerini kaydet ve quiz odalarında kullan.</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                if (!isAuthenticated) openModal();
                else setShowCreateSetModal(true);
              }}
              className="rounded-xl font-bold"
            >
              ➕ Yeni Soru Seti Oluştur
            </Button>
          </div>

          {loadingSets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : mySets.length === 0 ? (
            <Card className="p-8 text-center space-y-4 border-dashed border-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Henüz bir soru setiniz bulunmuyor</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Dilediğin kategoride kendi sorularını ve şıklarını hazırlayarak arkadaşlarınla yarışabileceğin özel soru setleri oluşturabilirsin!
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else setShowCreateSetModal(true);
                }}
                className="rounded-xl font-bold"
              >
                Yeni Soru Seti Ekle
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySets.map((s) => (
                <Card key={s.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" className="text-xs">{s.category}</Badge>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {s.isPublic ? "🌍 Paylaşılabilir" : "🔒 Özel"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.title}</h3>
                      {s.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{s.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {s.questionCount} Soru ({s.difficulty})
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-lg text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDeleteSet(s.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          setRoomSourceType("QUESTION_SET");
                          setSelectedSetId(s.id);
                          setRoomTitle(`${s.title} Odası`);
                          setActiveTab("create");
                        }}
                      >
                        Oda Kur
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LEADERBOARD (GENÇ QUIZ SIRALAMASI) */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>Genç Quiz Genel Sıralaması</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Genç Sosyal'in en başarılı quiz yarışmacıları ve toplam puan tablosu.</p>
          </div>

          <Card className="overflow-hidden">
            {loadingLeaderboard ? (
              <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Liderlik tablosu yükleniyor...</div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">Henüz tamamlanan quiz bulunamadı.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {leaderboard.map((item, idx) => {
                  const isTop3 = idx < 3;
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                  const isCurrentUser = user && user.username === item.username;

                  return (
                    <div
                      key={item.userId}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        isCurrentUser ? "bg-blue-50/70 dark:bg-blue-950/30" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-8 text-center font-black text-sm shrink-0">
                          {medal ? (
                            <span className="text-lg">{medal}</span>
                          ) : (
                            <span className="text-slate-400">#{item.rank}</span>
                          )}
                        </div>

                        <Avatar
                          url={item.avatarUrl}
                          name={item.username}
                          size="sm"
                          className="shrink-0 ring-1 ring-slate-200 dark:ring-white/10"
                        />

                        <div className="min-w-0">
                          <Link
                            to={`/profile/${item.username}`}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 transition-colors truncate block"
                          >
                            @{item.username}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.totalQuizes} Quiz • {item.wins} Galibiyet
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">
                          {item.totalScore?.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-medium">Puan</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: CATEGORIES (SORU KATEGORİLERİ) */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-indigo-600" />
              <span>Soru Kategorileri</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">İstediğin konuyu seç ve hemen o kategoride bir oda oluşturarak yarışmaya başla.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Card key={cat} className="p-5 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg transition-all group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    {cat.substring(0, 2)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {cat}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Özenle filtrelenmiş {cat.toLowerCase()} sorularıyla bilgini sına.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                  <Button
                    variant="secondary"
                    className="w-full text-xs font-bold rounded-xl"
                    onClick={() => {
                      setRoomCategory(cat);
                      setRoomTitle(`${cat} Bilgi Yarışması`);
                      setActiveTab("create");
                    }}
                  >
                    Bu Kategoride Oda Kur 🚀
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: HISTORY (GEÇMİŞ QUİZLERİM) */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-purple-600" />
              <span>Geçmiş Quizlerim</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Katıldığın önceki yarışmalar, elde ettiğin dereceler ve puanların.</p>
          </div>

          {!isAuthenticated ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Geçmiş quizlerini görüntülemek için lütfen giriş yapınız.
              </p>
              <Button variant="primary" onClick={openModal} className="rounded-xl font-bold">
                Giriş Yap
              </Button>
            </Card>
          ) : loadingHistory ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-white/5" />
              ))}
            </div>
          ) : quizHistory.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-base font-bold text-slate-900 dark:text-white">Henüz tamamlanan bir quiz geçmişiniz yok</p>
              <p className="text-xs text-slate-500">Bir odaya katılarak veya kendiniz oluşturarak ilk yarışmanızı yapabilirsiniz!</p>
              <div className="pt-2">
                <Button variant="primary" onClick={() => setActiveTab("hub")} className="rounded-xl font-bold text-xs">
                  Quiz Odalarına Göz At
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
              {quizHistory.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.roomTitle}
                      </span>
                      <Badge variant="neutral" className="text-[10px]">{item.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span>{new Date(item.playedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>{item.totalQuestions} Soru</span>
                      <span>•</span>
                      <span>{item.correctCount} Doğru, {item.wrongCount} Yanlış</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-medium">Sıralama</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {item.rank === 1 ? "🥇 1. Sıra" : item.rank === 2 ? "🥈 2. Sıra" : item.rank === 3 ? "🥉 3. Sıra" : `${item.rank}. / ${item.totalPlayers}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Skor</span>
                      <span className="text-base font-black text-amber-500">
                        {item.score} Puan
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* MODAL: CREATE QUESTION SET */}
      <AnimatePresence>
        {showCreateSetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-white/10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yeni Soru Seti Oluştur</h3>
                  <p className="text-xs text-slate-500">Kendi sorularını hazırla ve quiz odalarında kullan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateSetModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Set Meta Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Set Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 90'lar Nostalji Bilgi Seti"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Açıklama</label>
                  <textarea
                    rows={2}
                    placeholder="Set hakkında kısa açıklama..."
                    value={newSetDesc}
                    onChange={(e) => setNewSetDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">Kategori</label>
                    <select
                      value={newSetCategory}
                      onChange={(e) => setNewSetCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">Zorluk</label>
                    <select
                      value={newSetDifficulty}
                      onChange={(e) => setNewSetDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold"
                    >
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">Gizlilik</label>
                    <select
                      value={newSetIsPublic ? "public" : "private"}
                      onChange={(e) => setNewSetIsPublic(e.target.value === "public")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold"
                    >
                      <option value="private">🔒 Özel (Sadece ben)</option>
                      <option value="public">🌍 Paylaşılabilir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Sorular ({newSetQuestions.length})
                  </h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setNewSetQuestions([
                        ...newSetQuestions,
                        {
                          question: "",
                          explanation: "",
                          options: [
                            { key: "A", text: "", isCorrect: true },
                            { key: "B", text: "", isCorrect: false },
                            { key: "C", text: "", isCorrect: false },
                            { key: "D", text: "", isCorrect: false },
                          ]
                        }
                      ]);
                    }}
                    className="rounded-lg text-xs font-bold"
                  >
                    ➕ Soru Ekle
                  </Button>
                </div>

                <div className="space-y-6">
                  {newSetQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600">Soru #{qIndex + 1}</span>
                        {newSetQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setNewSetQuestions(newSetQuestions.filter((_, idx) => idx !== qIndex))}
                            className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Soruyu Kaldır
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Soru metnini yazınız..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...newSetQuestions];
                          updated[qIndex].question = e.target.value;
                          setNewSetQuestions(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-medium"
                      />

                      {/* Options */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">
                          Seçenekler (Doğru seçeneği yeşil radyo butonuyla seçiniz):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt: any, optIndex: number) => (
                            <div key={opt.key} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={opt.isCorrect}
                                onChange={() => {
                                  const updated = [...newSetQuestions];
                                  updated[qIndex].options.forEach((o: any, idx: number) => {
                                    o.isCorrect = idx === optIndex;
                                  });
                                  setNewSetQuestions(updated);
                                }}
                                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold w-4 text-slate-400">{opt.key}</span>
                              <input
                                type="text"
                                placeholder={`Seçenek ${opt.key}`}
                                value={opt.text}
                                onChange={(e) => {
                                  const updated = [...newSetQuestions];
                                  updated[qIndex].options[optIndex].text = e.target.value;
                                  setNewSetQuestions(updated);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Opsiyonel soru açıklaması..."
                        value={q.explanation}
                        onChange={(e) => {
                          const updated = [...newSetQuestions];
                          updated[qIndex].explanation = e.target.value;
                          setNewSetQuestions(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-500 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateSetModal(false)}
                  className="rounded-xl font-bold"
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveQuestionSet}
                  isLoading={isSavingSet}
                  className="rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Soru Setini Kaydet ✓
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
