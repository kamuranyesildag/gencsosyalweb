import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuthStore, isJwtExpired } from "../context/useAuth";
import { fetchApi, requestTokenRefresh } from "../lib/api";
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
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  QrCode,
  Flame,
  UserX,
  UserPlus,
  LogOut,
  Wifi,
  WifiOff,
  Lightbulb,
  X,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  CircularTimer,
  SegmentedProgress,
  QuizOptionCard,
  AnimatedScore,
  QuizPodium,
  QuizStatePanel,
  type OptionVisualState,
} from "../components/quiz/QuizPrimitives";
import { cn } from "../lib/utils";

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
  "Hızlı doğru cevaplar +50 puana kadar ek Hız Bonusu kazandırır.",
  "Arka arkaya 3 ve üzeri doğru cevap vermek Seri Çarpanını etkinleştirir.",
  "Her soruda son 5 saniyeye girildiğinde sayaç seni uyarır.",
  "Yarışma sonunda ilk 3 oyuncu şampiyonluk podyumunda yerini alır.",
];

export function QuizRoom() {
  const { code: rawCode } = useParams<{ code: string }>();
  const code = (rawCode || "").toUpperCase().trim();

  const { user, isAuthenticated, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useSEO({
    title: code ? `Genç Quiz #${code} — Canlı Yarışma Odası | Genç Sosyal` : "Genç Quiz Canlı Oda | Genç Sosyal",
    description: `Genç Quiz #${code || ""} odasında canlı bilgi yarışması mücadelesi! Soruları en hızlı sen yanıtla ve zirveye yerleş.`,
    canonicalPath: code ? `/quiz/room/${code}` : undefined,
  });

  // Room & Connection State
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<
    "CONNECTING" | "LOBBY" | "QUESTION_ACTIVE" | "QUESTION_RESULT" | "FINISHED" | "ERROR"
  >("CONNECTING");
  const [wsState, setWsState] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Question State
  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<{
    pointsEarned: number;
    isCorrect: boolean;
    streak: number;
  } | null>(null);

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

  // User tab blur warning
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  // Clipboard & Modals
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isHost = Boolean(
    user && room && (room.hostId === user.id || players.find((p) => p.userId === user.id)?.isHost)
  );

  // Sound Synth Generator (Preserved)
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
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "start") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.1);
        osc.frequency.setValueAtTime(660, now + 0.2);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio not permitted
    }
  };

  // Rotating warmup tips in lobby
  useEffect(() => {
    if (status !== "LOBBY") return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % WARMUP_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  // Connect WebSocket & Fetch Initial Room Details (100% Preserved Protocol)
  useEffect(() => {
    if (!code) return;

    let isSubscribed = true;

    const fetchRoomDetails = async () => {
      try {
        const res = await fetchApi(`/quiz/rooms/${code}`);
        const json = await res.json();
        if (!isSubscribed) return;

        if (json.success && json.room) {
          setRoom(json.room);
          if (json.players) setPlayers(json.players);
          setStatus((prev) => (prev === "CONNECTING" ? json.room.status || "LOBBY" : prev));
        } else if (!json.success) {
          setErrorMessage(json.error?.message || "Oda bulunamadı.");
          setStatus("ERROR");
        }
      } catch (e) {
        console.error("HTTP Room Fetch error:", e);
      }
    };

    fetchRoomDetails();

    let ws: WebSocket | null = null;
    const connectWs = async () => {
      setWsState("connecting");
      let currentToken = useAuthStore.getState().accessToken;
      if (!currentToken || isJwtExpired(currentToken)) {
        const refreshed = await requestTokenRefresh();
        if (refreshed.success) {
          currentToken = refreshed.accessToken;
        }
      }
      if (!isSubscribed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/quiz/ws${
        currentToken ? `?token=${encodeURIComponent(currentToken)}` : ""
      }`;

      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          setWsState("connected");
          ws?.send(
            JSON.stringify({
              event: "JOIN_ROOM",
              payload: { roomCode: code, token: currentToken },
            })
          );
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const message = JSON.parse(event.data);
            const { event: evtName, data } = message;

            switch (evtName) {
              case "ROOM_STATE":
              case "ROOM_JOINED": {
                const roomObj = data.room || data;
                setRoom(roomObj);
                setPlayers(data.players || data.leaderboard || []);
                setStatus(roomObj.status || "LOBBY");

                if (data.currentQuestion) {
                  setCurrentQuestion(data.currentQuestion);
                  setTimeLeft(data.currentQuestion.duration || 20);
                }
                break;
              }

              case "PLAYER_JOINED": {
                playSoundEffect("pop");
                if (data.player) {
                  setPlayers((prev) => {
                    const existingIdx = prev.findIndex((p) => p.userId === data.player.userId);
                    if (existingIdx >= 0) {
                      const next = [...prev];
                      next[existingIdx] = { ...next[existingIdx], ...data.player, isConnected: true };
                      return next;
                    }
                    return [...prev, data.player];
                  });
                } else if (data.players) {
                  setPlayers(data.players);
                }
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
                  x: 12 + Math.random() * 76,
                };
                setFloatingReactions((prev) => [...prev.slice(-12), newReaction]);
                setTimeout(() => {
                  setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
                }, 2400);
                break;
              }

              case "QUIZ_STARTED": {
                playSoundEffect("start");
                setStatus("QUESTION_ACTIVE");
                toast.info("Yarışma başladı! Başarılar!");
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

        ws.onerror = () => {
          if (isSubscribed) setWsState("disconnected");
        };

        ws.onclose = () => {
          if (isSubscribed) setWsState("disconnected");
        };
      } catch (wsErr) {
        console.error("Failed to establish WebSocket connection:", wsErr);
        if (isSubscribed) setWsState("disconnected");
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [code, accessToken, navigate]);

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
        setCheatWarning("Dikkat: Soru esnasında sekmeden ayrıldınız.");
        setTimeout(() => setCheatWarning(null), 4000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  // Host Actions
  const handleStartQuiz = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Canlı sunucu bağlantısı aktif değil.");
      return;
    }

    playSoundEffect("start");
    wsRef.current.send(
      JSON.stringify({
        event: "START_QUIZ",
      })
    );
  };

  const handleKickPlayer = async (targetUserId: number, username: string) => {
    if (!isHost || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const ok = await confirmDialog({
      title: "Oyuncuyu Odadan Çıkar",
      message: `@${username} kullanıcısını odadan çıkarmak istediğinize emin misiniz?`,
      confirmLabel: "Çıkar",
      cancelLabel: "Vazgeç",
      variant: "danger",
    });
    if (!ok) return;

    wsRef.current.send(
      JSON.stringify({
        event: "KICK_PLAYER",
        payload: { targetUserId },
      })
    );
  };

  const handleLeaveRoom = async () => {
    if (status === "QUESTION_ACTIVE" || status === "QUESTION_RESULT") {
      const ok = await confirmDialog({
        title: "Yarışmadan Ayrıl",
        message: "Yarışma devam ediyor. Odadan çıkmak istediğinize emin misiniz?",
        confirmLabel: "Odadan Çık",
        cancelLabel: "Devam Et",
        variant: "warning",
      });
      if (!ok) return;
    }
    navigate("/quiz");
  };

  const handleSendReaction = (emoji: string) => {
    playSoundEffect("pop");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "LOBBY_REACTION",
          payload: { emoji },
        })
      );
    }
  };

  const handleSelectOption = (key: string) => {
    if (answerSubmitted || status !== "QUESTION_ACTIVE") return;

    setSelectedOption(key);
    setAnswerSubmitted(true);

    const timeTakenMs = Date.now() - questionStartTime;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "SUBMIT_ANSWER",
          payload: {
            optionKey: key,
            timeTakenMs,
          },
        })
      );
    } else {
      toast.error("Bağlantı koptuğu için cevabınız gönderilemedi.");
    }
  };

  const handleCopyCode = () => {
    playSoundEffect("pop");
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Oda kodu (${code}) kopyalandı.`);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleCopyRoomLink = () => {
    playSoundEffect("pop");
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Oda bağlantısı kopyalandı.");
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleShare = async () => {
    playSoundEffect("pop");
    const shareText = `Genç Sosyal'de "${room?.title || "Genç Quiz"}" odasına davetlisin! Oda Kodu: ${code}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Genç Quiz Daveti",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyCode();
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setSendingInvite(true);
    try {
      const res = await fetchApi(`/quiz/rooms/${code}/invite`, {
        method: "POST",
        data: { receiverUsername: inviteUsername.trim() },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Davet gönderilemedi.");
      } else {
        toast.success(json.message || "Davet iletildi!");
        setInviteUsername("");
        setShowInviteModal(false);
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setSendingInvite(false);
    }
  };

  const currentPlayer = players.find((p) => user && p.userId === user.id);
  const hostPlayer = players.find((p) => p.isHost);

  // =========================================================================
  // RENDER: CONNECTING & ERROR STATES
  // =========================================================================
  if (status === "CONNECTING") {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-10 text-center space-y-4 shadow-xs">
          <motion.div
            animate={prefersReducedMotion ? undefined : { rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto"
          >
            <Gamepad2 className="w-7 h-7" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Odaya Bağlanılıyor...
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Oda <span className="font-mono font-bold text-[#2563EB]">#{code}</span> hazırlanıyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-14">
        <QuizStatePanel
          variant="error"
          icon={<AlertCircle className="w-6 h-6" />}
          title="Quiz Odasına Katılınamadı"
          description={
            errorMessage ||
            "Bu kodla aktif bir quiz odası bulunamadı veya yarışma sona ermiş olabilir."
          }
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/quiz")}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="rounded-2xl font-bold"
            >
              Quiz Merkezine Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24 relative">
      {/* FLOATING LOBBY REACTIONS OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: "82vh", scale: 0.6, x: `${r.x}vw` }}
              animate={{ opacity: 1, y: "24vh", scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 2.1, ease: "easeOut" }}
              className="absolute flex flex-col items-center gap-1 select-none"
            >
              <span className="text-3xl sm:text-4xl drop-shadow-sm">{r.emoji}</span>
              <span className="text-[10px] font-bold bg-slate-900/75 text-white px-2 py-0.5 rounded-full">
                {r.username}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ANTI-CHEAT TAB BLUR WARNING */}
      <AnimatePresence>
        {cheatWarning && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            role="alert"
            className="rounded-[18px] bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-amber-800 dark:text-amber-300 flex items-center gap-2.5 text-xs sm:text-sm font-semibold"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{cheatWarning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          UNIFIED ARENA TOP BAR
          Logo/Icon · Room Name · Question # · Player Score · Sound · Leave
          ===================================================================== */}
      <header className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] px-3.5 sm:px-5 py-3 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
        {/* Left: Brand Icon + Room Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F2557] to-[#2563EB] text-white flex items-center justify-center shrink-0">
            <Gamepad2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <span>Genç Quiz</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#2563EB] dark:text-blue-400">#{code}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {room?.title || "Canlı Yarışma Odası"}
            </h2>
          </div>
        </div>

        {/* Right: Score (during game) + Sound + Exit */}
        <div className="flex items-center gap-2 shrink-0">
          {(status === "QUESTION_ACTIVE" || status === "QUESTION_RESULT") && currentPlayer && (
            <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08]">
              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <AnimatedScore
                value={currentPlayer.score}
                className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white"
              />
              {currentPlayer.streak > 1 && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-1 tabular-nums">
                  <Flame className="w-3 h-3" />
                  {currentPlayer.streak}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSoundEffect("pop");
            }}
            aria-label={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleLeaveRoom}
            aria-label="Odadan Çık"
            title="Odadan Çık"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#EF4444] hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çık</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          VIEW 1: WAITING LOBBY
          ===================================================================== */}
      <AnimatePresence mode="wait">
        {status === "LOBBY" && (
          <motion.div
            key="room-lobby"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Lobby Hero & Code Deck */}
            <div className="rounded-[24px] bg-gradient-to-br from-[#0F2557] via-[#1D4ED8] to-[#4338CA] text-white p-5 sm:p-8 shadow-[0_14px_34px_-12px_rgba(15,37,87,0.36)] space-y-6">
              {/* Top Meta Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/15">
                <div className="space-y-2">
                  {/* Real WebSocket Connection Status */}
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100">
                    {wsState === "connected" ? (
                      <>
                        <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Canlı Bağlantı Aktif · Bekleme Lobisi</span>
                      </>
                    ) : wsState === "connecting" ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        <span>Canlı Bağlantı Kuruluyor...</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-rose-300" />
                        <span>Bağlantı Kesildi · Sayfayı Yenileyin</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white [text-wrap:balance]">
                    {room?.title || "Genç Quiz Odası"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-blue-100/90">
                    <span>{room?.category || "Karışık"}</span>
                    <span aria-hidden="true">·</span>
                    <span>{room?.difficulty || "Karışık"}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{room?.questionCount || 10} soru</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{room?.timePerQuestion || 20} sn / soru</span>
                    {hostPlayer && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Kurucu: @{hostPlayer.username}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Card + Start/Waiting Deck */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                {/* Large Copyable Room Code */}
                <div className="md:col-span-7 rounded-[20px] bg-white/[0.11] border border-white/20 p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-blue-100">
                      Oda Katılım Kodu
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Kod</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="w-full py-3 rounded-2xl bg-black/20 hover:bg-black/25 border border-white/15 transition-colors cursor-pointer text-center group"
                    title="Kodu kopyalamak için tıkla"
                  >
                    <span className="font-mono text-3xl sm:text-4xl font-black tracking-[0.26em] text-white select-all pl-[0.26em]">
                      {code}
                    </span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Paylaş</span>
                    </button>

                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => setShowInviteModal(true)}
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Davet Et</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Göster</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Host Launch / Participant Waiting Column */}
                <div className="md:col-span-5 flex flex-col justify-between gap-3">
                  {isHost ? (
                    <div className="rounded-[20px] bg-white/[0.11] border border-white/20 p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Oda Kurucusu Kontrolü</span>
                        </div>
                        <p className="text-xs text-blue-100/85 leading-relaxed">
                          Tüm oyuncular hazır olduğunda yarışmayı tek tıkla başlatabilirsin.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleStartQuiz}
                        disabled={players.length === 0 || wsState !== "connected"}
                        leftIcon={<Play className="w-4 h-4 fill-current" />}
                        className="rounded-2xl bg-white hover:bg-blue-50 text-[#0F2557] border-transparent font-extrabold text-sm shadow-md"
                      >
                        Yarışmayı Başlat ({players.length})
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-[20px] bg-white/[0.11] border border-white/20 p-5 flex-1 flex flex-col items-center justify-center text-center space-y-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        Oda Kurucusu Bekleniyor
                      </h3>
                      <p className="text-xs text-blue-100/80 leading-relaxed">
                        Yarışma başlatıldığında 1. soru ekranı otomatik olarak açılacak.
                      </p>
                    </div>
                  )}

                  {/* Calm Warmup Tip */}
                  <div className="rounded-2xl bg-black/20 border border-white/10 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-blue-100">
                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="line-clamp-2 leading-snug">
                      {WARMUP_TIPS[currentTipIndex]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Section */}
            <section className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-5 sm:p-6 space-y-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-[#2563EB]" />
                    <span>Katılımcılar</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {players.length} / {room?.maxPlayers || 30}
                  </span>
                </div>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 text-xs font-bold hover:bg-blue-100/80 dark:hover:bg-blue-950/70 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Arkadaş Davet Et</span>
                  </button>
                )}
              </div>

              {/* Animated Player Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence initial={false}>
                  {players.map((p) => {
                    const isCurrent = Boolean(user && p.userId === user.id);

                    return (
                      <motion.div
                        key={p.userId}
                        layout
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.22 }}
                        className={cn(
                          "p-3.5 rounded-[18px] border flex items-center gap-3 transition-colors",
                          isCurrent
                            ? "bg-blue-50/70 dark:bg-blue-950/30 border-[#2563EB]/50"
                            : "bg-[#F8FAFC] dark:bg-[#0B1120] border-slate-200/80 dark:border-white/[0.07]"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar
                            url={p.avatarUrl}
                            name={p.username}
                            size="md"
                            className="ring-2 ring-white dark:ring-[#111B2E]"
                          />
                          {p.isHost && (
                            <span
                              title="Oda Kurucusu"
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-[#0F2557] flex items-center justify-center ring-2 ring-white dark:ring-[#111B2E]"
                            >
                              <Crown className="w-3 h-3 fill-current" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {p.username}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 shrink-0">
                                (Sen)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                p.isConnected ? "bg-[#16A34A]" : "bg-slate-400"
                              )}
                            />
                            <span className="truncate">
                              {p.isHost
                                ? "Oda Kurucusu"
                                : p.isConnected
                                ? "Bağlı"
                                : "Çevrimdışı"}
                            </span>
                          </div>
                        </div>

                        {isHost && !p.isHost && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleKickPlayer(p.userId, p.username)}
                            title="Odadan Çıkar"
                            aria-label={`${p.username} oyuncusunu odadan çıkar`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Invite Teaser Slot */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3.5 rounded-[18px] border border-dashed border-slate-300 dark:border-white/[0.14] flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">Oyuncu Davet Et</span>
                    <span className="text-[11px] opacity-80 block truncate">Kodu paylaş</span>
                  </div>
                </button>
              </div>

              {/* Lobby Reactions Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  Lobi Tepkisi
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                  {["🔥", "🚀", "🧠", "⚡", "🎉", "👏", "👋"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="w-9 h-9 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] hover:border-[#2563EB]/40 hover:scale-110 active:scale-95 transition-all text-base flex items-center justify-center cursor-pointer shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* =====================================================================
            VIEW 2: LIVE QUESTION SCREEN (THE CORE ARENA)
            ===================================================================== */}
        {status === "QUESTION_ACTIVE" && currentQuestion && (
          <motion.div
            key={`question-active-${currentQuestion.currentIndex}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto space-y-5"
          >
            {/* Progress Bar + Circular Countdown Timer */}
            <div className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
              <SegmentedProgress
                total={currentQuestion.totalCount}
                currentIndex={currentQuestion.currentIndex}
                rightLabel={
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5 tabular-nums">
                    <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                    {players.filter((p) => p.hasAnsweredCurrent).length} / {players.length} cevapladı
                  </span>
                }
              />

              <CircularTimer
                timeLeft={timeLeft}
                totalTime={currentQuestion.duration || 20}
                size={60}
              />
            </div>

            {/* Central Question Card */}
            <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.08)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-[#2563EB] dark:text-blue-400">
                    {currentQuestion.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentQuestion.difficulty}</span>
                </div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  100+ puan · Hız bonusu
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug [text-wrap:balance]">
                {currentQuestion.questionText}
              </h1>
            </div>

            {/* 4 Modern Answer Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                let optState: OptionVisualState = "normal";
                if (isSelected) {
                  optState = "selected";
                } else if (answerSubmitted) {
                  optState = "locked";
                }

                return (
                  <QuizOptionCard
                    key={opt.key}
                    optionKey={opt.key}
                    text={opt.text}
                    state={optState}
                    disabled={answerSubmitted}
                    onClick={() => handleSelectOption(opt.key)}
                  />
                );
              })}
            </div>

            {/* Answer Locked Status Bar */}
            <AnimatePresence>
              {answerSubmitted && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  className="rounded-[18px] bg-blue-50/80 dark:bg-blue-950/35 border border-blue-200/80 dark:border-blue-500/25 px-4 py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#1D4ED8] dark:text-blue-300"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cevabın kilitlendi. Süre tamamlandığında sonuç açıklanacak.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =====================================================================
            VIEW 3: QUESTION RESULT REVEAL & LIVE STANDINGS
            ===================================================================== */}
        {status === "QUESTION_RESULT" && revealedResult && (
          <motion.div
            key="room-question-result"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto space-y-5"
          >
            {/* Outcome Hero Card */}
            <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-5 sm:p-7 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.08)] space-y-5">
              {/* Outcome Banner */}
              {selectedOption ? (
                selectedOption === revealedResult.correctOptionKey ? (
                  <div className="rounded-[18px] bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-4 sm:p-5 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                        Doğru Cevap!
                      </h3>
                      {answerResult && (
                        <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                          +{answerResult.pointsEarned} puan kazandın
                          {answerResult.streak > 1 ? ` · ${answerResult.streak} soru serisi` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[18px] bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 p-4 sm:p-5 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EF4444] text-white flex items-center justify-center shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-rose-900 dark:text-rose-200">
                        Yanlış Cevap
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-300">
                        Doğru seçenek:{" "}
                        <strong>
                          {revealedResult.correctOptionKey}) {revealedResult.correctOptionText}
                        </strong>
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="rounded-[18px] bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-500/30 p-4 sm:p-5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-extrabold text-amber-900 dark:text-amber-200">
                      Süre Doldu
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                      Doğru seçenek:{" "}
                      <strong>
                        {revealedResult.correctOptionKey}) {revealedResult.correctOptionText}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Contextual Option Recap */}
              {currentQuestion && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt) => {
                    let state: OptionVisualState = "locked";
                    if (opt.key === revealedResult.correctOptionKey) {
                      state = "correct";
                    } else if (selectedOption === opt.key) {
                      state = "wrong";
                    }
                    return (
                      <QuizOptionCard
                        key={opt.key}
                        optionKey={opt.key}
                        text={opt.text}
                        state={state}
                        disabled
                        onClick={() => {}}
                      />
                    );
                  })}
                </div>
              )}

              {/* Explanation if provided */}
              {revealedResult.explanation && (
                <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.07] p-4 flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{revealedResult.explanation}</span>
                </div>
              )}

              <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                Sonraki soruya geçiliyor...
              </p>
            </div>

            {/* Live Top 5 Standings */}
            <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-5 space-y-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                  <span>Anlık Sıralama</span>
                </h4>
                <span className="text-xs text-slate-400 tabular-nums">İlk 5 oyuncu</span>
              </div>

              <div className="space-y-2">
                {players.slice(0, 5).map((p, idx) => {
                  const isMe = Boolean(user && p.userId === user.id);
                  return (
                    <motion.div
                      key={p.userId}
                      layout
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3",
                        isMe
                          ? "bg-blue-50/75 dark:bg-blue-950/35 border-[#2563EB]/45"
                          : "bg-[#F8FAFC] dark:bg-[#0B1120] border-slate-200/70 dark:border-white/[0.06]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-mono text-xs font-extrabold text-slate-400 tabular-nums">
                          #{idx + 1}
                        </span>
                        <Avatar url={p.avatarUrl} name={p.username} size="xs" className="shrink-0" />
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {p.username}
                          {isMe && (
                            <span className="ml-1.5 text-[11px] font-semibold text-[#2563EB] dark:text-blue-400">
                              (Sen)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums shrink-0">
                        {p.score.toLocaleString("tr-TR")} puan
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* =====================================================================
            VIEW 4: COMPETITION FINISHED (CHAMPIONSHIP PODIUM & FULL RANKING)
            ===================================================================== */}
        {status === "FINISHED" && finishedData && (
          <motion.div
            key="room-finished"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Championship Header & Podium Card */}
            <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-6 sm:p-8 pb-0 overflow-hidden shadow-[0_12px_32px_-16px_rgba(15,23,42,0.1)] space-y-6">
              <div className="text-center space-y-1.5">
                <p className="text-xs font-bold text-[#2563EB] dark:text-blue-400">
                  {room?.title || "Genç Quiz"} · {finishedData.totalQuestions} Soru
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Yarışma Tamamlandı!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tüm sorular cevaplandı. İşte podyum ve genel sıralama.
                </p>
              </div>

              <QuizPodium podium={finishedData.podium} />
            </div>

            {/* Personal Scorecard */}
            {currentPlayer && (
              <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Senin Performans Özetin
                  </h2>
                  <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 tabular-nums">
                    {currentPlayer.rank}. Sıra / {finishedData.leaderboard.length || players.length} Oyuncu
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Toplam Puan
                    </span>
                    <span className="text-xl font-extrabold text-[#2563EB] dark:text-blue-400 font-mono tabular-nums mt-0.5 block">
                      {currentPlayer.score.toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Doğru Cevap
                    </span>
                    <span className="text-xl font-extrabold text-[#16A34A] dark:text-emerald-400 font-mono tabular-nums mt-0.5 block">
                      {currentPlayer.correctAnswersCount}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Yanlış Cevap
                    </span>
                    <span className="text-xl font-extrabold text-[#EF4444] dark:text-rose-400 font-mono tabular-nums mt-0.5 block">
                      {currentPlayer.wrongAnswersCount}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      En İyi Seri
                    </span>
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5 block">
                      {currentPlayer.maxStreak || currentPlayer.streak || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
              <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Genel Sıralama</span>
                <span>Doğru · Puan</span>
              </div>

              {finishedData.leaderboard.map((p, idx) => {
                const isMe = Boolean(user && p.userId === user.id);
                return (
                  <div
                    key={p.userId}
                    className={cn(
                      "px-5 py-3.5 flex items-center justify-between gap-3",
                      isMe && "bg-blue-50/70 dark:bg-blue-950/30"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 font-mono text-xs font-extrabold text-slate-400 tabular-nums shrink-0">
                        #{idx + 1}
                      </span>
                      <Avatar url={p.avatarUrl} name={p.username} size="sm" className="shrink-0" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {p.username}
                        {isMe && (
                          <span className="ml-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                            (Sen)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right tabular-nums">
                      <span className="text-xs font-semibold text-[#16A34A] dark:text-emerald-400 hidden xs:inline">
                        {p.correctAnswersCount} doğru
                      </span>
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        {p.score.toLocaleString("tr-TR")} puan
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/quiz")}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto rounded-2xl font-bold"
              >
                Quiz Merkezine Dön
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/quiz", { state: { tab: "create" } })}
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full sm:w-auto rounded-2xl font-bold shadow-md shadow-blue-600/20"
              >
                Yeni Quiz Başlat
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL: DIRECT INVITE FRIEND
          ===================================================================== */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-[#111B2E] rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200/80 dark:border-white/[0.1]"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Arkadaşını Davet Et
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  aria-label="Kapat"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Kullanıcı adını girerek arkadaşına doğrudan Genç Sosyal bildirimiyle oda daveti gönder.
              </p>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adı (örn: ahmet)"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={sendingInvite}
                    className="rounded-xl text-xs font-bold"
                  >
                    Davet Gönder
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL: QR CODE ACCESS
          ===================================================================== */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-[#111B2E] rounded-[24px] max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/[0.1]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Oda Davet Kodu & QR
                </h3>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  aria-label="Kapat"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] p-6 flex flex-col items-center space-y-3">
                <div className="w-36 h-36 rounded-2xl bg-[#0F2557] text-white flex items-center justify-center shadow-sm">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    6 Karakterli Oda Kodu
                  </span>
                  <span className="font-mono text-2xl font-black tracking-[0.22em] text-[#2563EB] dark:text-blue-400">
                    {code}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Arkadaşların bu oda kodunu Genç Quiz ekranına girerek veya bağlantıyı açarak doğrudan katılabilir.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyRoomLink}
                  leftIcon={copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  className="rounded-xl text-xs font-bold"
                >
                  {copiedLink ? "Kopyalandı" : "Linki Kopyala"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQrModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Kapat
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
