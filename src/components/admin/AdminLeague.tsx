import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  ShieldAlert, 
  Award,
  HelpCircle,
  Sliders,
  PlayCircle
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { showToast } from "../ui/Toast";

interface QuestionOption {
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  ageGroup: string;
  explanation: string | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  sourceType: string;
  usageCount: number;
  options: QuestionOption[];
}

export function AdminLeague() {
  const [activeTab, setActiveTab] = useState<"questions" | "season" | "ai">("questions");

  // Question bank state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add Question Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newCategory, setNewCategory] = useState("Tarih ve Kültür");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "EXPERT">("MEDIUM");
  const [newAgeGroup, setNewAgeGroup] = useState("ALL");
  const [newExplanation, setNewExplanation] = useState("");
  const [newOptions, setNewOptions] = useState([
    { key: "A", text: "", isCorrect: false },
    { key: "B", text: "", isCorrect: true },
    { key: "C", text: "", isCorrect: false },
    { key: "D", text: "", isCorrect: false },
  ]);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // AI Generator state
  const [aiCategory, setAiCategory] = useState("Tarih ve Kültür");
  const [aiDifficulty, setAiDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "EXPERT">("MEDIUM");
  const [aiAgeGroup, setAiAgeGroup] = useState("ALL");
  const [aiCount, setAiCount] = useState(5);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Season state
  const [season, setSeason] = useState<any>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [isUpdatingSeason, setIsUpdatingSeason] = useState(false);

  // Load questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (difficultyFilter !== "ALL") params.append("difficulty", difficultyFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await fetch(`/api/v1/league/admin/questions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Load season settings
  const fetchSeason = async () => {
    setLoadingSeason(true);
    try {
      const res = await fetch("/api/v1/league/current");
      const json = await res.json();
      if (json.success) {
        setSeason(json.season);
      }
    } catch (err) {
      console.error("Error loading season:", err);
    } finally {
      setLoadingSeason(false);
    }
  };

  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions();
    } else if (activeTab === "season") {
      fetchSeason();
    }
  }, [activeTab, page, categoryFilter, difficultyFilter, statusFilter]);

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim()) {
      showToast({ title: "Lütfen soru metnini girin.", type: "error" });
      return;
    }

    if (newOptions.some((o) => !o.text.trim())) {
      showToast({ title: "Tüm 4 seçeneğin metni doldurulmalıdır.", type: "error" });
      return;
    }

    const correctCount = newOptions.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      showToast({ title: "Tam olarak bir doğru seçenek belirleyin.", type: "error" });
      return;
    }

    setIsSavingQuestion(true);
    try {
      const res = await fetch("/api/v1/league/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestionText,
          category: newCategory,
          difficulty: newDifficulty,
          ageGroup: newAgeGroup,
          explanation: newExplanation,
          options: newOptions,
          status: "ACTIVE",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "Soru başarıyla eklendi!", type: "success" });
        setShowAddModal(false);
        // Reset form
        setNewQuestionText("");
        setNewExplanation("");
        fetchQuestions();
      } else {
        showToast({ title: json.error?.message || "Hata oluştu.", type: "error" });
      }
    } catch (err) {
      showToast({ title: "Ağ hatası.", type: "error" });
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleApproveQuestion = async (qId: number) => {
    try {
      const res = await fetch(`/api/v1/league/admin/questions/${qId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "Soru onaylandı ve havuza eklendi!", type: "success" });
        fetchQuestions();
      }
    } catch (err) {
      showToast({ title: "İşlem başarısız.", type: "error" });
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/v1/league/admin/questions/${qId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "Soru silindi.", type: "success" });
        fetchQuestions();
      }
    } catch (err) {
      showToast({ title: "Silinemedi.", type: "error" });
    }
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/v1/league/admin/questions/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: aiCategory,
          difficulty: aiDifficulty,
          ageGroup: aiAgeGroup,
          count: aiCount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({
          title: `✓ ${json.createdCount} soru Gemini tarafından üretildi ve Taslak olarak eklendi!`,
          type: "success",
        });
        setActiveTab("questions");
        setStatusFilter("DRAFT");
        fetchQuestions();
      } else {
        showToast({ title: json.error?.message || "AI soru üretimi başarısız.", type: "error" });
      }
    } catch (err) {
      showToast({ title: "Ağ hatası.", type: "error" });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUpdateSeason = async (updates: any) => {
    setIsUpdatingSeason(true);
    try {
      const res = await fetch("/api/v1/league/admin/season/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: season?.id,
          ...updates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "Sezon ayarları kaydedildi.", type: "success" });
        fetchSeason();
      }
    } catch (err) {
      showToast({ title: "Ayarlar güncellenemedi.", type: "error" });
    } finally {
      setIsUpdatingSeason(false);
    }
  };

  const handleFinalizeSeason = async () => {
    if (!window.confirm("Bu sezonu sonlandırıp şampiyonu taçlandırmak ve rozetleri dağıtmak istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/v1/league/admin/season/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId: season?.id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "Sezon tamamlandı ve ödüller dağıtıldı!", type: "success" });
        fetchSeason();
      }
    } catch (err) {
      showToast({ title: "İşlem başarısız.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            19 Mayıs Gençlik Ligi Yönetimi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Otomatik sezon akışı, Soru Havuzu ve Gemini AI soru üretim paneli.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "questions"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Soru Havuzu
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
              activeTab === "ai"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            AI Soru Üretici
          </button>
          <button
            onClick={() => setActiveTab("season")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "season"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Sezon & Simülasyon
          </button>
        </div>
      </div>

      {/* TAB 1: QUESTION BANK */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Action and Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="ALL">Tüm Kategoriler</option>
                <option value="Tarih ve Kültür">Tarih ve Kültür</option>
                <option value="Bilim">Bilim</option>
                <option value="Teknoloji">Teknoloji</option>
                <option value="Genel Kültür">Genel Kültür</option>
                <option value="Mantık">Mantık</option>
                <option value="Spor">Spor</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="ACTIVE">Aktif Havuz</option>
                <option value="DRAFT">Taslak (İncelenecekler)</option>
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
                  placeholder="Soru metni ara..."
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Yeni Soru Ekle
            </Button>
          </div>

          {/* Questions List */}
          <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loadingQuestions ? (
              <div className="p-8 text-center text-xs text-slate-500">Sorular yükleniyor...</div>
            ) : questions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {q.category}
                          </Badge>
                          <Badge
                            variant={q.difficulty === "HARD" ? "danger" : q.difficulty === "EASY" ? "success" : "primary"}
                            className="text-[10px]"
                          >
                            {q.difficulty}
                          </Badge>
                          <Badge
                            variant={q.status === "ACTIVE" ? "success" : "warning"}
                            className="text-[10px]"
                          >
                            {q.status === "ACTIVE" ? "AKTİF" : "TASLAK (DRAFT)"}
                          </Badge>
                          {q.sourceType === "AI" && (
                            <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Üretimi
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {q.status === "DRAFT" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveQuestion(q.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Onayla
                          </Button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {q.options?.map((opt) => (
                        <div
                          key={opt.optionKey}
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-bold"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className="font-mono font-bold w-4">{opt.optionKey})</span>
                          <span className="truncate">{opt.optionText}</span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>Açıklama:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Seçili filtrelere uygun soru bulunamadı.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: AI QUESTION GENERATOR */}
      {activeTab === "ai" && (
        <Card className="p-6 rounded-3xl space-y-6 max-w-2xl mx-auto border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Gemini 3.8 Flash ile Soru Havuzunu Büyüt
              </h3>
              <p className="text-xs text-slate-500">
                AI tarafından üretilen sorular otomatik olarak "DRAFT" olarak kaydedilir. Yönetici onayından geçmeden canlı maça sokulmaz.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block mb-1.5 text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5"
              >
                <option value="Tarih ve Kültür">🇹🇷 Tarih ve Kültür</option>
                <option value="Bilim">🔬 Bilim</option>
                <option value="Teknoloji">💻 Teknoloji</option>
                <option value="Genel Kültür">🌍 Genel Kültür</option>
                <option value="Mantık">🧠 Mantık</option>
                <option value="Spor">🏆 Spor</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-slate-700 dark:text-slate-300">Zorluk Seviyesi</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5"
                >
                  <option value="EASY">Kolay</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HARD">Zor</option>
                  <option value="EXPERT">Uzman</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-700 dark:text-slate-300">Üretilecek Soru Sayısı</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
              <div className="font-bold">Doğrulama Zinciri (Validation Pipeline):</div>
              <div>1. Kesinlikle tek doğru seçenek (isCorrect: true) kuralı denetlenir.</div>
              <div>2. Havuzdaki mevcut sorularla benzerlik kontrolü yapılır (duplicate check).</div>
              <div>3. Her soru için eğitici açıklama metni zorunludur.</div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2"
              isLoading={isGeneratingAi}
              onClick={handleGenerateAi}
            >
              <Sparkles className="w-4 h-4" />
              Soruları Üret ve Taslak Olarak Kaydet
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: SEASON CONTROLS & SIMULATION */}
      {activeTab === "season" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  Sezon Durumu ve Hızlı Test Simülasyonu
                </h3>
                <p className="text-xs text-slate-500">
                  Normalde sistem tarihleri Europe/Istanbul saatine göre otomatik yönetir. Test için durumu değiştirebilirsiniz.
                </p>
              </div>
              <Badge variant={season?.status === "IN_PROGRESS" ? "danger" : "primary"} className="text-xs">
                {season?.status}
              </Badge>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <div>
                  <div className="font-black text-slate-900 dark:text-white">Simülasyon Modu</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Tarihe bakılmaksızın tüm kullanıcılara hemen maç yapma ve kayıt olma izni verir.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(season?.settings?.simulationMode)}
                  onChange={(e) => handleUpdateSeason({ simulationMode: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-700 dark:text-slate-300">Manuel Durum Değiştir</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["UPCOMING", "REGISTRATION_OPEN", "IN_PROGRESS", "COMPLETED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateSeason({ status: st })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs ${
                        season?.status === st
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Sezonu Kesinleştir</div>
                  <div className="text-[11px] text-slate-500">Lideri şampiyon ilan eder ve madalya rozetlerini dağıtır.</div>
                </div>
                <Button
                  onClick={handleFinalizeSeason}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  Sezonu Tamamla & Rozet Dağıt
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Manuel Soru Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block mb-1">Soru Metni</label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Soru metnini yazınız..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Tarih ve Kültür">Tarih ve Kültür</option>
                    <option value="Bilim">Bilim</option>
                    <option value="Teknoloji">Teknoloji</option>
                    <option value="Genel Kültür">Genel Kültür</option>
                    <option value="Mantık">Mantık</option>
                    <option value="Spor">Spor</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Zorluk</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="EASY">Kolay</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HARD">Zor</option>
                    <option value="EXPERT">Uzman</option>
                  </select>
                </div>
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block">Seçenekler (Doğru seçeneği radyo butonuyla işaretleyin)</label>
                {newOptions.map((opt, idx) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        setNewOptions(newOptions.map((o, i) => ({ ...o, isCorrect: i === idx })));
                      }}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="font-bold w-4">{opt.key})</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[idx].text = e.target.value;
                        setNewOptions(updated);
                      }}
                      placeholder={`Seçenek ${opt.key}`}
                      className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block mb-1">Eğitici Açıklama</label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Neden bu seçenek doğru? Açıklayınız..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>İptal</Button>
                <Button className="bg-blue-600 text-white font-bold" isLoading={isSavingQuestion} onClick={handleCreateQuestion}>
                  Havuza Ekle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
