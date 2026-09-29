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
  BadgeCheck
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useThemeStore } from '../context/useTheme';

export function Landing() {
  useSEO({ 
    title: "Genç Sosyal — Genç Üretici Platformu", 
    description: "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini sergilediği, topluluk kurduğu ve birlikte ürettiği bağımsız sosyal ağ.",
    canonicalPath: "/"
  });

  const { actualTheme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'communities' | 'feed'>('projects');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
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
    <div className="w-full min-h-screen bg-white dark:bg-[#070A10] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#070A10]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg py-1"
            aria-label="Genç Sosyal Ana Sayfa"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              GS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Genç <span className="text-blue-600">Sosyal</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                Genç Üretici Platformu
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link 
              to="/explore" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md px-1 py-0.5"
            >
              Keşfet
            </Link>
            <Link 
              to="/projects" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md px-1 py-0.5"
            >
              Projeler
            </Link>
            <Link 
              to="/communities" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md px-1 py-0.5"
            >
              Topluluklar
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={actualTheme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {actualTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Giriş Yap
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
              {actualTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              className="md:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D121D] px-4 pt-3 pb-6 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-semibold">
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
      <section className="relative w-full max-w-7xl mx-auto pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle Architectural Atmosphere (Anti-slop: crisp geometric depth, no purple fog) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Quiet Kicker */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>TÜRKİYE'NİN GENÇ DİJİTAL ÜRETİCİ AĞI</span>
        </div>

        {/* Primary Title */}
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] max-w-4xl mb-6">
          Fikirlerini Kodla. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
            Projelerini Sergile.
          </span>{' '}
          Takımını Kur.
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal max-w-2xl leading-relaxed mb-8">
          Algoritmik gürültüden ve reklam kirliliğinden arındırılmış; yalnızca yazılımcılar, tasarımcılar ve genç üreticilere adanmış yeni nesil sosyal ekosistem.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>Ücretsiz Başla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/projects"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-[#0D121D] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.12] font-bold text-sm sm:text-base shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Projeleri İncele</span>
          </Link>
        </div>

        {/* Proof / Value Strip (Clean unboxed text separators) */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-3xl">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100+ Doğrulanmış Açık Kaynak Proje</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Üniversite & Lise Kulüpleri</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reklamsız ve Şeffaf Akış</span>
          </div>
        </div>

      </section>

      {/* 3. INTERACTIVE PRODUCT SHOWCASE */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-8 shadow-xl">
          
          {/* Segmented Switcher Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 p-1 bg-slate-200/70 dark:bg-white/[0.06] rounded-xl max-w-md mx-auto sm:mx-0 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-[#070A10] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Proje Vitrini
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('communities')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'communities'
                  ? 'bg-white dark:bg-[#070A10] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Topluluk Hub'ı
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-white dark:bg-[#070A10] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Üretici Akışı
            </button>
          </div>

          {/* Interactive Mockup Body */}
          <div className="bg-white dark:bg-[#070A10] rounded-xl border border-slate-200 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm">
            {activeTab === 'projects' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                      <FolderGit2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Açık Kaynak Geliştirici Kiti
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          v1.4.0
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>imran</span>
                        <span>·</span>
                        <span>React, TypeScript, Tailwind</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 142 yıldız
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to="/projects"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-center"
                  >
                    <span>Tüm Projeleri Gör</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Türkiye'deki genç yazılımcıların portföy ve açık kaynak projelerini tek bir standart altında toplamayı hedefleyen modüler kütüphane. Otomatik dokümantasyon, GitHub Actions entegrasyonu ve sıfır bağımlılıkla çalışır.
                </p>

                {/* Tech tags & links */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="font-mono">#açıkkaynak</span>
                    <span>·</span>
                    <span className="font-mono">#typescript</span>
                    <span>·</span>
                    <span className="font-mono">#webgelistirme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-slate-500 text-xs">github.com/gencsosyal/devkit</span>
                    <Link 
                      to="/projects"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors"
                    >
                      Projeyi İncele
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communities' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Yazılım & Teknoloji Topluluğu
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>420 Aktif Üye</span>
                        <span>·</span>
                        <span>Haftalık Hackathon & Kod İncelemeleri</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to="/communities"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-center"
                  >
                    <span>Toplulukları Gör</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Web, mobil, yapay zeka ve sistem programlama alanında üreten gençlerin buluştuğu merkezi topluluk. Kod incelemeleri, açık kaynak iş birlikleri ve staj deneyimleri bu alanda tartışılıyor.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span>Son tartışma: "Rust ile mikroservis mimarisi deneyimleri"</span>
                  </div>
                  <Link 
                    to="/communities"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
                  >
                    Topluluğa Katıl
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      AY
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Alperen Yılmaz</span>
                        <span className="text-xs text-slate-400">@alperen · 1 sa önce</span>
                      </div>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        Teknofest Otonom Araç Projesi
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  LIDAR ve kamera füzyonu üzerinde çalışan ROS2 düğümümüzün ilk açık kaynak sürümünü GitHub'da paylaştık! Simülasyon ortamında test etmek isteyen arkadaşlar profilimdeki proje linkinden katkı verebilir. Geri bildirimlerinizi bekliyorum. 🚗⚡
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> 45 beğeni
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> 16 yanıt
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">#robotik · #ros2 · #teknofest</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. VALUE PILLARS (THE 4 PILLARS OF GENÇ SOSYAL) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-3">
            NEDEN GENÇ SOSYAL?
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Geliştirici Kültürü İçin İnşa Edildi
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Geleneksel sosyal medyanın yüzeysel etkileşimleri yerine, somut projelere ve derin teknik paylaşımlara odaklanıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1 */}
          <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                Yaşayan Proje Portföyü
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Statik PDF özgeçmişleri unutun. Geliştirdiğiniz yazılımları, repolarınızı, canlı demolarınızı ve mimari kararlarınızı profilinizde kalıcı olarak sergileyin. Her proje kendi vitrininde parlasın.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
              <Link to="/projects" className="inline-flex items-center gap-1 hover:underline">
                <span>Projeleri Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                Kulüpler & Hackathon Ekipleri
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Yalnız kodlama devri bitti. Teknofest, yarışmalar ve açık kaynak girişimleriniz için yetenekli takım arkadaşları bulun. Üniversite ve lise kulüpleriyle ortak etkinlikler planlayın.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Link to="/communities" className="inline-flex items-center gap-1 hover:underline">
                <span>Toplulukları İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                Manipülasyonsuz Şeffaf Akış
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Sizi ekrana bağlamaya çalışan bağımlılık algoritmaları, sansasyonel içerikler ve reklamlar yok. Yalnızca takip ettiğiniz üreticiler, topluluk tartışmaları ve teknik gelişmeler var.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
              <span>%100 Kronolojik & Şeffaf Akış</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                Doğrulanmış Üretici Kimliği
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                GitHub doğrulaması, tamamlanan görevler, topluluk katkıları ve rozetlerle gerçek bir saygınlık kazanın. Yeteneğinizi ve katkı geçmişinizi şeffaf bir dijital kimliğe dönüştürün.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
              <span>Şeffaf Rozet & İtibar Sistemi</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. MAKER JOURNEY (HOW IT WORKS IN 3 STEPS) */}
      <section className="w-full bg-slate-50/70 dark:bg-[#0A0E17] py-20 border-y border-slate-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-3">
              NASIL ÇALIŞIR?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              3 Adımda Üretici Yolculuğu
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between shadow-sm relative">
              <div className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 mb-4 font-mono">
                01
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Profilini ve Uzmanlığını Belirle
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  İlgi duyduğun teknolojileri (React, Python, Go, Rust, Flutter, Figma), rolünü ve hedeflerini belirt. Yaşayan geliştirici kartını oluştur.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between shadow-sm relative">
              <div className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 mb-4 font-mono">
                02
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Projelerini ve Kodlarını Paylaş
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Geliştirdiğin yazılımları, tasarım demolarını veya teknik yazılarını paylaş. Diğer üreticilerden yapıcı teknik geri bildirimler al.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between shadow-sm relative">
              <div className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 mb-4 font-mono">
                03
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Topluluklarla Büyü & Takım Kur
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  İlgi alanındaki topluluklara katıl, yarışmalar için takım arkadaşları keşfet ve ortak açık kaynak projelere imza at.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. OFFICIAL INFRASTRUCTURE SPONSOR: BILHOST */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-6">
            RESMİ ALTYAPI SPONSORUMUZ
          </span>

          <a 
            href="https://www.bilhost.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block"
            aria-label="Bilhost Resmi Web Sitesi"
          >
            <div className="px-10 py-7 bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-blue-500/40 transition-all group-hover:-translate-y-0.5 flex items-center justify-center">
              <img 
                src="https://www.bilhost.com/assets/images/logo.svg" 
                alt="Bilhost Logo" 
                className="h-10 md:h-12 w-auto object-contain transition-all duration-300 opacity-80 group-hover:opacity-100"
              />
            </div>
          </a>

          <p className="text-slate-600 dark:text-slate-400 text-sm mt-5 leading-relaxed">
            Genç Sosyal'in yüksek performanslı, kesintisiz ve güvenli sunucu altyapısı{' '}
            <strong className="text-slate-900 dark:text-white font-bold">Bilhost</strong> tarafından sağlanmaktadır.
          </p>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-3">
            MERAK EDİLENLER
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Sıkça Sorulan Sorular
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#0D121D] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
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
                      className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3"
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

      {/* 8. FINAL CONVERSION BANNER */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-14 text-center overflow-hidden border border-white/[0.08] shadow-2xl">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Geleceği Kodlayanların <br />
              Arasında Yerini Al.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Fikirlerini gerçeğe dönüştürmek, projelerini binlerce geliştiriciye duyurmak ve benzer tutkudaki genç üreticilerle tanışmak için bugün aramıza katıl.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ücretsiz Hesap Oluştur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center cursor-pointer border border-white/[0.1]"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. COMPREHENSIVE ARCHITECTURAL FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#05080E] py-14 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  GS
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Genç <span className="text-blue-600">Sosyal</span>
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
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/explore" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Keşfet</Link></li>
                <li><Link to="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projeler</Link></li>
                <li><Link to="/communities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Topluluklar</Link></li>
                <li><Link to="/sitemap" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Site Haritası</Link></li>
              </ul>
            </div>

            {/* Links: Hesap */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Hesap
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Giriş Yap</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kayıt Ol</Link></li>
                <li><Link to="/forgot-password" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Şifremi Unuttum</Link></li>
              </ul>
            </div>

            {/* Links: Yasal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Yasal & Güvenlik
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kullanım Koşulları</Link></li>
                <li><a href="/robots.txt" target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Robots.txt</a></li>
                <li><a href="/sitemap.xml" target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sitemap.xml</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
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
