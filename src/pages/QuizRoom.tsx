import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import { 
  Gamepad2, 
  Users, 
  Crown, 
  Play, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  Trophy, 
  Award, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  User,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { toast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

interface Player {
  userId: number;
  username: string;
  avatarUrl: string | null;
  score: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  streak: number;
  maxStreak?: number;
  rank: number;
  isHost: boolean;
  isConnected: boolean;
  hasAnsweredCurrent: boolean;
}

interface ActiveQuestion {
  order: number;
  currentIndex: number;
  totalCount: number;
  duration: number;
  category: string;
  difficulty: string;
  questionText: string;
  options: {
    key: string;
    text: string;
  }[];
}

export function QuizRoom() {
  const { code: rawCode } = useParams<{ code: string }>();
  const code = (rawCode || "").toUpperCase().trim();

  const { user, isAuthenticated, accessToken } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  useSEO({
    title: `Genç Quiz Oda #${code} | Genç Sosyal`,
    description: "Canlı çok oyunculu Genç Quiz odası!",
  });

  // Room State
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<"CONNECTING" | "LOBBY" | "QUESTION_ACTIVE" | "QUESTION_RESULT" | "FINISHED" | "ERROR">("CONNECTING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Question State
  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<{ pointsEarned: number; isCorrect: boolean; streak: number } | null>(null);

  // Question Result Reveal State
  const [revealedResult, setRevealedResult] = useState<{
    correctOptionKey: string;
    correctOptionText: string;
    explanation: string | null;
  } | null>(null);

  // Quiz Finished State
  const [finishedData, setFinishedData] = useState<{
    podium: Player[];
    leaderboard: Player[];
    totalQuestions: number;
  } | null>(null);

  // User tab cheat warning
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  // Clipboard copied
  const [copied, setCopied] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHost = user && room && (room.hostId === user.id || players.find(p => p.userId === user.id)?.isHost);

  // Connect WebSocket
  useEffect(() => {
    if (!code) return;

    let isSubscribed = true;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/quiz/ws${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isSubscribed) return;
      // Join Room
      ws.send(JSON.stringify({
        event: "JOIN_ROOM",
        payload: { roomCode: code, token: accessToken },
      }));
    };

    ws.onmessage = (event) => {
      if (!isSubscribed) return;
      try {
        const message = JSON.parse(event.data);
        const { event: evtName, data } = message;

        switch (evtName) {
          case "ROOM_JOINED": {
            setRoom(data.room);
            setPlayers(data.players || []);
            setStatus(data.room.status);

            if (data.currentQuestion) {
              setCurrentQuestion(data.currentQuestion);
              setTimeLeft(data.currentQuestion.duration || 20);
            }
            break;
          }

          case "PLAYER_JOINED": {
            setPlayers((prev) => {
              const existingIdx = prev.findIndex((p) => p.userId === data.player.userId);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = data.player;
                return next;
              }
              return [...prev, data.player];
            });
            break;
          }

          case "PLAYER_LEFT": {
            setPlayers((prev) =>
              prev.map((p) => (p.userId === data.userId ? { ...p, isConnected: false } : p))
            );
            break;
          }

          case "QUIZ_STARTED": {
            setStatus("QUESTION_ACTIVE");
            toast.info("Quiz başladı! Başarılar!");
            break;
          }

          case "QUESTION_STARTED": {
            setStatus("QUESTION_ACTIVE");
            setCurrentQuestion(data.question);
            setSelectedOption(null);
            setAnswerSubmitted(false);
            setAnswerResult(null);
            setRevealedResult(null);
            setQuestionStartTime(Date.now());
            setTimeLeft(data.duration || 20);

            if (data.leaderboard) {
              setPlayers(data.leaderboard);
            }
            break;
          }

          case "ANSWER_ACK": {
            setAnswerResult(data);
            break;
          }

          case "QUESTION_ENDED": {
            setStatus("QUESTION_RESULT");
            setRevealedResult({
              correctOptionKey: data.correctOptionKey,
              correctOptionText: data.correctOptionText,
              explanation: data.explanation,
            });
            if (data.leaderboard) {
              setPlayers(data.leaderboard);
            }
            break;
          }

          case "LEADERBOARD_UPDATED": {
            if (data.leaderboard) {
              setPlayers(data.leaderboard);
            }
            break;
          }

          case "QUIZ_FINISHED": {
            setStatus("FINISHED");
            setFinishedData({
              podium: data.podium || [],
              leaderboard: data.leaderboard || [],
              totalQuestions: data.totalQuestions || 10,
            });
            break;
          }

          case "ERROR": {
            setErrorMessage(data.message || "Bir hata oluştu.");
            setStatus("ERROR");
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS Error:", err);
      if (status === "CONNECTING") {
        setErrorMessage("Quiz sunucusuna bağlanılamadı.");
        setStatus("ERROR");
      }
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    return () => {
      isSubscribed = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [code, accessToken]);

  // Question Timer Countdown
  useEffect(() => {
    if (status !== "QUESTION_ACTIVE") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentQuestion]);

  // Anti-cheat tab blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "QUESTION_ACTIVE") {
        setCheatWarning("Dikkat: Soru esnasında sekmeden ayrıldınız!");
        setTimeout(() => setCheatWarning(null), 4000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  // Handle Start Quiz (Host Only)
  const handleStartQuiz = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Sunucu bağlantısı aktif değil.");
      return;
    }

    wsRef.current.send(JSON.stringify({
      event: "START_QUIZ",
    }));
  };

  // Handle Answer Selection
  const handleSelectOption = (key: string) => {
    if (answerSubmitted || status !== "QUESTION_ACTIVE") return;

    setSelectedOption(key);
    setAnswerSubmitted(true);

    const timeTakenMs = Date.now() - questionStartTime;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: "SUBMIT_ANSWER",
        payload: {
          selectedOption: key,
          timeTakenMs,
        },
      }));
    }
  };

  // Copy Room Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Oda kodu (${code}) panoya kopyalandı!`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Share Code
  const handleShare = async () => {
    const shareText = `Genç Sosyal'de "${room?.title || 'Genç Quiz'}" odasına davetlisin! Oda Kodu: ${code}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Genç Quiz Daveti",
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or not supported
      }
    } else {
      handleCopyCode();
    }
  };

  // Send Direct Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setSendingInvite(true);
    try {
      const res = await fetch(`/api/v1/quiz/rooms/${code}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ receiverUsername: inviteUsername.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Davet gönderilemedi.");
      } else {
        toast.success(json.message || "Davet iletildi!");
        setInviteUsername("");
        setShowInviteModal(false);
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setSendingInvite(false);
    }
  };

  const currentPlayer = players.find(p => user && p.userId === user.id);

  // -------------------------------------------------------------
  // RENDER: CONNECTING OR ERROR
  // -------------------------------------------------------------
  if (status === "CONNECTING") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center animate-spin">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Odaya Bağlanılıyor...</h2>
          <p className="text-xs text-slate-500">Oda #{code} hazırlanıyor, lütfen bekleyiniz.</p>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5 text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Quiz Odasına Katılınamadı</h2>
          <p className="text-sm text-slate-500 font-medium">{errorMessage || "Bu kodla aktif bir quiz odası bulunamadı veya oda kapatılmış."}</p>
        </div>
        <Button variant="primary" onClick={() => navigate("/quiz")} className="rounded-xl font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quiz Ana Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* CHEAT TAB BLUR WARNING BANNER */}
      {cheatWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 text-xs font-bold"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{cheatWarning}</span>
        </motion.div>
      )}

      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/quiz")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Quizler</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="font-mono text-xs px-2.5 py-1">
            ODA: #{code}
          </Badge>
          {room?.category && (
            <Badge variant="info" className="text-xs">
              {room.category}
            </Badge>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. LOBBY VIEW */}
      {/* ========================================================= */}
      {status === "LOBBY" && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-10 text-center space-y-6 bg-linear-to-b from-blue-50/60 to-transparent dark:from-blue-950/20 dark:to-transparent border-blue-200/50 dark:border-blue-900/40">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                GENÇ QUIZ BEKLEME SALONU
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {room?.title || "Quiz Odası"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {room?.questionCount} Soru • Soru Başına {room?.timePerQuestion} Saniye • {room?.difficulty}
              </p>
            </div>

            {/* BIG DISTINCTIVE ROOM CODE BOX */}
            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-blue-400 dark:border-blue-600 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ODA KODU
              </span>
              <span className="text-4xl font-black font-mono tracking-widest text-blue-600 dark:text-blue-400 block select-all">
                {code}
              </span>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  className="rounded-lg text-xs font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copied ? "Kopyalandı" : "Kodu Kopyala"}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-lg text-xs font-bold"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  <span>Paylaş</span>
                </Button>
              </div>
            </div>

            {/* ACTION: START QUIZ FOR HOST / WAITING FOR GUESTS */}
            <div className="max-w-sm mx-auto pt-2">
              {isHost ? (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartQuiz}
                    disabled={players.length === 0}
                    className="w-full py-3.5 rounded-2xl font-black text-base bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-xl shadow-emerald-500/25 cursor-pointer"
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    QUIZ'İ BAŞLAT ({players.length} Oyuncu)
                  </Button>
                  <p className="text-[11px] text-slate-400">
                    Oda kurucusu olarak istediğin zaman oyunu başlatabilirsin.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Oda kurucusunun quiz'i başlatması bekleniyor...
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* PLAYERS IN LOBBY GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Lobideki Oyuncular ({players.length})</span>
              </h3>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  + Arkadaşını Davet Et
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((p) => {
                const isCurrent = user && p.userId === user.id;

                return (
                  <Card
                    key={p.userId}
                    className={`p-3.5 flex items-center gap-3 transition-all ${
                      isCurrent ? "border-blue-500 ring-2 ring-blue-500/20" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar
                        url={p.avatarUrl}
                        name={p.username}
                        size="md"
                        className="ring-1 ring-slate-200 dark:ring-white/10"
                      />
                      {p.isHost && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                          <Crown className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                        {p.username}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
                        {p.isHost ? "Oda Sahibi" : "Hazır"}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LIVE QUESTION SCREEN (ARENA) */}
      {/* ========================================================= */}
      {status === "QUESTION_ACTIVE" && currentQuestion && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* TOP INFO & PROGRESS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="uppercase tracking-wider">
                Soru {currentQuestion.currentIndex + 1} / {currentQuestion.totalCount}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" className="text-[11px]">{currentQuestion.category}</Badge>
                {currentPlayer && (
                  <Badge variant="primary" className="text-[11px]">
                    Skor: {currentPlayer.score}
                  </Badge>
                )}
              </div>
            </div>

            {/* TIMER BAR */}
            <div className="relative w-full h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeLeft <= 5 ? "bg-rose-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-blue-600"
                }`}
                style={{
                  width: `${(timeLeft / (currentQuestion.duration || 20)) * 100}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {players.filter(p => p.hasAnsweredCurrent).length} / {players.length} oyuncu cevapladı
              </span>
              <span className={`text-base font-black font-mono ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-blue-600"}`}>
                ⏱️ {timeLeft}s
              </span>
            </div>
          </div>

          {/* QUESTION CARD */}
          <Card className="p-6 sm:p-8 text-center space-y-4 shadow-md border-slate-200/80 dark:border-white/10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {currentQuestion.questionText}
            </h2>
          </Card>

          {/* 4 LARGE OPTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={answerSubmitted}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`p-4 sm:p-5 rounded-2xl text-left border-2 font-bold text-sm sm:text-base flex items-start gap-3 transition-all duration-150 cursor-pointer min-h-[64px] active:scale-[0.98] ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                      : answerSubmitted
                      ? "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-400 opacity-60 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-blue-500 hover:shadow-md text-slate-900 dark:text-white"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="leading-snug pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* SUBMITTED STATUS BAR */}
          {answerSubmitted && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cevabınız alındı! Diğer oyuncular bekleniyor veya süre dolunca sonuç açılacak.</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUESTION RESULT REVEAL */}
      {/* ========================================================= */}
      {status === "QUESTION_RESULT" && revealedResult && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Card className="p-6 sm:p-8 text-center space-y-5 border-2 border-blue-500/30 shadow-lg">
            {/* User result indicator */}
            {selectedOption ? (
              selectedOption === revealedResult.correctOptionKey ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    Tebrikler, Doğru Cevap! 🎉
                  </h3>
                  {answerResult && (
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      +{answerResult.pointsEarned} Puan Kazandın! {answerResult.streak > 1 ? `🔥 (${answerResult.streak} Seri)` : ""}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    Yanlış Cevap
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Bu sorudan puan kazanamadın.</p>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">
                  Süre Doldu (Cevap Verilmedi)
                </h3>
              </div>
            )}

            {/* Correct answer display */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Doğru Cevap:</span>
              <p className="text-base font-black text-emerald-800 dark:text-emerald-200">
                {revealedResult.correctOptionKey}) {revealedResult.correctOptionText}
              </p>
            </div>

            {/* Explanation if available */}
            {revealedResult.explanation && (
              <p className="text-xs text-slate-500 italic max-w-md mx-auto">
                💡 {revealedResult.explanation}
              </p>
            )}

            <div className="text-xs font-bold text-slate-400">
              5 saniye içinde sonraki soruya geçiliyor...
            </div>
          </Card>

          {/* MINI LIVE LEADERBOARD */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Canlı Sıralama</span>
            </h4>

            <div className="space-y-2">
              {players.slice(0, 5).map((p, idx) => {
                const isMe = user && p.userId === user.id;

                return (
                  <div
                    key={p.userId}
                    className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
                      isMe
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-xs w-5 text-center text-slate-400">
                        #{idx + 1}
                      </span>
                      <Avatar
                        url={p.avatarUrl}
                        name={p.username}
                        size="xs"
                        className="shrink-0"
                      />
                      <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
                        {p.username} {isMe ? "(Sen)" : ""}
                      </span>
                    </div>

                    <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                      {p.score} Puan
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. QUIZ FINISHED (PODIUM & SCORECARD) */}
      {/* ========================================================= */}
      {status === "FINISHED" && finishedData && (
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              YARIŞMA SONA ERDİ
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              🏆 Genç Quiz Şampiyonları
            </h1>
            <p className="text-xs text-slate-500 font-medium">Tüm sorular tamamlandı. İşte yarışmanın sonuçları ve podyumu!</p>
          </div>

          {/* PODIUM (1ST, 2ND, 3RD) */}
          <div className="grid grid-cols-3 gap-3 items-end pt-8 pb-4">
            {/* 2nd Place */}
            {finishedData.podium[1] && (
              <div className="flex flex-col items-center space-y-2">
                <Avatar
                  url={finishedData.podium[1].avatarUrl}
                  name={finishedData.podium[1].username}
                  size="md"
                  className="ring-2 ring-slate-300"
                />
                <span className="font-bold text-xs sm:text-sm truncate max-w-[90px] text-center">
                  {finishedData.podium[1].username}
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-2xl p-3 text-center h-28 flex flex-col justify-between">
                  <span className="text-2xl">🥈</span>
                  <span className="font-mono font-black text-xs text-slate-700 dark:text-slate-300">
                    {finishedData.podium[1].score} P
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {finishedData.podium[0] && (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Avatar
                    url={finishedData.podium[0].avatarUrl}
                    name={finishedData.podium[0].username}
                    size="lg"
                    className="ring-4 ring-amber-400 shadow-xl"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                    👑
                  </div>
                </div>
                <span className="font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 truncate max-w-[120px] text-center">
                  {finishedData.podium[0].username}
                </span>
                <div className="w-full bg-amber-100 dark:bg-amber-950/60 rounded-t-2xl p-4 text-center h-36 flex flex-col justify-between border-t-2 border-amber-400">
                  <span className="text-3xl">🥇</span>
                  <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300">
                    {finishedData.podium[0].score} Puan
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {finishedData.podium[2] && (
              <div className="flex flex-col items-center space-y-2">
                <Avatar
                  url={finishedData.podium[2].avatarUrl}
                  name={finishedData.podium[2].username}
                  size="md"
                  className="ring-2 ring-amber-700/40"
                />
                <span className="font-bold text-xs sm:text-sm truncate max-w-[90px] text-center">
                  {finishedData.podium[2].username}
                </span>
                <div className="w-full bg-amber-900/10 dark:bg-amber-950/30 rounded-t-2xl p-3 text-center h-24 flex flex-col justify-between">
                  <span className="text-2xl">🥉</span>
                  <span className="font-mono font-black text-xs text-amber-800 dark:text-amber-400">
                    {finishedData.podium[2].score} P
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* USER PERSONAL SCORECARD */}
          {currentPlayer && (
            <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Yarışma Karneniz
                </span>
                <Badge variant="primary" className="text-xs font-black">
                  {currentPlayer.rank}. Sıra ({players.length} Oyuncu Arasında)
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block">Toplam Puan</span>
                  <span className="text-xl font-black text-amber-500">{currentPlayer.score}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block">Doğru Cevap</span>
                  <span className="text-xl font-black text-emerald-500">{currentPlayer.correctAnswersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block">Yanlış Cevap</span>
                  <span className="text-xl font-black text-rose-500">{currentPlayer.wrongAnswersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 font-bold block">En Yüksek Seri</span>
                  <span className="text-xl font-black text-purple-500">{currentPlayer.maxStreak} 🔥</span>
                </div>
              </div>
            </Card>
          )}

          {/* FULL LEADERBOARD */}
          <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="p-4 bg-slate-50 dark:bg-white/[0.02] text-xs font-black uppercase tracking-wider text-slate-500">
              Tüm Katılımcılar
            </div>
            {finishedData.leaderboard.map((p, idx) => (
              <div key={p.userId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs w-5 text-slate-400">#{idx + 1}</span>
                  <Avatar url={p.avatarUrl} name={p.username} size="sm" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {p.username}
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-amber-500">
                  {p.score} Puan
                </span>
              </div>
            ))}
          </Card>

          {/* ACTIONS */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button variant="secondary" onClick={() => navigate("/quiz")} className="rounded-xl font-bold">
              Quiz Hub'a Dön
            </Button>
            <Button variant="primary" onClick={() => navigate("/quiz")} className="rounded-xl font-bold">
              Yeni Quiz Başlat 🚀
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT INVITE FRIEND */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Arkadaşını Odaya Davet Et</h3>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Kullanıcı adını yazarak arkadaşına bildirim olarak anlık davet gönderebilirsin.
              </p>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adı (örn: ahmet)"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-semibold"
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl font-bold text-xs"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={sendingInvite}
                    className="rounded-xl font-bold text-xs"
                  >
                    Davet Gönder
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
