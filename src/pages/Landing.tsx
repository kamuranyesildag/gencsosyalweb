import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  Code2,
  Users,
  MessageSquare,
  Sparkles,
  Rocket,
  ShieldCheck,
  Zap,
  FolderGit2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Layers,
  Cpu,
  Compass,
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
  Share2,
  Heart,
  BadgeCheck,
  Trophy,
  Flame,
  Radio,
  Eye,
  Bookmark
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useThemeStore } from '../context/useTheme';

export function Landing() {
  useSEO({ 
    title: "Genç Sosyal — Genç Üretici ve Yazılımcı Platformu", 
    description: "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini sergilediği, topluluk kurduğu ve birlikte ürettiği bağımsız sosyal ağ.",
    canonicalPath: "/"
  });

  const { actualTheme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'projects' | 'teknofest' | 'communities'>('feed');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [likedPreview, setLikedPreview] = useState(false);
  const [likeCountPreview, setLikeCountPreview] = useState(48);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleLikePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (likedPreview) {
      setLikedPreview(false);
      setLikeCountPreview(prev => prev - 1);
    } else {
      setLikedPreview(true);
      setLikeCountPreview(prev => prev + 1);
    }
  };

  const faqs = [
    {
      q: "Genç Sosyal kimler içindir?",
      a: "Genç Sosyal; lise ve üniversite öğrencileri, genç yazılımcılar, tasarımcılar, donanım geliştiricileri ve dijital içerik üreticileri için tasarlanmıştır. Teknolojiye tutku duyan her genç üreticiye kapımız açıktır."
    },
    {
      q: "Platformu kullanmak tamamen ücretsiz mi?",
      a: "Evet! Genç Sosyal kâr amacı gütmeyen üretici kültürünü destekler. Hesap oluşturmak, projeleri sergilemek, topluluk kurmak ve platformun tüm özelliklerinden yararlanmak tamamen ücretsizdir."
    },
    {
      q: "Projelerimi profilimde nasıl sergileyebilirim?",
      a: "Kayıt olduktan sonra 'Projelerim' sekmesinden projenin GitHub reposunu, canlı demo bağlantısını, ekran görüntülerini ve mimari açıklamalarını ekleyerek projenizi yaşayan bir portföy olarak vitrine çıkarabilirsiniz."
    },
    {
      q: "Okul kulübüm veya Teknofest takımım için topluluk açabilir miyim?",
      a: "Kesinlikle! Topluluklar bölümünden üniversite/lise kulübünüz veya yarışma takımınız için özel bir alan kurabilir; duyurularınızı paylaşabilir, etkinlik düzenleyebilir ve yeni takım arkadaşları arayabilirsiniz."
    },
    {
      q: "Profilimi iş veya staj başvurularında portföy olarak kullanabilir miyim?",
      a: "Evet. Genç Sosyal profilleri ve proje sayfaları arama motorlarında indekslenebilir (tercihinize bağlı olarak), SEO uyumlu ve doğrudan paylaşılabilir şekilde yapılandırılmıştır. Profil bağlantınızı özgeçmişinize güvenle ekleyebilirsiniz."
    },
    {
      q: "Verilerim ve gizliliğim nasıl korunuyor?",
      a: "Verileriniz KVKK standartlarına uygun olarak en güncel şifreleme protokolleriyle korunur. Verileriniz asla reklam ağlarına veya üçüncü taraf şirketlere satılmaz; platformda algoritmik manipülasyon veya gözetleme yoktur."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#080E1A] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors relative overflow-hidden">
      
      {/* AMBIENT FROSTED GLOW MESH (Deep Navy & Ice Blue) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-70 dark:opacity-40"
      >
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-blue-400/20 via-sky-300/15 to-transparent dark:from-blue-600/20 dark:via-indigo-900/15 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[35%] -left-[15%] w-[700px] h-[600px] bg-gradient-to-r from-sky-400/15 to-transparent dark:from-blue-900/15 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[650px] h-[550px] bg-gradient-to-l from-indigo-400/15 to-transparent dark:from-indigo-950/20 dark:to-transparent rounded-full blur-3xl" />
      </div>

      {/* 1. TOP NAVIGATION BAR (Premium Frosted Glass) */}
      <header className="sticky top-0 z-50 w-full glass-nav bg-white/80 dark:bg-[#080E1A]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg py-1"
            aria-label="Genç Sosyal Ana Sayfa"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
              GS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Genç <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-300">Sosyal</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                Genç Üretici Platformu
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link 
              to="/home" 
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-white/[0.05] transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>Canlı Akış</span>
            </Link>
            <Link 
              to="/explore" 
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-white/[0.05] transition-all"
            >
              Keşfet
            </Link>
            <Link 
              to="/projects" 
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-white/[0.05] transition-all"
            >
              Projeler
            </Link>
            <Link 
              to="/communities" 
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-white/[0.05] transition-all"
            >
              Topluluklar
            </Link>
            <Link 
              to="/teknofest" 
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-white/[0.05] transition-all flex items-center gap-1"
            >
              <span>TEKNOFEST</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">2026</span>
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={actualTheme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {actualTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Giriş Yap
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span>Kayıt Ol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              aria-label="Tema değiştir"
            >
              {actualTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#080E1A]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-semibold">
                <Link 
                  to="/home" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>Canlı Akışa Git</span>
                </Link>
                <Link 
                  to="/explore" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200"
                >
                  Keşfet
                </Link>
                <Link 
                  to="/projects" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200"
                >
                  Projeler
                </Link>
                <Link 
                  to="/communities" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200"
                >
                  Topluluklar
                </Link>
                <Link 
                  to="/teknofest" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200"
                >
                  TEKNOFEST
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-white/[0.06] rounded-xl"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-blue-600 rounded-xl"
                >
                  Kayıt Ol
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto pt-14 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        
        {/* Glowing Frosted Kicker Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-[#0B1329]/80 border border-slate-200/90 dark:border-sky-500/20 backdrop-blur-md text-xs font-bold text-slate-800 dark:text-sky-300 shadow-sm shadow-blue-500/5 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          <span>TÜRKİYE'NİN GENÇ DİJİTAL ÜRETİCİ AĞI</span>
        </motion.div>

        {/* Primary Title with Deep Navy / Ice Blue Gradient */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] max-w-4xl mb-6"
        >
          Fikirlerini Kodla.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-300 dark:via-blue-400 dark:to-indigo-300">
            Projelerini Sergile.
          </span>{' '}
          Takımını Kur.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl leading-relaxed mb-8"
        >
          Algoritmik gürültüden ve reklam kirliliğinden arındırılmış; yalnızca yazılımcılar, tasarımcılar ve genç üreticilere adanmış yeni nesil sosyal ekosistem.
        </motion.p>

        {/* High-Impact CTA Row - Direct Access to Live Feed and Registration */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-10"
        >
          {/* Primary Action: Go straight to live feed */}
          <Link
            to="/home"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Canlı Akışı Keşfet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary Action: Register */}
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl glass-card bg-white/80 dark:bg-[#0B1329]/80 hover:bg-white dark:hover:bg-[#101C38] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-white/[0.12] font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Ücretsiz Kayıt Ol</span>
          </Link>

          {/* Tertiary Action: Projects */}
          <Link
            to="/projects"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white font-bold text-sm sm:text-base hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5"
          >
            <FolderGit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Projeler</span>
          </Link>
        </motion.div>

        {/* Frosted Glass Value Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl text-xs font-semibold">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] backdrop-blur-md text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>100+ Doğrulanmış Açık Kaynak Proje</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] backdrop-blur-md text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>TEKNOFEST & Kulüp Takımları</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] backdrop-blur-md text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>%100 Reklamsız & Şeffaf Akış</span>
          </div>
        </div>

      </section>

      {/* 3. INTERACTIVE PRODUCT SHOWCASE (Frosted Glass Cockpit) */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="rounded-2xl sm:rounded-3xl glass-surface bg-white/80 dark:bg-[#0B1329]/80 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.1] p-4 sm:p-7 shadow-xl shadow-slate-200/40 dark:shadow-black/60 relative overflow-hidden">
          
          {/* Subtle Window Top Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-200/70 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                app.gencsosyal.com
              </span>
            </div>

            {/* Segmented Switcher Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-black/30 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'feed'
                    ? 'bg-white dark:bg-[#101C38] text-blue-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Canlı Akış</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-white dark:bg-[#101C38] text-blue-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Proje Vitrini</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('teknofest')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'teknofest'
                    ? 'bg-white dark:bg-[#101C38] text-blue-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>TEKNOFEST</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('communities')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'communities'
                    ? 'bg-white dark:bg-[#101C38] text-blue-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Topluluk</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="pt-5">
            {/* 1. FEED PREVIEW */}
            {activeTab === 'feed' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl glass-card bg-white/70 dark:bg-[#080E1A]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
                  {/* Author Header */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        BK
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Burak Kılıç</span>
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-slate-400">@burak · 12 dk önce</span>
                        </div>
                        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                          Açık Kaynak Geliştirici & ODTÜ Bilgisayar
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900/40">
                      #yazılım
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
                    Rust ile yazdığımız yeni yüksek performanslı Redis protokol uyumlu önbellek motorunu açık kaynak olarak yayınladık! 🚀 Sıfır bellek sızıntısı ve 1.2M RPS benchmark sonuçlarına ulaştık. Repoyu inceleyip yıldız vermeyi unutmayın!
                  </p>

                  {/* Code Card Snippet */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-emerald-400">$ cargo add gencsosyal-cache-rs</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">v0.9.4</span>
                  </div>

                  {/* Interactive Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={handleLikePreview}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          likedPreview ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPreview ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{likeCountPreview}</span>
                      </button>
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>18 yanıt</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Share2 className="w-4 h-4 text-emerald-500" />
                        <span>7 alıntı</span>
                      </span>
                    </div>
                    <Link
                      to="/home"
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>Akışta İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. PROJECTS PREVIEW */}
            {activeTab === 'projects' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl glass-card bg-white/70 dark:bg-[#080E1A]/80 border border-slate-200/80 dark:border-white/[0.08]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold border border-blue-500/20">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          Açık Kaynak Geliştirici Kiti
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            v1.4.0
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>@imran</span>
                          <span>·</span>
                          <span>React 19, TypeScript, Tailwind</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" /> 210 yıldız
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/projects"
                      className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold text-xs hover:bg-sky-500/20 transition-colors self-start sm:self-center"
                    >
                      Tüm Projeleri Keşfet
                    </Link>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    Türkiye'deki genç yazılımcıların portföy ve açık kaynak projelerini tek bir çatı altında toplayan modüler mimari. Otomatik GitHub Actions entegrasyonu ve canlı demo desteği içerir.
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] font-mono text-slate-600 dark:text-slate-400">#açıkkaynak</span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] font-mono text-slate-600 dark:text-slate-400">#typescript</span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] font-mono text-slate-600 dark:text-slate-400">#web</span>
                    </div>
                    <Link 
                      to="/projects"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
                    >
                      <span>Detayları İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. TEKNOFEST PREVIEW */}
            {activeTab === 'teknofest' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl glass-card bg-gradient-to-br from-sky-950/40 via-blue-950/20 to-transparent border border-sky-500/20">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        <Trophy className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-white tracking-tight">
                          TEKNOFEST Havacılık & Teknoloji Festivali
                        </h4>
                        <span className="text-xs text-sky-300 font-medium">
                          Geleceği Kodlayan Genç Mühendisler ve Takımlar
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Aktif Köşe
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed pt-2">
                    İnsansız hava araçları, otonom kara robotları, roket sistemleri ve yapay zekâ kategorilerinde yarışan takımların proje bültenleri, teknik videoları ve ekip arayışları.
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>46 Yarışma Kategorisi</span>
                      <span>·</span>
                      <span>32,000+ Geliştirici Takımı</span>
                    </div>
                    <Link
                      to="/teknofest"
                      className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>TEKNOFEST Köşesine Git</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. COMMUNITIES PREVIEW */}
            {activeTab === 'communities' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl glass-card bg-white/70 dark:bg-[#080E1A]/80 border border-slate-200/80 dark:border-white/[0.08]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                          Yazılım & Yapay Zekâ Topluluğu
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          480 Aktif Geliştirici · Haftalık Hackathonlar & Kod İncelemeleri
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/communities"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
                    >
                      Tüm Topluluklar
                    </Link>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    Üniversite kulüpleri, açık kaynak hacker grupları ve bağımsız maker'lar burada toplanıyor. Birlikte projeler üretin, takım arkadaşları edinin.
                  </p>

                  <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Son tartışma: "LLM Destekli Kod İnceleme Ajanları Nasıl Kurulur?"</span>
                    <Link to="/communities" className="text-blue-600 dark:text-sky-400 font-bold hover:underline">
                      Topluluğa Katıl →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* 4. VALUE PILLARS (Frosted Glass Cards) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase mb-2">
            NEDEN GENÇ SOSYAL?
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Geliştirici Kültürü İçin İnşa Edildi
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2.5 leading-relaxed">
            Geleneksel sosyal medyanın yüzeysel etkileşimleri yerine, somut projelere ve derin teknik paylaşımlara odaklanıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 */}
          <div className="glass-card bg-white/70 dark:bg-[#0B1329]/70 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-sky-400/40 hover:-translate-y-1 transition-all shadow-sm">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-4 border border-blue-500/20">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Yaşayan Proje Portföyü
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Statik PDF özgeçmişleri unutun. Geliştirdiğiniz yazılımları, repolarınızı, canlı demolarınızı profilinizde vitrine çıkarın.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link to="/projects" className="text-xs font-bold text-blue-600 dark:text-sky-400 inline-flex items-center gap-1 hover:underline">
                <span>Projeleri Gör</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card bg-white/70 dark:bg-[#0B1329]/70 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:-translate-y-1 transition-all shadow-sm">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Kulüpler & Takımlar
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Yalnız kodlama devri bitti. Teknofest ve yarışmalar için yetenekli takım arkadaşları bulun, etkinlikler düzenleyin.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link to="/communities" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline">
                <span>Toplulukları İncele</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card bg-white/70 dark:bg-[#0B1329]/70 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:-translate-y-1 transition-all shadow-sm">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Şeffaf & Temiz Akış
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Bağımlılık algoritmaları ve reklamlar yok. Yalnızca takip ettiğiniz üreticiler, topluluklar ve somut üretimler var.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link to="/home" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline">
                <span>Canlı Akışa Geç</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card bg-white/70 dark:bg-[#0B1329]/70 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-400/40 hover:-translate-y-1 transition-all shadow-sm">
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                19 Mayıs Gençlik Ligi
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Bilim, tarih ve teknoloji düellolarında 1v1 yarışın. Unvanlar ve şampiyonluk puanları kazanarak itibarınızı yükseltin.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link to="/youth-league" className="text-xs font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 hover:underline">
                <span>Ligi İncele</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. OFFICIAL INFRASTRUCTURE SPONSOR: BILHOST */}
      <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-4">
            RESMİ ALTYAPI SPONSORUMUZ
          </span>

          <a 
            href="https://www.bilhost.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block"
            aria-label="Bilhost Resmi Web Sitesi"
          >
            <div className="px-10 py-6 glass-card bg-white/70 dark:bg-[#0B1329]/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-blue-500/40 transition-all group-hover:-translate-y-0.5 flex items-center justify-center">
              <img 
                src="https://www.bilhost.com/assets/images/logo.svg" 
                alt="Bilhost Logo" 
                className="h-9 md:h-11 w-auto object-contain transition-all duration-300 opacity-80 group-hover:opacity-100"
              />
            </div>
          </a>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-4 leading-relaxed">
            Genç Sosyal'in yüksek performanslı, kesintisiz ve güvenli sunucu altyapısı{' '}
            <strong className="text-slate-900 dark:text-white font-bold">Bilhost</strong> tarafından sağlanmaktadır.
          </p>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS (Frosted Accordion) */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase mb-2">
            MERAK EDİLENLER
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sıkça Sorulan Sorular
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="glass-card border border-slate-200/80 dark:border-white/[0.08] rounded-2xl bg-white/70 dark:bg-[#0B1329]/70 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CONVERSION BANNER (Frosted Glass Aura) */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0B1329] to-[#080E1A] text-white p-8 sm:p-14 text-center overflow-hidden border border-white/[0.1] shadow-2xl">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Geleceği Kodlayanların <br />
              Arasında Yerini Al.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Fikirlerini gerçeğe dönüştürmek, projelerini binlerce geliştiriciye duyurmak ve benzer tutkudaki genç üreticilerle tanışmak için bugün aramıza katıl.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ücretsiz Hesap Oluştur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/home"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center cursor-pointer border border-white/[0.12] backdrop-blur-md"
              >
                <Radio className="w-4 h-4 mr-1 text-sky-400" />
                <span>Canlı Akışı Keşfet</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ARCHITECTURAL FOOTER */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-white/40 dark:bg-[#05080E]/80 backdrop-blur-md py-12 transition-colors relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-3.5">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  GS
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Genç <span className="text-blue-600 dark:text-sky-400">Sosyal</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini sergilediği, topluluklar kurduğu ve birlikte ürettiği bağımsız dijital ekosistem.
              </p>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Altyapı Sponsorumuz:{' '}
                <a 
                  href="https://www.bilhost.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 underline"
                >
                  Bilhost
                </a>
              </div>
            </div>

            {/* Links: Platform */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/home" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium">Canlı Akış</Link></li>
                <li><Link to="/explore" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Keşfet</Link></li>
                <li><Link to="/projects" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Projeler</Link></li>
                <li><Link to="/communities" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Topluluklar</Link></li>
                <li><Link to="/teknofest" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">TEKNOFEST</Link></li>
              </ul>
            </div>

            {/* Links: Hesap */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Hesap
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Giriş Yap</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Kayıt Ol</Link></li>
                <li><Link to="/forgot-password" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Şifremi Unuttum</Link></li>
              </ul>
            </div>

            {/* Links: Yasal */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Yasal & Güvenlik
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Kullanım Koşulları</Link></li>
                <li><a href="/robots.txt" target="_blank" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Robots.txt</a></li>
                <li><a href="/sitemap.xml" target="_blank" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Sitemap.xml</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} Genç Sosyal. Genç üreticiler için açık ve bağımsız ekosistem.</p>
            <div className="flex items-center gap-4">
              <span>https://gencsosyal.com</span>
              <span>·</span>
              <span>İstanbul, Türkiye</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

