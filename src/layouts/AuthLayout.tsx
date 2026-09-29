import React from "react";
import { Link, Outlet } from "react-router";
import { 
  Sparkles, 
  ArrowLeft, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink 
} from "lucide-react";
import { useThemeStore } from "../context/useTheme";

export function AuthLayout() {
  const { actualTheme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#070A10] text-slate-900 dark:text-slate-100 transition-colors">
      {/* LEFT: Brand Hero Panel (Desktop only, 1024px+) */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative bg-slate-950 text-white flex-col justify-between p-12 overflow-hidden border-r border-white/[0.08]">
        {/* Subtle Ambient Background Gradients (Zero AI-slop: deep, controlled architectural geometry) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }} 
          />
        </div>

        {/* Brand Top Header */}
        <div className="relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            aria-label="Genç Sosyal Ana Sayfa"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg tracking-tight shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              GS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Genç <span className="text-blue-500">Sosyal</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
                Genç Üretici Platformu
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Brand Manifesto & Authentic Mockup */}
        <div className="relative z-10 my-auto py-10 space-y-8 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Geleceğe Üreten Gençlik</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight mb-4">
              Fikirlerini sadece düşünme. <br />
              <span className="text-slate-400">Burada üret, paylaş ve sergile.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Yazılımcılar, tasarımcılar ve dijital üreticiler için gürültüden uzak, proje ve topluluk odaklı bağımsız sosyal ağ.
            </p>
          </div>

          {/* Authentic Product Preview Card */}
          <div className="bg-[#0D121D] border border-white/[0.08] rounded-2xl p-5 shadow-2xl backdrop-blur-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-white/10">
                  BY
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">Berk Yılmaz</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-400">@berk · 2 saat önce</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                #açıkkaynak
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Son 3 aydır geliştirdiğim açık kaynak IoT veri izleme kitini topluluğun kullanımına sundum! 
              Canlı demoyu ve GitHub reposunu profilimdeki projeler sekmesinden inceleyebilirsiniz. 🚀
            </p>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 hover:text-white transition-colors">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> 38
                </span>
                <span className="flex items-center gap-1 hover:text-white transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" /> 12
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Proje: IoT-Dashboard v1.2</span>
            </div>
          </div>

          {/* Key Value Propositions */}
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Açık kaynak projelerini profilinde kalıcı olarak sergile</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Yazılım, tasarım ve yapay zeka topluluklarıyla iş birliği kur</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Algoritmik manipülasyon yok; doğrudan üretici odaklı akış</span>
            </li>
          </ul>
        </div>

        {/* Left Bottom Footer */}
        <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 Genç Sosyal</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Gizlilik</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Şartlar</Link>
            <Link to="/explore" className="hover:text-slate-300 transition-colors">Keşfet</Link>
          </div>
        </div>
      </aside>

      {/* RIGHT: Form & Actions Container */}
      <main className="w-full lg:w-1/2 xl:w-[52%] flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Bar for Form View */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>

          {/* Mobile Center Logo (visible only on <1024px) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              GS
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Genç <span className="text-blue-600">Sosyal</span>
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={actualTheme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
          >
            {actualTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <Outlet />
        </div>

        {/* Bottom Helper Links */}
        <footer className="w-full max-w-md mx-auto pt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Gizlilik Politikası
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Kullanım Koşulları
            </Link>
            <span>·</span>
            <Link to="/sitemap" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Site Haritası
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
