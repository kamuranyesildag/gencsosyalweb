import React, { useState } from "react";
import { Outlet } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { AppHeader } from "../components/navigation/AppHeader";
import { DesktopSidebar } from "../components/navigation/DesktopSidebar";
import { MobileBottomNav } from "../components/navigation/MobileBottomNav";
import { RightSidebar } from "../components/navigation/RightSidebar";
import { LoginBottomSheet } from "../components/auth/LoginBottomSheet";
import { LoadingState } from "../components/ui/LoadingState";
import { PageTransition } from "../components/ui/PageTransition";
import { MobileSidebarDrawer } from "../components/navigation/MobileSidebarDrawer";

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingState fullPage text="Genç Sosyal yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      {/* 1. Global Header */}
      <AppHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* 2. Mobile Drawer Navigation */}
      <MobileSidebarDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* 3. Main Multi-Column Shell */}
      <div className="w-full max-w-7xl mx-auto flex flex-1 relative">
        {/* Left Navigation Sidebar (Desktop & Tablet) */}
        <aside
          aria-label="Sol Gezinme Menüsü"
          className="hidden md:flex flex-col w-20 xl:w-64 sticky top-[60px] h-[calc(100vh-60px)] border-r border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#070A10]/80 backdrop-blur-sm z-20 shrink-0 transition-colors"
        >
          <DesktopSidebar />
        </aside>

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 min-w-0 bg-transparent border-r border-slate-200/80 dark:border-white/[0.08] pb-[calc(68px+var(--sab,0px))] md:pb-10 min-h-[calc(100vh-60px)] transition-colors"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Right Sidebar (Discovery & Contextual Panels) */}
        <aside
          aria-label="Sağ Bilgi ve Keşif Paneli"
          className="hidden lg:block w-72 xl:w-80 sticky top-[60px] h-[calc(100vh-60px)] p-4 xl:p-5 shrink-0 bg-transparent overflow-y-auto no-scrollbar transition-colors"
        >
          <RightSidebar />
        </aside>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>

      {/* Auth Modal / Bottom Sheet */}
      <LoginBottomSheet />
    </div>
  );
}
