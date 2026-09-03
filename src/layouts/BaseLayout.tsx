import React from 'react';
import { Outlet } from 'react-router';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/navigation/AppHeader';
import { LoginBottomSheet } from '../components/auth/LoginBottomSheet';
import { PageTransition } from '../components/ui/PageTransition';

export function BaseLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-slate-100 dark:bg-slate-900 selection:text-slate-900 dark:text-slate-100">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col">
        <PageTransition><Outlet /></PageTransition>
      </main>
      <Footer />
      <LoginBottomSheet />
    </div>
  );
}
