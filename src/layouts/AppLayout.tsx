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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100 selection:text-slate-900 flex flex-col">
      <AppHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
      <MobileSidebarDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="w-full max-w-7xl mx-auto flex flex-1 relative">
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-20 xl:w-68 sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-100 bg-white z-20 shrink-0">
          <DesktopSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white border-r border-slate-100 pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-8 min-h-[calc(100vh-4rem)]">
          <PageTransition><Outlet /></PageTransition>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 sticky top-16 h-[calc(100vh-4rem)] p-5 shrink-0 bg-white overflow-y-auto scrollbar-thin">
          <RightSidebar />
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 flex flex-col justify-center pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.03)]">
          <MobileBottomNav />
        </nav>
      </div>
      <LoginBottomSheet />
    </div>
  );
}
