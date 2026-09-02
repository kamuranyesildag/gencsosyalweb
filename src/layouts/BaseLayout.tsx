import React from 'react';
import { Outlet } from 'react-router';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/navigation/AppHeader';
import { LoginBottomSheet } from '../components/auth/LoginBottomSheet';
import { PageTransition } from '../components/ui/PageTransition';

export function BaseLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-slate-100 selection:text-slate-900">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col">
        <PageTransition><Outlet /></PageTransition>
      </main>
      <Footer />
      <LoginBottomSheet />
    </div>
  );
}
