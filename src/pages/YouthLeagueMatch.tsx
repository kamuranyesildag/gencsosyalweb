import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useSEO } from "../hooks/useSEO";
import { 
  Trophy, 
  Clock, 
  ShieldAlert, 
  Swords, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  Award, 
  Home, 
  HelpCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { showToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  optionKey: string;
  optionText: string;
}

interface Question {
  order: number;
  questionId: number;
  question: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  options: Option[];
}

interface MatchState {
  id: number;
  seasonId: number;
  stage: string;
  player1Id: number;
  player2Id: number | null;
  isVsBot: boolean;
  botName: string | null;
  status: "ACTIVE" | "COMPLETED";
  player1Score: number;
  player2Score: number;
  currentQuestionIndex: number;
  winnerId: number | null;
}

export default function YouthLeagueMatch() {
  useSEO({
    title: "1v1 Bilgi Düellosu | 19 Mayıs Gençlik Ligi",
    description: "19 Mayıs Gençlik Ligi canlı bilgi ve yetenek düellosu!",
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question Answer Feedback State
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOptionKey: string;
    explanation: string;
    pointsEarned: number;
  } | null>(null);

  // Timer per question (in seconds)
  const [timeLeft, setTimeLeft] = useState(20);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-Cheat: blur / visibilitychange detector
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

  // Fetch match details
  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/v1/league/match/${id}`);
      const json = await res.json();
      if (json.success) {
        setMatch(json.match);
        setQuestions(json.questions || []);
      } else {
        showToast({ title: json.error?.message || "Maç yüklenemedi.", type: "error" });
        navigate("/youth-league");
      }
    } catch (err) {
      showToast({ title: "Maç verisi alınamadı.", type: "error" });
      navigate("/youth-league");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  // Anti-Cheat: Detect tab switch or window blur
  useEffect(() => {
    if (match?.status !== "ACTIVE" || feedback !== null) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          showToast({
            title: "⚠️ Uyarı: Sekme değiştirme tespit edildi! Adil yarışma kurallarına uyunuz.",
            type: "error",
          });
          // Report to server
          fetch(`/api/v1/league/match/${id}/flag-cheat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "tab_switch_blur" }),
          }).catch(console.error);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [match?.status, feedback, id]);

  // Timer countdown hook for current question
  useEffect(() => {
    if (match?.status !== "ACTIVE" || feedback !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(20);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match?.currentQuestionIndex, feedback]);

  const handleTimeOut = () => {
    if (selectedOption || isSubmitting || feedback) return;
    showToast({ title: "Süre doldu!", type: "error" });
    submitAnswer("TIMEOUT", 20000);
  };

  const handleSelectOption = (optionKey: string) => {
    if (selectedOption || isSubmitting || feedback) return; // Answer locked
    setSelectedOption(optionKey);
    const timeTaken = Date.now() - startTimeRef.current;
    submitAnswer(optionKey, timeTaken);
  };

  const submitAnswer = async (optKey: string, timeTakenMs: number) => {
    if (!match || isSubmitting) return;
    const currentQ = questions[match.currentQuestionIndex];
    if (!currentQ) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/league/match/${match.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          selectedOption: optKey === "TIMEOUT" ? null : optKey,
          timeTakenMs,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(json.answerResult);
        setMatch((prev) => (prev ? { ...prev, ...json.matchState } : prev));
      } else {
        showToast({ title: json.error?.message || "Cevap işlenemedi.", type: "error" });
      }
    } catch (err) {
      showToast({ title: "Bağlantı hatası.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">1v1 Arena Yükleniyor...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Maç bulunamadı.</p>
        <Link to="/youth-league">
          <Button variant="primary">Lige Dön</Button>
        </Link>
      </div>
    );
  }

  const isCompleted = match.status === "COMPLETED";
  const currentQ = questions[match.currentQuestionIndex];
  const opponentName = match.isVsBot ? match.botName || "BilgeGenç_06" : "Rakip Genç";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. TOP ARENA STATUS BAR */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 flex items-center justify-between">
        {/* Player 1 (User) */}
        <div className="flex items-center gap-3">
          <Avatar
            url={user?.avatarUrl || undefined}
            name={user?.username || "Sen"}
            size="md"
            className="ring-2 ring-blue-500"
          />
          <div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              @{user?.username || "Sen"}
              <Badge variant="primary" className="text-[10px] py-0">SEN</Badge>
            </div>
            <div className="text-lg font-black text-blue-400 font-mono">
              {match.player1Score} <span className="text-xs font-normal text-slate-400">Puan</span>
            </div>
          </div>
        </div>

        {/* VS Badge & Stage */}
        <div className="flex flex-col items-center justify-center px-4">
          <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-black text-xs shadow-inner">
            VS
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
            {match.stage === "QUALIFIERS" ? "Eleme Turu" : match.stage}
          </span>
        </div>

        {/* Player 2 (Opponent / Bot) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="font-extrabold text-sm text-white flex items-center justify-end gap-1.5">
              <Badge variant="outline" className="text-[10px] py-0 text-slate-300 border-slate-700">
                {match.isVsBot ? "BOT RAKİP" : "RAKİP"}
              </Badge>
              @{opponentName}
            </div>
            <div className="text-lg font-black text-rose-400 font-mono">
              {match.player2Score} <span className="text-xs font-normal text-slate-400">Puan</span>
            </div>
          </div>
          <Avatar name={opponentName} size="md" className="ring-2 ring-rose-500" />
        </div>
      </div>

      {/* 2. MATCH ARENA (ACTIVE QUESTION) */}
      {!isCompleted && currentQ && (
        <div className="space-y-6">
          {/* Question Header & Timer Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold bg-white dark:bg-slate-900">
                  {currentQ.category}
                </Badge>
                <Badge
                  variant={
                    currentQ.difficulty === "EASY"
                      ? "success"
                      : currentQ.difficulty === "HARD"
                      ? "danger"
                      : "primary"
                  }
                  className="text-xs"
                >
                  {currentQ.difficulty === "EASY"
                    ? "Kolay"
                    : currentQ.difficulty === "HARD"
                    ? "Zor (+50 Bonus)"
                    : currentQ.difficulty === "EXPERT"
                    ? "Uzman (+100 Bonus)"
                    : "Orta (+25 Bonus)"}
                </Badge>
              </div>

              {/* Live Timer Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs transition-colors ${
                  timeLeft <= 5
                    ? "bg-red-500 text-white animate-bounce"
                    : timeLeft <= 10
                    ? "bg-amber-400 text-slate-950"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {timeLeft}s
              </div>
            </div>

            {/* Timer visual progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft <= 5
                    ? "bg-red-600"
                    : timeLeft <= 10
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>

            <div className="text-right text-[11px] text-slate-400 font-medium">
              Soru {match.currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>

          {/* Question Text Card */}
          <Card className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </Card>

          {/* 4 Multi-Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.optionKey;
              const isRevealed = feedback !== null;
              const isCorrectAnswer = isRevealed && feedback.correctOptionKey === opt.optionKey;
              const isWrongSelected = isRevealed && isSelected && !feedback.isCorrect;

              let cardStyles =
                "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20";

              if (isCorrectAnswer) {
                cardStyles =
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-md";
              } else if (isWrongSelected) {
                cardStyles =
                  "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 ring-2 ring-red-500 shadow-md";
              } else if (isSelected) {
                cardStyles = "border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-600";
              }

              return (
                <button
                  key={opt.optionKey}
                  type="button"
                  disabled={isSubmitting || feedback !== null}
                  onClick={() => handleSelectOption(opt.optionKey)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-not-allowed ${cardStyles}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        isCorrectAnswer
                          ? "bg-emerald-600 text-white"
                          : isWrongSelected
                          ? "bg-red-600 text-white"
                          : isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {opt.optionKey}
                    </span>
                    <span className="font-semibold text-sm leading-snug">{opt.optionText}</span>
                  </div>

                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isWrongSelected && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Educational Feedback & Next Question Bar */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border-2 space-y-4 shadow-lg ${
                feedback.isCorrect
                  ? "border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30"
                  : "border-red-300 bg-red-50/70 dark:bg-red-950/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {feedback.isCorrect ? (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Zap className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3
                      className={`text-base font-black ${
                        feedback.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {feedback.isCorrect ? "Tebrikler! Doğru Cevap" : "Yanlış Cevap"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feedback.isCorrect
                        ? `+${feedback.pointsEarned} puan kazandın!`
                        : `Doğru seçenek: ${feedback.correctOptionKey}`}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleNextQuestion}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-extrabold rounded-2xl px-6 flex items-center gap-2"
                >
                  {match.currentQuestionIndex + 1 < questions.length ? "Sonraki Soru" : "Maçı Tamamla"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Explanatory pedagogical text */}
              {feedback.explanation && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-900 dark:text-white">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    Biliyor muydun?
                  </div>
                  {feedback.explanation}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* 3. MATCH COMPLETED SCREEN */}
      {isCompleted && (
        <Card className="p-8 sm:p-12 text-center rounded-3xl border-2 border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {match.player1Score > match.player2Score
                ? "🎉 Zafer! Maçı Kazandın!"
                : match.player1Score < match.player2Score
                ? "Dostluk Kazandı!"
                : "🤝 Berabere!"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              19 Mayıs Gençlik Ligi'nde gösterdiğin gayret puan tablosuna işlendi. Sıralamanı yükseltmek için yeni maçlara devam edebilirsin.
            </p>
          </div>

          {/* Scores Review */}
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="text-center">
              <Avatar name={user?.username || "Sen"} size="lg" className="mx-auto mb-2 ring-4 ring-blue-500" />
              <div className="font-bold text-xs text-slate-600 dark:text-slate-400">@{user?.username}</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {match.player1Score} Puan
              </div>
            </div>

            <div className="text-slate-300 font-black text-xl select-none">VS</div>

            <div className="text-center">
              <Avatar name={opponentName} size="lg" className="mx-auto mb-2 ring-4 ring-rose-500" />
              <div className="font-bold text-xs text-slate-600 dark:text-slate-400">@{opponentName}</div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {match.player2Score} Puan
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/youth-league">
              <Button
                variant="outline"
                className="rounded-2xl flex items-center gap-2 font-bold px-6 py-3"
              >
                <Home className="w-4 h-4" />
                Lig Ana Sayfası
              </Button>
            </Link>

            <Link to="/youth-league/leaderboard">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-500/25"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                Liderlik Tablosunu Gör
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
