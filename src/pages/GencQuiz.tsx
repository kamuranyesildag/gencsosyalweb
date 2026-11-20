import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { fetchApi } from "../lib/api";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import {
  Gamepad2,
  Plus,
  Layers,
  Trophy,
  Compass,
  History,
  Users,
  Check,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Zap,
  Globe,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  Scissors,
  SkipForward,
  RotateCcw,
  X,
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
  SixCharCodeInput,
  QuizStatePanel,
  QuizErrorBanner,
  type OptionVisualState,
} from "../components/quiz/QuizPrimitives";
import { cn } from "../lib/utils";

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
  "Karışık",
];

const DIFFICULTIES = ["Kolay", "Orta", "Zor", "Karışık"];
const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_LIMITS = [10, 15, 20, 30, 60];

interface SoloQuestion {
  id: number;
  subject: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  points: number;
  question: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctKey: "A" | "B" | "C" | "D";
  explanation: string;
}

const WEEKLY_SOLO_QUESTIONS: SoloQuestion[] = [
  {
    id: 1,
    subject: "Fizik",
    difficulty: "Orta",
    points: 40,
    question: "Bir İHA'nın havada kalmasını sağlayan kaldırma kuvveti, kanat üzerinde hangi prensiple açıklanır?",
    options: [
      { key: "A", text: "Arşimet prensibi" },
      { key: "B", text: "Bernoulli prensibi" },
      { key: "C", text: "Pascal prensibi" },
      { key: "D", text: "Ohm yasası" },
    ],
    correctKey: "B",
    explanation: "Kanat üst yüzeyinde hızlanan hava akımı basıncı düşürür (Bernoulli prensibi) ve yukarı yönlü kaldırma kuvveti oluşturur.",
  },
  {
    id: 2,
    subject: "Robotik",
    difficulty: "Orta",
    points: 40,
    question: "Otonom araçların eş zamanlı konum belirleme ve haritalama yapmasını sağlayan algoritmik yöntemin kısaltması nedir?",
    options: [
      { key: "A", text: "PWM" },
      { key: "B", text: "SLAM" },
      { key: "C", text: "PID" },
      { key: "D", text: "UART" },
    ],
    correctKey: "B",
    explanation: "Simultaneous Localization and Mapping (SLAM), robotların bilinmeyen bir ortamın haritasını çıkarırken kendi konumunu takip etmesini sağlar.",
  },
  {
    id: 3,
    subject: "Yazılım",
    difficulty: "Kolay",
    points: 30,
    question: "Modern yapay zekâ ve büyük dil modellerinin (LLM) temelini oluşturan derin öğrenme mimarisi hangisidir?",
    options: [
      { key: "A", text: "Transformer" },
      { key: "B", text: "Karar Ağaçları (Decision Tree)" },
      { key: "C", text: "K-Means Kümeleme" },
      { key: "D", text: "Lineer Regresyon" },
    ],
    correctKey: "A",
    explanation: "2017 yılında tanıtılan Transformer mimarisi (Self-Attention mekanizması), günümüzdeki LLM modellerinin temelini oluşturur.",
  },
  {
    id: 4,
    subject: "Havacılık",
    difficulty: "Orta",
    points: 40,
    question: "Bir roketin Dünya yörüngesine yerleşebilmesi için ulaşması gereken yaklaşık birinci kozmik hız (yörünge hızı) saniyede kaç kilometredir?",
    options: [
      { key: "A", text: "1,2 km/sn" },
      { key: "B", text: "3,4 km/sn" },
      { key: "C", text: "7,9 km/sn" },
      { key: "D", text: "18,5 km/sn" },
    ],
    correctKey: "C",
    explanation: "Alçak Dünya Yörüngesi'nde (LEO) tutunabilmek için gereken hız yaklaşık 7,9 km/sn (28.400 km/saat) seviyesindedir.",
  },
  {
    id: 5,
    subject: "Elektronik",
    difficulty: "Kolay",
    points: 30,
    question: "Gömülü sistemlerde mikrodenetleyicinin dijital bir pinle analog benzeri güç kontrolü (ör. motor hızı) yapmasını sağlayan teknik hangisidir?",
    options: [
      { key: "A", text: "PWM (Darbe Genişlik Modülasyonu)" },
      { key: "B", text: "I2C Protokolü" },
      { key: "C", text: "SPI Haberleşmesi" },
      { key: "D", text: "DNS Çözümleme" },
    ],
    correctKey: "A",
    explanation: "PWM (Pulse Width Modulation), sinyalin görev döngüsünü (duty cycle) değiştirerek motor hızı veya LED parlaklığı kontrolü sağlar.",
  },
  {
    id: 6,
    subject: "Biyoteknoloji",
    difficulty: "Orta",
    points: 40,
    question: "DNA dizilerinde hedeflenen bölgeleri yüksek hassasiyetle düzenlemeye olanak tanıyan gen düzenleme teknolojisi hangisidir?",
    options: [
      { key: "A", text: "ELISA" },
      { key: "B", text: "CRISPR-Cas9" },
      { key: "C", text: "MRG (Manyetik Rezonans)" },
      { key: "D", text: "Spektrofotometri" },
    ],
    correctKey: "B",
    explanation: "CRISPR-Cas9, genetik materyalin belirli bölgelerini kesip düzenleyebilen moleküler makas teknolojisidir.",
  },
  {
    id: 7,
    subject: "Uzay",
    difficulty: "Orta",
    points: 40,
    question: "Türkiye'nin yerli ve millî imkânlarla geliştirdiği ilk yüksek çözünürlüklü yer gözlem uydusu hangisidir?",
    options: [
      { key: "A", text: "İMECE" },
      { key: "B", text: "Voyager 1" },
      { key: "C", text: "Hubble" },
      { key: "D", text: "Galileo" },
    ],
    correctKey: "A",
    explanation: "TÜBİTAK UZAY liderliğinde geliştirilen İMECE, Türkiye'nin metre altı çözünürlüğe sahip ilk yerli gözlem uydusudur.",
  },
  {
    id: 8,
    subject: "Enerji",
    difficulty: "Zor",
    points: 50,
    question: "Elektrikli araç batarya yönetim sistemlerinde (BMS) bataryanın kalan kapasitesini ifade eden parametre hangisidir?",
    options: [
      { key: "A", text: "SoC (State of Charge)" },
      { key: "B", text: "RPM (Dakikadaki Devir)" },
      { key: "C", text: "SNR (Sinyal Gürültü Oranı)" },
      { key: "D", text: "TTL (Yaşam Süresi)" },
    ],
    correctKey: "A",
    explanation: "State of Charge (SoC), bataryanın doluluk oranını yüzde (%) cinsinden gösteren temel BMS parametresidir.",
  },
  {
    id: 9,
    subject: "Siber Güvenlik",
    difficulty: "Kolay",
    points: 30,
    question: "İki uç arasındaki verinin yalnızca gönderici ve alıcı tarafından okunabilmesini sağlayan şifreleme yöntemi nedir?",
    options: [
      { key: "A", text: "Uçtan Uca Şifreleme (E2EE)" },
      { key: "B", text: "Açık Metin Aktarımı (Plaintext)" },
      { key: "C", text: "Statik Yönlendirme" },
      { key: "D", text: "ARP Çözümleme" },
    ],
    correctKey: "A",
    explanation: "End-to-End Encryption (E2EE), verinin aradaki sunucular dahil üçüncü taraflarca okunmasını engeller.",
  },
  {
    id: 10,
    subject: "Yapay Zekâ",
    difficulty: "Zor",
    points: 50,
    question: "Görüntü işleme ve gerçek zamanlı nesne tespitinde (Object Detection) tek aşamalı mimarisiyle öne çıkan popüler algoritma hangisidir?",
    options: [
      { key: "A", text: "YOLO (You Only Look Once)" },
      { key: "B", text: "Dijkstra Algoritması" },
      { key: "C", text: "Bubble Sort" },
      { key: "D", text: "RSA Şifreleme" },
    ],
    correctKey: "A",
    explanation: "YOLO, görüntüyü tek bir sinir ağı geçişinde işleyerek gerçek zamanlı yüksek hızlı nesne tespiti yapar.",
  },
];

