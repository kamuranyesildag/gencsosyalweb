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
  VolumeX,
  QrCode,
  Flame,
  Radio,
  UserX,
  MessageSquare,
  Compass,
  Send
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

interface FloatingReaction {
  id: string;
  userId: number;
  username: string;
  emoji: string;
  x: number;
}

const WARMUP_TIPS = [
  "⚡ Hızlı cevap veren yarışmacılar +50 puana kadar ekstra Hız Bonusu kazanır!",
  "🔥 Arka arkaya 3 ve üzeri doğru cevap vermek Seri Çarpanını aktif eder.",
  "🧠 Soru başına verilen süreyi dikkatli kullan; son 5 saniye ekran rengi uyarır!",
  "🇹🇷 Genç Quiz'de Genel Kültür'den Bilim ve Teknolojiye zengin milli soru havuzu bulunur.",
  "🏆 Yarışma sonunda ilk 3'e giren yarışmacılar şampiyonluk podyumunda taçlandırılır."
];

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

  // Modals & UI Controls
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // WebSocket Ref & Audio Context
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isHost = user && room && (room.hostId === user.id || players.find(p => p.userId === user.id)?.isHost);

  // Sound Synth Generator
  const playSoundEffect = (type: "pop" | "start" | "correct" | "wrong" | "tick" | "win") => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "start") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.1);
        osc.frequency.setValueAtTime(660, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio not permitted or failed
    }
  };

  // Rotating tips in lobby
  useEffect(() => {
    if (status !== "LOBBY") return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % WARMUP_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [status]);

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
            playSoundEffect("pop");
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

          case "PLAYER_KICKED": {
            toast.error(data.message || "Odadan çıkarıldınız.");
            navigate("/quiz");
            break;
          }

          case "LOBBY_REACTION": {
            playSoundEffect("pop");
            const newReaction: FloatingReaction = {
              id: data.id || `${Date.now()}_${Math.random()}`,
              userId: data.userId,
              username: data.username,
              emoji: data.emoji,
              x: 10 + Math.random() * 80,
            };
            setFloatingReactions((prev) => [...prev.slice(-15), newReaction]);
            setTimeout(() => {
              setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 2500);
            break;
          }

          case "QUIZ_STARTED": {
            playSoundEffect("start");
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
            if (data.isCorrect) playSoundEffect("correct");
            else playSoundEffect("wrong");
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
            playSoundEffect("start");
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
        if (prev <= 5 && prev > 1) {
          playSoundEffect("tick");
        }
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

    playSoundEffect("start");
    wsRef.current.send(JSON.stringify({
      event: "START_QUIZ",
    }));
  };

  // Kick player (Host Only)
  const handleKickPlayer = (targetUserId: number) => {
    if (!isHost || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!confirm("Bu oyuncuyu odadan çıkarmak istediğinize emin misiniz?")) return;

    wsRef.current.send(JSON.stringify({
      event: "KICK_PLAYER",
      payload: { targetUserId },
    }));
  };

  // Send Lobby Reaction
  const handleSendReaction = (emoji: string) => {
    playSoundEffect("pop");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: "LOBBY_REACTION",
        payload: { emoji },
      }));
    } else {
      // Local fallback
      const newReaction: FloatingReaction = {
        id: `${Date.now()}_${Math.random()}`,
        userId: user?.id || 0,
        username: user?.username || "Sen",
        emoji,
        x: 10 + Math.random() * 80,
      };
      setFloatingReactions((prev) => [...prev, newReaction]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 2500);
    }
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
          optionKey: key,
          timeTakenMs,
        },
      }));
    }
  };

  // Copy Room Code
  const handleCopyCode = () => {
    playSoundEffect("pop");
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Oda kodu (${code}) panoya kopyalandı!`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Share Code
  const handleShare = async () => {
    playSoundEffect("pop");
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
        // Ignored
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
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center animate-spin shadow-lg shadow-blue-500/10">
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
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden relative min-h-[80vh]">
      {/* FLOATING EMOJI REACTIONS OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: "85vh", scale: 0.5, x: `${r.x}vw` }}
              animate={{ opacity: 1, y: "20vh", scale: 1.4 }}
              exit={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute flex flex-col items-center gap-1 drop-shadow-lg select-none"
            >
              <span className="text-4xl sm:text-5xl">{r.emoji}</span>
              <span className="text-[10px] font-black bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                {r.username}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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

      {/* TOP HEADER CONTROLS BAR */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate("/quiz")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quiz Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playSoundEffect("pop");
            }}
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <Badge variant="neutral" className="font-mono text-[11px] sm:text-xs px-2.5 py-1 font-bold">
            ODA #{code}
          </Badge>
          {room?.category && (
            <Badge variant="info" className="text-[11px] sm:text-xs font-bold hidden xs:inline-flex">
              {room.category}
            </Badge>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. LOBBY VIEW (MODERN, SLEEK & INTERACTIVE) */}
      {/* ========================================================= */}
      {status === "LOBBY" && (
        <div className="space-y-6">
          {/* ULTRA MODERN HERO LOBBY CARD */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 border border-blue-500/20 text-white p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Top Room Meta Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-[10px] sm:text-xs tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Lobi Aktif • Bekleniyor
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-blue-200 text-[10px] sm:text-xs font-bold">
                    {room?.category || "Genel"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {room?.title || "Genç Quiz Arenası"}
                </h1>
              </div>

              {/* Room Stats Pill Grid */}
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Soru Sayısı</div>
                  <div className="text-xs sm:text-sm font-black text-blue-300 font-mono">{room?.questionCount || 10} Soru</div>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Süre / Soru</div>
                  <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">{room?.timePerQuestion || 20}s</div>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Zorluk</div>
                  <div className="text-xs sm:text-sm font-black text-rose-300">{room?.difficulty || "Karışık"}</div>
                </div>
              </div>
            </div>

            {/* BIG DISTINCTIVE FUTURISTIC ROOM CODE SHOWCASE */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Left Code Card */}
              <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border-2 border-dashed border-blue-400/50 shadow-inner flex flex-col items-center justify-center space-y-3 text-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  CANLI ODA KATILIM KODU
                </span>

                <div className="text-4xl sm:text-5xl font-black font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 select-all py-1">
                  {code}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyCode}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl text-xs font-bold flex-1 sm:flex-none"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copied ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl text-xs font-bold flex-1 sm:flex-none"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                    <span>Paylaş</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowQrModal(true)}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl text-xs font-bold"
                    title="QR Kodu Göster"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  </Button>
                </div>
              </div>

              {/* Right Action / Host Control Deck */}
              <div className="flex flex-col justify-center space-y-3">
                {isHost ? (
                  <div className="space-y-2.5">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartQuiz}
                      disabled={players.length === 0}
                      className="w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>QUIZ'İ BAŞLAT ({players.length} Oyuncu)</span>
                    </Button>
                    <p className="text-[11px] text-blue-200/80 text-center font-medium">
                      👑 Oda kurucusu olarak istediğin an oyunu başlatabilirsin.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center mx-auto animate-pulse">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Oda Kurucusu Bekleniyor</h4>
                      <p className="text-xs text-blue-200/70">
                        Oyun başlatıldığında otomatik olarak 1. soruya geçeceksiniz.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rotating Warmup Tip */}
                <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/20 text-blue-200 text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span className="truncate">{WARMUP_TIPS[currentTipIndex]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYERS IN LOBBY GRID & LIVE REACTION BAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Lobideki Oyuncular</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
                  {players.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/40"
                  >
                    <span>+ Arkadaş Davet Et</span>
                  </button>
                )}
              </div>
            </div>

            {/* PLAYER TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((p) => {
                const isCurrent = user && p.userId === user.id;

                return (
                  <motion.div
                    key={p.userId}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`relative p-3.5 rounded-2xl border transition-all flex items-center gap-3 bg-white dark:bg-slate-900 shadow-xs ${
                      isCurrent
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        url={p.avatarUrl}
                        name={p.username}
                        size="md"
                        className="ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                      {p.isHost && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                          <Crown className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                          {p.username}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded-md shrink-0">
                            SEN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {p.isHost ? "Oda Sahibi" : "Hazır"}
                      </span>
                    </div>

                    {/* Host Kick Option */}
                    {isHost && !p.isHost && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleKickPlayer(p.userId)}
                        title="Odadan Çıkar"
                        className="opacity-60 hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                );
              })}

              {/* Empty Slot Teaser */}
              <div
                onClick={() => handleShare()}
                className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center font-bold text-xs shrink-0">
                  +
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-bold text-xs block truncate">Yeni Oyuncu</span>
                  <span className="text-[10px] block truncate">Kodu Paylaş</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE EMOJI REACTION LAUNCHPAD */}
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xs:inline">Canlı Tepki:</span>
              </span>
              <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
                {["🔥", "🚀", "🧠", "⚡", "🎉", "😎", "👋"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:scale-125 active:scale-95 transition-all text-base sm:text-lg shadow-xs cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LIVE QUESTION SCREEN (ARENA) */}
      {/* ========================================================= */}
      {status === "QUESTION_ACTIVE" && currentQuestion && (
        <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
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
          <Card className="p-5 sm:p-8 text-center space-y-4 shadow-md border-slate-200/80 dark:border-white/10">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {currentQuestion.questionText}
            </h2>
          </Card>

          {/* 4 LARGE OPTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
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
                  <span className="leading-snug pt-0.5 break-words">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* SUBMITTED STATUS BAR */}
          {answerSubmitted && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cevabınız alındı! Süre bitince sonuç açıklanacak.</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUESTION RESULT REVEAL */}
      {/* ========================================================= */}
      {status === "QUESTION_RESULT" && revealedResult && (
        <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
          <Card className="p-5 sm:p-8 text-center space-y-5 border-2 border-blue-500/30 shadow-lg">
            {/* User result indicator */}
            {selectedOption ? (
              selectedOption === revealedResult.correctOptionKey ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
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
                  <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
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
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Doğru Seçenek:</span>
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
        <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              YARIŞMA SONA ERDİ
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              🏆 Genç Quiz Şampiyonları
            </h1>
            <p className="text-xs text-slate-500 font-medium">Tüm sorular tamamlandı. İşte yarışmanın sonuçları ve podyumu!</p>
          </div>

          {/* PODIUM (1ST, 2ND, 3RD) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-8 pb-4">
            {/* 2nd Place */}
            {finishedData.podium[1] && (
              <div className="flex flex-col items-center space-y-2">
                <Avatar
                  url={finishedData.podium[1].avatarUrl}
                  name={finishedData.podium[1].username}
                  size="md"
                  className="ring-2 ring-slate-300"
                />
                <span className="font-bold text-[11px] sm:text-sm truncate max-w-[80px] sm:max-w-[100px] text-center">
                  {finishedData.podium[1].username}
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-2xl p-2.5 sm:p-3 text-center h-28 flex flex-col justify-between">
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
                <span className="font-black text-xs sm:text-base text-amber-600 dark:text-amber-400 truncate max-w-[90px] sm:max-w-[120px] text-center">
                  {finishedData.podium[0].username}
                </span>
                <div className="w-full bg-amber-100 dark:bg-amber-950/60 rounded-t-2xl p-3 sm:p-4 text-center h-36 flex flex-col justify-between border-t-2 border-amber-400">
                  <span className="text-3xl">🥇</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-amber-700 dark:text-amber-300">
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
                <span className="font-bold text-[11px] sm:text-sm truncate max-w-[80px] sm:max-w-[100px] text-center">
                  {finishedData.podium[2].username}
                </span>
                <div className="w-full bg-amber-900/10 dark:bg-amber-950/30 rounded-t-2xl p-2.5 sm:p-3 text-center h-24 flex flex-col justify-between">
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
            <Card className="p-4 sm:p-6 bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Yarışma Karneniz
                </span>
                <Badge variant="primary" className="text-xs font-black">
                  {currentPlayer.rank}. Sıra ({players.length} Oyuncu Arasında)
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold block">Toplam Puan</span>
                  <span className="text-lg sm:text-xl font-black text-amber-500">{currentPlayer.score}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold block">Doğru Cevap</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-500">{currentPlayer.correctAnswersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold block">Yanlış Cevap</span>
                  <span className="text-lg sm:text-xl font-black text-rose-500">{currentPlayer.wrongAnswersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold block">En Yüksek Seri</span>
                  <span className="text-lg sm:text-xl font-black text-purple-500">{currentPlayer.maxStreak || currentPlayer.streak} 🔥</span>
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
              <div key={p.userId} className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="font-mono font-bold text-xs w-5 text-slate-400 shrink-0">#{idx + 1}</span>
                  <Avatar url={p.avatarUrl} name={p.username} size="sm" className="shrink-0" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {p.username}
                  </span>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-amber-500 shrink-0">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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

      {/* MODAL: QR CODE MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Oda QR Kodu</h3>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 inline-block mx-auto shadow-inner">
                {/* SVG Mock QR Code */}
                <div className="w-44 h-44 flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl p-3 text-center space-y-2">
                  <QrCode className="w-20 h-20 text-cyan-400 mx-auto" />
                  <div className="font-mono font-black text-sm tracking-widest text-cyan-300">
                    {code}
                  </div>
                  <span className="text-[9px] text-slate-400">Telefon Kamerası ile Tara</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Arkadaşların kamerayla tarayarak veya oda kodunu girerek hemen katılabilir.
              </p>

              <Button
                variant="secondary"
                onClick={() => setShowQrModal(false)}
                className="w-full rounded-xl font-bold text-xs"
              >
                Kapat
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
