import React from "react";
import { Outlet, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { AppHeader } from "../components/navigation/AppHeader";
import { DesktopSidebar } from "../components/navigation/DesktopSidebar";
import { MobileBottomNav } from "../components/navigation/MobileBottomNav";
import { LoginBottomSheet } from "../components/auth/LoginBottomSheet";
import { LoadingState } from "../components/ui/LoadingState";
import { PageTransition } from "../components/ui/PageTransition";

function RightSidebar() {
  return (
    <div className="bg-slate-50/70 rounded-3xl p-5 border border-slate-200/80 sticky top-6">
      <h2 className="text-lg font-bold mb-3 text-slate-900 tracking-tight">Gündem</h2>
      <div className="flex flex-col gap-3 text-slate-500 text-sm leading-relaxed">
        Henüz bir gündem verisi bulunmuyor. Trend konular yakında burada listelenecek.
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-slate-400">
        <Link to="/terms" className="hover:text-slate-600 transition-colors">Kullanım Koşulları</Link>
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">Gizlilik Politikası</Link>
        <span>&copy; {new Date().getFullYear()} Genç Sosyal</span>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingState fullPage text="Genç Sosyal yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <AppHeader />
      <div className="w-full max-w-7xl mx-auto flex flex-1 relative">
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-20 xl:w-68 sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200/80 bg-white z-20 shrink-0">
          <DesktopSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white border-r border-slate-200/80 pb-20 md:pb-8 min-h-[calc(100vh-4rem)]">
          <PageTransition><Outlet /></PageTransition>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 sticky top-16 h-[calc(100vh-4rem)] p-6 shrink-0 bg-white overflow-y-auto">
          <RightSidebar />
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 flex flex-col justify-center pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.03)]">
          <MobileBottomNav />
        </nav>
      </div>
      <LoginBottomSheet />
    </div>
  );
}