type QuizTabId = "hub" | "solo" | "sets" | "leaderboard" | "history" | "create" | "categories";

const MAIN_TABS: { id: "solo" | "hub" | "sets" | "leaderboard" | "history"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "hub", label: "Quiz Merkezi", icon: Gamepad2 },
  { id: "solo", label: "Haftanın Quiz'i", icon: Zap },
  { id: "sets", label: "Soru Setlerim", icon: Layers },
  { id: "leaderboard", label: "Liderlik Tablosu", icon: Trophy },
  { id: "history", label: "Quiz Geçmişim", icon: History },
];

export function GencQuiz() {
  useSEO({
    title: "Genç Quiz — Canlı Çok Oyunculu Bilgi Yarışması | Genç Sosyal",
    description:
      "Arkadaşlarınla canlı bilgi yarışması odaları kur, oda kodunu paylaş, genel kültür ve teknoloji sorularıyla yarış ve zirveye yerleş!",
    canonicalPath: "/quiz",
  });

  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const initialTabFromState = (location.state as { tab?: QuizTabId } | null)?.tab;
  const [activeTab, setActiveTab] = useState<QuizTabId>(initialTabFromState || "hub");

  useEffect(() => {
    const requestedTab = (location.state as { tab?: QuizTabId } | null)?.tab;
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [location.state]);

  // =========================================================================
  // SOLO WEEKLY QUIZ STATE (Preserved business logic, clean zero-fake start)
  // =========================================================================
  const [soloIndex, setSoloIndex] = useState(0);
  const [soloScore, setSoloScore] = useState(0);
  const [soloSelectedKey, setSoloSelectedKey] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [soloLocked, setSoloLocked] = useState(false);
  const [soloLastOutcome, setSoloLastOutcome] = useState<"correct" | "wrong" | "timeout" | null>(null);
  const [soloTimeLeft, setSoloTimeLeft] = useState(20);
  const [soloHistory, setSoloHistory] = useState<Array<"correct" | "wrong" | "skipped">>([]);
  const [soloEliminatedKeys, setSoloEliminatedKeys] = useState<string[]>([]);
  const [soloFiftyLeft, setSoloFiftyLeft] = useState(1);
  const [soloFinished, setSoloFinished] = useState(false);

  const currentSoloQ = WEEKLY_SOLO_QUESTIONS[soloIndex] || WEEKLY_SOLO_QUESTIONS[0];
  const soloCorrectCount = soloHistory.filter((r) => r === "correct").length;

  useEffect(() => {
    if (activeTab !== "solo" || soloFinished || soloLocked) return;
    const timer = setInterval(() => {
      setSoloTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSoloLocked(true);
          setSoloLastOutcome("timeout");
          setSoloHistory((h) => [...h, "wrong"]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, soloIndex, soloFinished, soloLocked]);

  const handleSoloUseFifty = () => {
    if (soloFiftyLeft <= 0 || soloLocked || soloEliminatedKeys.length > 0) return;
    const wrongKeys = currentSoloQ.options
      .map((o) => o.key)
      .filter((k) => k !== currentSoloQ.correctKey);
    const toEliminate = wrongKeys.slice(0, 2);
    setSoloEliminatedKeys(toEliminate);
    if (soloSelectedKey && toEliminate.includes(soloSelectedKey)) {
      setSoloSelectedKey(null);
    }
    setSoloFiftyLeft((prev) => prev - 1);
    toast.success("50:50 yardımı kullanıldı, 2 yanlış şık elendi.");
  };

  const advanceSoloQuestion = useCallback(() => {
    setSoloLocked(false);
    setSoloLastOutcome(null);
    setSoloEliminatedKeys([]);
    setSoloSelectedKey(null);
    setSoloTimeLeft(20);
    if (soloIndex + 1 >= WEEKLY_SOLO_QUESTIONS.length) {
      setSoloFinished(true);
    } else {
      setSoloIndex((prev) => prev + 1);
    }
  }, [soloIndex]);

  const handleSoloSkip = () => {
    if (soloLocked) return;
    setSoloHistory((prev) => [...prev, "skipped"]);
    advanceSoloQuestion();
  };

  const handleSoloConfirm = () => {
    if (!soloSelectedKey) {
      toast.error("Lütfen bir seçenek belirleyin.");
      return;
    }
    if (soloLocked) return;
    setSoloLocked(true);
    const isCorrect = soloSelectedKey === currentSoloQ.correctKey;
    if (isCorrect) {
      setSoloScore((prev) => prev + currentSoloQ.points);
      setSoloLastOutcome("correct");
    } else {
      setSoloLastOutcome("wrong");
    }
    setSoloHistory((prev) => [...prev, isCorrect ? "correct" : "wrong"]);
  };

  const handleSoloRestart = () => {
    setSoloIndex(0);
    setSoloScore(0);
    setSoloSelectedKey(null);
    setSoloLocked(false);
    setSoloLastOutcome(null);
    setSoloTimeLeft(20);
    setSoloHistory([]);
    setSoloEliminatedKeys([]);
    setSoloFiftyLeft(1);
    setSoloFinished(false);
  };

  // =========================================================================
  // HUB / ROOMS / STATS / SETS / LEADERBOARD / HISTORY STATE
  // =========================================================================
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const [quizStats, setQuizStats] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [mySets, setMySets] = useState<any[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [setsError, setSetsError] = useState<string | null>(null);
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
      ],
    },
  ]);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Fetch Public Rooms
  const fetchPublicRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const res = await fetch("/api/v1/quiz/rooms/public");
      const json = await res.json();
      if (!res.ok || !json.success) {
        setRoomsError(json.error?.message || "Açık odalar yüklenirken bir hata oluştu.");
        return;
      }
      setPublicRooms(json.rooms || []);
    } catch {
      setRoomsError("Sunucuya bağlanılamadı. Açık odalar alınamadı.");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    try {
      const res = await fetch("/api/v1/quiz/leaderboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        setLeaderboardError(json.error?.message || "Liderlik tablosu alınamadı.");
        return;
      }
      setLeaderboard(json.leaderboard || []);
    } catch {
      setLeaderboardError("Bağlantı hatası: Liderlik tablosu yüklenemedi.");
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  // Fetch User History & Stats
  const fetchHistoryAndStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingHistory(true);
    setHistoryError(null);
    setStatsError(null);
    try {
      const [histRes, statsRes] = await Promise.all([
        fetchApi("/quiz/history"),
        fetchApi("/quiz/stats"),
      ]);
      const [histJson, statsJson] = await Promise.all([histRes.json(), statsRes.json()]);
      if (histRes.ok && histJson.success) {
        setQuizHistory(histJson.history || []);
      } else {
        setHistoryError(histJson.error?.message || "Quiz geçmişi yüklenemedi.");
      }
      if (statsRes.ok && statsJson.success) {
        setQuizStats(statsJson.stats || null);
      } else {
        setStatsError(statsJson.error?.message || "Quiz istatistikleri yüklenemedi.");
      }
    } catch {
      setHistoryError("Bağlantı hatası: Quiz geçmişi alınamadı.");
      setStatsError("Bağlantı hatası: İstatistikler alınamadı.");
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated]);

  // Fetch User Question Sets
  const fetchMySets = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingSets(true);
    setSetsError(null);
    try {
      const res = await fetchApi("/quiz/sets");
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSetsError(json.error?.message || "Soru setleri yüklenemedi.");
        return;
      }
      setMySets(json.sets || []);
    } catch {
      setSetsError("Bağlantı hatası: Soru setleri alınamadı.");
    } finally {
      setLoadingSets(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPublicRooms();
  }, [fetchPublicRooms]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistoryAndStats();
    }
  }, [isAuthenticated, fetchHistoryAndStats]);

  useEffect(() => {
    if (activeTab === "leaderboard") fetchLeaderboard();
    if (activeTab === "history" || activeTab === "hub") fetchHistoryAndStats();
    if (activeTab === "sets" || activeTab === "create") fetchMySets();
  }, [activeTab, fetchLeaderboard, fetchHistoryAndStats, fetchMySets]);

  // Join Room by Code Handler
  const handleJoinByCode = async (codeToJoin?: string) => {
    const rawCode = (codeToJoin || joinCode).trim();
    if (!rawCode) {
      setJoinError("Lütfen 6 karakterli oda kodunu girin.");
      return;
    }
    if (!isAuthenticated) {
      openModal();
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetchApi(`/quiz/rooms/${rawCode}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setJoinError(json.error?.message || "Bu kodla aktif bir quiz odası bulunamadı.");
        setIsJoining(false);
        return;
      }

      navigate(`/quiz/room/${json.room.code}`);
    } catch {
      setJoinError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
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
      toast.error("Lütfen quiz odası için bir başlık belirleyin.");
      return;
    }

    setIsCreatingRoom(true);

    try {
      const res = await fetchApi("/quiz/rooms", {
        method: "POST",
        data: {
          title: roomTitle.trim(),
          category: roomCategory,
          difficulty: roomDifficulty,
          questionCount: roomQuestionCount,
          timePerQuestion: roomTimePerQuestion,
          roomType,
          sourceType: roomSourceType,
          questionSetId: roomSourceType === "QUESTION_SET" ? selectedSetId : null,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Oda oluşturulamadı.");
        setIsCreatingRoom(false);
        return;
      }

      toast.success("Quiz odası oluşturuldu! Lobiye yönlendiriliyorsunuz.");
      navigate(`/quiz/room/${json.code}`);
    } catch {
      toast.error("Sunucu hatası oluştu.");
      setIsCreatingRoom(false);
    }
  };

  // Save Custom Question Set Handler
  const handleSaveQuestionSet = async () => {
    if (!newSetTitle.trim()) {
      toast.error("Lütfen soru setinize bir başlık verin.");
      return;
    }

    for (let i = 0; i < newSetQuestions.length; i++) {
      const q = newSetQuestions[i];
      if (!q.question.trim()) {
        toast.error(`Soru #${i + 1} için soru metni girmelisiniz.`);
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
      const res = await fetchApi("/quiz/sets", {
        method: "POST",
        data: {
          title: newSetTitle.trim(),
          description: newSetDesc.trim(),
          category: newSetCategory,
          difficulty: newSetDifficulty,
          isPublic: newSetIsPublic,
          questions: newSetQuestions.map((q) => ({
            question: q.question.trim(),
            explanation: q.explanation.trim(),
            options: q.options.filter((o: any) => o.text.trim().length > 0),
          })),
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Soru seti kaydedilemedi.");
        setIsSavingSet(false);
        return;
      }

      toast.success("Soru setiniz başarıyla oluşturuldu!");
      setShowCreateSetModal(false);
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
          ],
        },
      ]);
      fetchMySets();
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setIsSavingSet(false);
    }
  };

  // Delete Question Set (using in-app ConfirmDialog)
  const handleDeleteSet = async (id: number) => {
    const confirmed = await confirmDialog({
      title: "Soru Setini Sil",
      message: "Bu soru setini kalıcı olarak silmek istediğinize emin misiniz?",
      confirmLabel: "Sil",
      cancelLabel: "Vazgeç",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await fetchApi(`/quiz/sets/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Soru seti silindi.");
        fetchMySets();
      } else {
        toast.error(json.error?.message || "Soru seti silinemedi.");
      }
    } catch {
      toast.error("İşlem başarısız oldu.");
    }
  };

  const activeMainTabId =
    activeTab === "create" || activeTab === "categories" ? "hub" : activeTab;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-7 pb-24">
      {/* =====================================================================
          1. QUIZ HUB HERO BANNER (Editorial Blue/Navy/Indigo Gradient)
          ===================================================================== */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0F2557] via-[#1D4ED8] to-[#4F46E5] p-5 sm:p-8 text-white shadow-[0_14px_34px_-12px_rgba(15,37,87,0.38)]"
      >
        {/* Subtle controlled ambient radial depth (no neon / no cyberpunk) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.08] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-indigo-300/[0.12] blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Identity & Quick Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0"
              >
                <Gamepad2 className="w-6 h-6 text-white" />
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-100/90">
                  {publicRooms.length > 0 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{publicRooms.length} canlı oda açık</span>
                    </>
                  ) : (
                    <span>Canlı Bilgi Yarışması Platformu</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                  Genç Quiz
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl">
              Bilgini konuştur, arkadaşlarınla yarış, zirveye adını yazdır!
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    openModal();
                    return;
                  }
                  setActiveTab("create");
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#0F2557] hover:bg-blue-50 active:scale-[0.98] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Yeni Canlı Oda Oluştur</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/12 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4" />
                <span>Hazır Setleri Keşfet</span>
              </button>
            </div>
          </div>

          {/* Right Quick Join with 6-Char Room Code */}
          <div className="lg:col-span-5">
            <div className="rounded-[20px] bg-white/[0.11] border border-white/20 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-tight text-white">
                  Oda Koduyla Hızlı Katıl
                </span>
                <span className="text-[11px] font-mono text-blue-100/80">
                  6 karakter
                </span>
              </div>

              <SixCharCodeInput
                value={joinCode}
                onChange={(val) => {
                  setJoinCode(val);
                  if (joinError) setJoinError(null);
                }}
                onSubmit={() => handleJoinByCode()}
                disabled={isJoining}
                darkSurface
              />

              {joinError && (
                <p role="alert" className="text-xs font-medium text-rose-200 leading-snug">
                  {joinError}
                </p>
              )}

              <Button
                variant="primary"
                fullWidth
                isLoading={isJoining}
                loadingText="Oda kontrol ediliyor..."
                onClick={() => handleJoinByCode()}
                className="rounded-2xl bg-white hover:bg-blue-50 active:bg-blue-100 text-[#0F2557] border-transparent font-bold text-sm shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Odaya Katıl
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =====================================================================
          2. REAL USER STATISTICS STRIP (Only rendered with real API data)
          ===================================================================== */}
      {isAuthenticated && statsError && (
        <QuizErrorBanner message={statsError} onRetry={fetchHistoryAndStats} />
      )}

      {isAuthenticated && quizStats && (
        <section aria-label="Genç Quiz İstatistiklerin" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Katıldığın Quiz",
              value: (quizStats.totalQuizes ?? 0).toLocaleString("tr-TR"),
              icon: Gamepad2,
              accent: "bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400",
            },
            {
              label: "Kazandığın Quiz",
              value: (quizStats.wins ?? 0).toLocaleString("tr-TR"),
              icon: Trophy,
              accent: "bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400",
            },
            {
              label: "Toplam Puanın",
              value: (quizStats.totalScore ?? 0).toLocaleString("tr-TR"),
              icon: Award,
              accent: "bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400",
            },
            {
              label: "Doğruluk Oranı",
              value: `%${quizStats.accuracyRate ?? 0}`,
              icon: Target,
              accent: "bg-indigo-50 dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.accent)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {stat.label}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight mt-0.5">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* =====================================================================
          3. MODERN SEGMENTED TAB NAVIGATION
          ===================================================================== */}
      <nav
        aria-label="Genç Quiz Bölümleri"
        className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {MAIN_TABS.map((tab) => {
            const isSelected = activeMainTabId === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 min-w-fit flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-[14px] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="gencQuizActiveTab"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-[14px] bg-[#2563EB] shadow-sm shadow-blue-600/20"
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================
          4. TAB CONTENT PANELS (Smooth Animated Transition)
          ===================================================================== */}
      <AnimatePresence mode="wait">
        {/* -------------------------------------------------------------------
            TAB A: QUIZ MERKEZİ (LIVE OPEN ROOMS + CATEGORIES PREVIEW)
            ------------------------------------------------------------------- */}
        {activeTab === "hub" && (
          <motion.div
            key="tab-hub"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Open Live Rooms Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Açık Canlı Odalar
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Katılıma açık lobilerden birini seçerek anında yarışmaya katıl.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchPublicRooms}
                    isLoading={loadingRooms}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="rounded-xl text-xs"
                  >
                    Yenile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!isAuthenticated) openModal();
                      else setActiveTab("create");
                    }}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="rounded-xl text-xs"
                  >
                    Oda Oluştur
                  </Button>
                </div>
              </div>

              {roomsError && (
                <QuizErrorBanner message={roomsError} onRetry={fetchPublicRooms} />
              )}

              {loadingRooms ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/70 dark:border-white/[0.06] p-5 space-y-4 animate-pulse"
                    >
                      <div className="flex justify-between">
                        <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-white/10" />
                      </div>
                      <div className="h-6 w-3/4 rounded-md bg-slate-200 dark:bg-white/10" />
                      <div className="h-4 w-1/2 rounded-md bg-slate-100 dark:bg-white/5" />
                      <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-white/5 mt-auto" />
                    </div>
                  ))}
                </div>
              ) : !roomsError && publicRooms.length === 0 ? (
                <QuizStatePanel
                  icon={<Gamepad2 className="w-6 h-6" />}
                  title="Şu anda herkese açık canlı oda bulunmuyor"
                  description="İlk canlı odayı kurup 6 karakterli kodu arkadaşlarınla paylaşarak yarışmayı başlatabilirsin."
                  action={
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (!isAuthenticated) openModal();
                        else setActiveTab("create");
                      }}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="rounded-2xl"
                    >
                      İlk Odayı Oluştur
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicRooms.map((r, idx) => {
                    const playerCount = Number(r.playerCount || 0);
                    const maxPlayers = Math.max(1, Number(r.maxPlayers || 30));
                    const fillPercent = Math.min(100, Math.round((playerCount / maxPlayers) * 100));
                    const isFull = playerCount >= maxPlayers;

                    return (
                      <motion.article
                        key={r.code}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        className="group rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-5 flex flex-col justify-between gap-4 hover:border-[#2563EB]/45 hover:shadow-[0_10px_28px_-10px_rgba(37,99,235,0.16)] transition-all duration-200"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Code & Live Status */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono font-bold text-[#2563EB] dark:text-blue-400 tracking-wider">
                              #{r.code}
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 font-semibold",
                                isFull
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-[#16A34A] dark:text-emerald-400"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isFull ? "bg-amber-500" : "bg-[#16A34A]"
                                )}
                              />
                              {isFull ? "Dolu" : "Lobide · Açık"}
                            </span>
                          </div>

                          {/* Title & Clean Unboxed Metadata */}
                          <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                              {r.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>{r.category || "Karışık"}</span>
                              <span aria-hidden="true">·</span>
                              <span>{r.difficulty || "Karışık"}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{r.questionCount} soru</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{r.timePerQuestion} sn</span>
                            </div>
                            {r.hostUsername && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                Kurucu: <span className="font-semibold text-slate-600 dark:text-slate-300">@{r.hostUsername}</span>
                              </p>
                            )}
                          </div>

                          {/* Capacity Progress */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                Katılımcı
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                {playerCount} / {maxPlayers}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.07] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          fullWidth
                          disabled={isFull}
                          onClick={() => handleJoinByCode(r.code)}
                          rightIcon={!isFull ? <ArrowRight className="w-4 h-4" /> : undefined}
                          className="rounded-xl text-xs font-bold"
                        >
                          {isFull ? "Oda Dolu" : "Odaya Katıl"}
                        </Button>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Quick Categories Section */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Popüler Kategoriler
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Bir konu seçip tek tıkla özel quiz odası oluştur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
                >
                  <span>Tümünü Gör</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
                {CATEGORIES.slice(0, 7).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        openModal();
                        return;
                      }
                      setRoomCategory(cat);
                      setRoomTitle(`${cat} Bilgi Yarışması`);
                      setActiveTab("create");
                    }}
                    className="group rounded-[18px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-3.5 text-left hover:border-[#2563EB]/50 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                      {cat}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 inline-flex items-center gap-1">
                      Oda kur
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            TAB B: HAFTANIN QUIZ'İ (WEEKLY SOLO QUIZ - MODERNIZED ARENA UI)
            ------------------------------------------------------------------- */}
        {activeTab === "solo" && (
          <motion.div
            key="tab-solo"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {!soloFinished ? (
              <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-4 sm:p-7 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.08)] space-y-6">
                {/* Arena Top Bar */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.07]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        Haftanın Quiz'i
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        Bilim & Teknoloji
                      </h2>
                    </div>
                  </div>

                  {/* Live Score Counter */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#F59E0B]" />
                      <AnimatedScore
                        value={soloScore}
                        className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white"
                      />
                      <span className="text-[11px] font-medium text-slate-400">puan</span>
                    </div>
                  </div>
                </div>

                {/* Progress & Circular Timer Row */}
                <div className="flex items-center justify-between gap-4">
                  <SegmentedProgress
                    total={WEEKLY_SOLO_QUESTIONS.length}
                    currentIndex={soloIndex}
                    statuses={soloHistory}
                    rightLabel={
                      <span className="font-semibold text-[#16A34A] dark:text-emerald-400 inline-flex items-center gap-1 tabular-nums">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        {soloCorrectCount} doğru
                      </span>
                    }
                  />

                  <CircularTimer timeLeft={soloTimeLeft} totalTime={20} size={58} />
                </div>

                {/* Question Card with Smooth Question Transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSoloQ.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, x: -14 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-5"
                  >
                    <div className="rounded-[20px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 space-y-3.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                          <span className="text-[#2563EB] dark:text-blue-400 font-bold">
                            {currentSoloQ.subject}
                          </span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                            ·
                          </span>
                          <span>{currentSoloQ.difficulty}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                          +{currentSoloQ.points} puan
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-[21px] font-bold text-slate-900 dark:text-white leading-snug [text-wrap:balance]">
                        {currentSoloQ.question}
                      </h3>
                    </div>

                    {/* A / B / C / D Option Cards */}
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                      {currentSoloQ.options.map((opt) => {
                        const isEliminated = soloEliminatedKeys.includes(opt.key);
                        const isSelected = soloSelectedKey === opt.key;
                        let optionState: OptionVisualState = "normal";

                        if (isEliminated) {
                          optionState = "eliminated";
                        } else if (soloLocked) {
                          if (opt.key === currentSoloQ.correctKey) {
                            optionState = "correct";
                          } else if (isSelected && opt.key !== currentSoloQ.correctKey) {
                            optionState = "wrong";
                          } else {
                            optionState = "locked";
                          }
                        } else if (isSelected) {
                          optionState = "selected";
                        }

                        return (
                          <QuizOptionCard
                            key={opt.key}
                            optionKey={opt.key}
                            text={opt.text}
                            state={optionState}
                            disabled={isEliminated || soloLocked}
                            onClick={() => setSoloSelectedKey(opt.key)}
                          />
                        );
                      })}
                    </div>

                    {/* Answer Feedback Banner (Shown after confirming or timeout) */}
                    <AnimatePresence>
                      {soloLocked && soloLastOutcome && (
                        <motion.div
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className={cn(
                            "rounded-[18px] border p-4 space-y-2",
                            soloLastOutcome === "correct"
                              ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30"
                              : "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {soloLastOutcome === "correct" ? (
                                <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-[#EF4444] dark:text-rose-400 shrink-0" />
                              )}
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  soloLastOutcome === "correct"
                                    ? "text-emerald-800 dark:text-emerald-200"
                                    : "text-rose-800 dark:text-rose-200"
                                )}
                              >
                                {soloLastOutcome === "correct"
                                  ? `Doğru cevap! +${currentSoloQ.points} puan kazandın`
                                  : soloLastOutcome === "timeout"
                                  ? `Süre doldu. Doğru şık: ${currentSoloQ.correctKey}`
                                  : `Yanlış cevap. Doğru şık: ${currentSoloQ.correctKey}`}
                              </span>
                            </div>
                          </div>
                          {currentSoloQ.explanation && (
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-7">
                              {currentSoloQ.explanation}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Helper Tools (50:50 & Pas Geç) + Primary CTA */}
                    <div className="space-y-3 pt-1">
                      {!soloLocked && (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            disabled={soloFiftyLeft <= 0 || soloEliminatedKeys.length > 0 || soloLocked}
                            onClick={handleSoloUseFifty}
                            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-[#2563EB]/40 hover:text-[#2563EB] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <Scissors className="w-4 h-4 text-[#2563EB]" />
                            <span>50:50</span>
                            <span className="text-slate-400 tabular-nums">({soloFiftyLeft})</span>
                          </button>

                          <button
                            type="button"
                            disabled={soloLocked}
                            onClick={handleSoloSkip}
                            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <SkipForward className="w-4 h-4 text-slate-500" />
                            <span>Pas Geç</span>
                          </button>
                        </div>
                      )}

                      {!soloLocked ? (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          disabled={!soloSelectedKey}
                          onClick={handleSoloConfirm}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          className="rounded-2xl font-bold shadow-md shadow-blue-600/20"
                        >
                          Cevabı Onayla
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={advanceSoloQuestion}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          className="rounded-2xl font-bold shadow-md shadow-blue-600/20"
                        >
                          {soloIndex + 1 >= WEEKLY_SOLO_QUESTIONS.length
                            ? "Sonuçları Gör"
                            : "Sonraki Soruya Geç"}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              /* Weekly Quiz Finished Summary */
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-6 sm:p-9 text-center space-y-6 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.1)]"
              >
                <motion.div
                  animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/25 flex items-center justify-center mx-auto"
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#2563EB] dark:text-blue-400">
                    Haftanın Quiz'i Tamamlandı
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Yarışma Tamamlandı!
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Bilim & Teknoloji haftalık serisini tamamladın.
                  </p>
                </div>

                {/* Result Metrics */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Toplam Puan
                    </p>
                    <p className="text-xl font-extrabold text-[#2563EB] dark:text-blue-400 tabular-nums mt-0.5">
                      {soloScore}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Doğru Sayısı
                    </p>
                    <p className="text-xl font-extrabold text-[#16A34A] dark:text-emerald-400 tabular-nums mt-0.5">
                      {soloCorrectCount}/{WEEKLY_SOLO_QUESTIONS.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/70 dark:border-white/[0.07] p-3.5">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Başarı
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      %{Math.round((soloCorrectCount / WEEKLY_SOLO_QUESTIONS.length) * 100)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSoloRestart}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="rounded-2xl font-bold"
                  >
                    Tekrar Oyna
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setActiveTab("hub")}
                    className="rounded-2xl font-bold"
                  >
                    Quiz Merkezine Dön
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            SUB-VIEW: CREATE LIVE ROOM
            ------------------------------------------------------------------- */}
        {activeTab === "create" && (
          <motion.div
            key="tab-create"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setActiveTab("hub")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quiz Merkezine Dön</span>
            </button>

            <div className="rounded-[24px] bg-white dark:bg-[#111B2E] border border-slate-200/85 dark:border-white/[0.08] p-5 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Yeni Canlı Quiz Odası Oluştur
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Odanı yapılandır, 6 karakterli davet kodunu al ve arkadaşlarınla eş zamanlı yarış.
                </p>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-5">
                {/* Room Title */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="quiz-room-title"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Oda Başlığı *
                  </label>
                  <input
                    id="quiz-room-title"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Örn: Bilim & Teknoloji Bilgi Yarışması"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                  />
                </div>

                {/* Question Source */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Soru Kaynağı
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "SYSTEM" as const,
                        title: "Sistem Soru Havuzu",
                        desc: "Kategoriye göre otomatik seçilir",
                        icon: Globe,
                      },
                      {
                        id: "QUESTION_SET" as const,
                        title: "Benim Soru Setim",
                        desc: "Kendi oluşturduğun soru setiyle oyna",
                        icon: Layers,
                      },
                    ].map((src) => {
                      const active = roomSourceType === src.id;
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => setRoomSourceType(src.id)}
                          className={cn(
                            "p-4 rounded-2xl border-[1.5px] text-left cursor-pointer transition-all flex items-start gap-3",
                            active
                              ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/35"
                              : "border-slate-200 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B1120] hover:border-slate-300"
                          )}
                        >
                          <src.icon
                            className={cn(
                              "w-5 h-5 mt-0.5 shrink-0",
                              active ? "text-[#2563EB] dark:text-blue-400" : "text-slate-400"
                            )}
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">
                              {src.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                              {src.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Set Selector */}
                {roomSourceType === "QUESTION_SET" && (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
                    <label
                      htmlFor="quiz-room-set"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                    >
                      Kullanılacak Soru Seti
                    </label>
                    {mySets.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Henüz soru setin yok.{" "}
                        <button
                          type="button"
                          onClick={() => setShowCreateSetModal(true)}
                          className="text-[#2563EB] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Yeni set oluştur
                        </button>
                      </p>
                    ) : (
                      <select
                        id="quiz-room-set"
                        value={selectedSetId || ""}
                        onChange={(e) => setSelectedSetId(Number(e.target.value) || null)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-white/[0.1] text-sm font-medium text-slate-900 dark:text-white"
                      >
                        <option value="">Set seçin...</option>
                        {mySets.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.questionCount} soru · {s.category})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="quiz-room-category"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Kategori
                    </label>
                    <select
                      id="quiz-room-category"
                      value={roomCategory}
                      onChange={(e) => setRoomCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm font-medium"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="quiz-room-difficulty"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Zorluk Seviyesi
                    </label>
                    <select
                      id="quiz-room-difficulty"
                      value={roomDifficulty}
                      onChange={(e) => setRoomDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm font-medium"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Count & Time Per Question */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Soru Sayısı
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {QUESTION_COUNTS.map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setRoomQuestionCount(cnt)}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold tabular-nums cursor-pointer transition-all",
                            roomQuestionCount === cnt
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Soru Başına Süre
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TIME_LIMITS.map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setRoomTimePerQuestion(sec)}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold tabular-nums cursor-pointer transition-all",
                            roomTimePerQuestion === sec
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          {sec}sn
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Room Visibility */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Oda Erişimi
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "PUBLIC", label: "Herkese Açık", desc: "Listede görünür", icon: Globe },
                      { id: "CODE_ONLY", label: "Sadece Kodla", desc: "Kod giren katılır", icon: Lock },
                      { id: "PRIVATE", label: "Özel Oda", desc: "Davetliler için", icon: ShieldCheck },
                    ].map((type) => {
                      const active = roomType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setRoomType(type.id as any)}
                          className={cn(
                            "p-3 rounded-2xl border-[1.5px] text-center cursor-pointer transition-all",
                            active
                              ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/35 text-[#2563EB] dark:text-blue-400"
                              : "border-slate-200 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <type.icon className="w-4 h-4 mx-auto mb-1.5" />
                          <span className="text-xs font-bold block">{type.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{type.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isCreatingRoom}
                  loadingText="Oda hazırlanıyor..."
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="rounded-2xl font-bold shadow-md shadow-blue-600/20"
                >
                  Odayı Oluştur ve Lobiye Geç
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            SUB-VIEW: ALL CATEGORIES EXPLORER
            ------------------------------------------------------------------- */}
        {activeTab === "categories" && (
          <motion.div
            key="tab-categories"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab("hub")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quiz Merkezine Dön</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Hazır Soru Kategorileri
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  İlgi alanına göre bir kategori seç ve hemen canlı yarışma başlat.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {CATEGORIES.map((cat, idx) => (
                <motion.div
                  key={cat}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.025, 0.25) }}
                  className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-5 flex flex-col justify-between gap-4 hover:border-[#2563EB]/45 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-extrabold text-sm">
                      {cat.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {cat} alanından özenle seçilmiş sorularla bilgini test et.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      if (!isAuthenticated) {
                        openModal();
                        return;
                      }
                      setRoomCategory(cat);
                      setRoomTitle(`${cat} Bilgi Yarışması`);
                      setActiveTab("create");
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="rounded-xl text-xs font-bold"
                  >
                    Oda Kur
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            TAB C: SORU SETLERİM
            ------------------------------------------------------------------- */}
        {activeTab === "sets" && (
          <motion.div
            key="tab-sets"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Soru Setlerim
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Kendi soru setlerini oluşturup canlı quiz odalarında kullanabilirsin.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else setShowCreateSetModal(true);
                }}
                className="rounded-xl text-xs font-bold"
              >
                Yeni Soru Seti
              </Button>
            </div>

            {setsError && <QuizErrorBanner message={setsError} onRetry={fetchMySets} />}

            {!isAuthenticated ? (
              <QuizStatePanel
                icon={<Layers className="w-6 h-6" />}
                title="Soru setlerini görmek için giriş yap"
                description="Kendi özel soru setlerini hazırlamak ve kaydetmek için Genç Sosyal hesabına giriş yapmalısın."
                action={
                  <Button variant="primary" onClick={openModal} className="rounded-2xl">
                    Giriş Yap
                  </Button>
                }
              />
            ) : loadingSets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/70 dark:border-white/[0.06] animate-pulse"
                  />
                ))}
              </div>
            ) : !setsError && mySets.length === 0 ? (
              <QuizStatePanel
                icon={<BookOpen className="w-6 h-6" />}
                title="Henüz soru setin yok"
                description="Dilediğin kategoride kendi sorularını ve seçeneklerini ekleyip arkadaşlarınla özel yarışmalar düzenleyebilirsin."
                action={
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateSetModal(true)}
                    className="rounded-2xl"
                  >
                    İlk Soru Setini Oluştur
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySets.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.04 }}
                    className="rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-5 flex flex-col justify-between gap-4 hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-[#2563EB] dark:text-blue-400">
                          {s.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {s.isPublic ? (
                            <>
                              <Globe className="w-3.5 h-3.5" />
                              Paylaşılabilir
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              Özel
                            </>
                          )}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {s.title}
                        </h3>
                        {s.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {s.questionCount} soru · {s.difficulty}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteSet(s.id)}
                          aria-label={`${s.title} setini sil`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-xl text-xs font-bold"
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
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            TAB D: LİDERLİK TABLOSU
            ------------------------------------------------------------------- */}
        {activeTab === "leaderboard" && (
          <motion.div
            key="tab-leaderboard"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Genç Quiz Liderlik Tablosu
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Canlı yarışmalarda en yüksek toplam puana ulaşan oyuncular.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchLeaderboard}
                isLoading={loadingLeaderboard}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="rounded-xl text-xs"
              >
                Yenile
              </Button>
            </div>

            {leaderboardError && (
              <QuizErrorBanner message={leaderboardError} onRetry={fetchLeaderboard} />
            )}

            {loadingLeaderboard ? (
              <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
                ))}
              </div>
            ) : !leaderboardError && leaderboard.length === 0 ? (
              <QuizStatePanel
                icon={<Trophy className="w-6 h-6" />}
                title="Henüz sıralama oluşmadı"
                description="Tamamlanan canlı quiz odaları burada toplam puan sıralamasıyla listelenir."
              />
            ) : (
              <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
                {leaderboard.map((item, idx) => {
                  const isCurrentUser = user && user.username === item.username;
                  const rank = item.rank || idx + 1;

                  return (
                    <motion.div
                      key={item.userId}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.025, 0.25) }}
                      className={cn(
                        "px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4 transition-colors",
                        isCurrentUser
                          ? "bg-blue-50/70 dark:bg-blue-950/30"
                          : "hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold shrink-0 tabular-nums",
                            rank === 1
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : rank === 2
                              ? "bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                              : rank === 3
                              ? "bg-orange-100/80 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300"
                              : "text-slate-400 dark:text-slate-500"
                          )}
                        >
                          {rank}
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
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors truncate block"
                          >
                            @{item.username}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-[11px] font-semibold text-[#2563EB] dark:text-blue-400">
                                (Sen)
                              </span>
                            )}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {item.totalQuizes} quiz · {item.wins} birincilik
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                          {(item.totalScore ?? 0).toLocaleString("tr-TR")}
                        </span>
                        <span className="text-[11px] text-slate-400 block">puan</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* -------------------------------------------------------------------
            TAB E: QUIZ GEÇMİŞİM
            ------------------------------------------------------------------- */}
        {activeTab === "history" && (
          <motion.div
            key="tab-history"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Quiz Geçmişim
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Katıldığın canlı yarışmalar, derecelerin ve doğruluk özetlerin.
              </p>
            </div>

            {historyError && (
              <QuizErrorBanner message={historyError} onRetry={fetchHistoryAndStats} />
            )}

            {!isAuthenticated ? (
              <QuizStatePanel
                icon={<History className="w-6 h-6" />}
                title="Geçmişini görüntülemek için giriş yap"
                description="Tamamladığın yarışmalar ve puan geçmişin hesabınla senkronize olarak saklanır."
                action={
                  <Button variant="primary" onClick={openModal} className="rounded-2xl">
                    Giriş Yap
                  </Button>
                }
              />
            ) : loadingHistory ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-[20px] bg-white dark:bg-[#111B2E] border border-slate-200/70 dark:border-white/[0.06]"
                  />
                ))}
              </div>
            ) : !historyError && quizHistory.length === 0 ? (
              <QuizStatePanel
                icon={<Clock className="w-6 h-6" />}
                title="Henüz tamamlanan yarışma geçmişin yok"
                description="Canlı bir odaya katılıp yarışmayı tamamladığında tüm derecelerin burada görünecek."
                action={
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab("hub")}
                    className="rounded-2xl"
                  >
                    Quiz Merkezine Göz At
                  </Button>
                }
              />
            ) : (
              <div className="rounded-[22px] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
                {quizHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {item.roomTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(item.playedAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {item.correctCount} doğru / {item.wrongCount} yanlış ({item.totalQuestions} soru)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06]">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-400 block">Sıralama</span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {item.rank}. / {item.totalPlayers}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Puan</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#2563EB] dark:text-blue-400 font-mono tabular-nums">
                          {Number(item.score || 0).toLocaleString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          5. MODAL: CREATE CUSTOM QUESTION SET
          ===================================================================== */}
      <AnimatePresence>
        {showCreateSetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#111B2E] rounded-[24px] max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200/80 dark:border-white/[0.1] my-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Yeni Soru Seti Oluştur
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Sorularını hazırla, kaydet ve istediğin zaman canlı odalarda kullan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateSetModal(false)}
                  aria-label="Kapat"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meta Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Set Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Türk Bilim Tarihi Seti"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Açıklama
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Soru seti hakkında kısa bilgi..."
                    value={newSetDesc}
                    onChange={(e) => setNewSetDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={newSetCategory}
                      onChange={(e) => setNewSetCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-xs font-medium text-slate-900 dark:text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Zorluk
                    </label>
                    <select
                      value={newSetDifficulty}
                      onChange={(e) => setNewSetDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-xs font-medium text-slate-900 dark:text-white"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Görünürlük
                    </label>
                    <select
                      value={newSetIsPublic ? "public" : "private"}
                      onChange={(e) => setNewSetIsPublic(e.target.value === "public")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#0B1120] text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="private">Özel (Sadece ben)</option>
                      <option value="public">Paylaşılabilir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sorular ({newSetQuestions.length})
                  </h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
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
                          ],
                        },
                      ]);
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    Soru Ekle
                  </Button>
                </div>

                <div className="space-y-4">
                  {newSetQuestions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400">
                          Soru #{qIndex + 1}
                        </span>
                        {newSetQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewSetQuestions(newSetQuestions.filter((_, idx) => idx !== qIndex))
                            }
                            className="text-xs text-[#EF4444] font-semibold hover:underline cursor-pointer"
                          >
                            Soruyu Kaldır
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Soru metnini yazın..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...newSetQuestions];
                          updated[qIndex].question = e.target.value;
                          setNewSetQuestions(updated);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111B2E] text-sm text-slate-900 dark:text-white"
                      />

                      <div className="space-y-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Seçenekler (Doğru yanıtı işaretleyin):
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
                                className="w-4 h-4 accent-[#16A34A] cursor-pointer"
                              />
                              <span className="text-xs font-bold w-4 text-slate-500">
                                {opt.key}
                              </span>
                              <input
                                type="text"
                                placeholder={`Seçenek ${opt.key}`}
                                value={opt.text}
                                onChange={(e) => {
                                  const updated = [...newSetQuestions];
                                  updated[qIndex].options[optIndex].text = e.target.value;
                                  setNewSetQuestions(updated);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111B2E] text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="İsteğe bağlı açıklama (cevap sonrası gösterilir)..."
                        value={q.explanation}
                        onChange={(e) => {
                          const updated = [...newSetQuestions];
                          updated[qIndex].explanation = e.target.value;
                          setNewSetQuestions(updated);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111B2E] text-xs text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.07]">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateSetModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveQuestionSet}
                  isLoading={isSavingSet}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="rounded-xl text-xs font-bold"
                >
                  Soru Setini Kaydet
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
