import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../context/useAuth';
import { Link, Navigate } from 'react-router';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  UserCheck, 
  FileCheck2, 
  AlertTriangle, 
  Mail, 
  History, 
  ArrowLeft, 
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminOfficialAccounts } from '../components/admin/AdminOfficialAccounts';
import { AdminAutoFollow } from '../components/admin/AdminAutoFollow';
import { AdminVerification } from '../components/admin/AdminVerification';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminModeration } from '../components/admin/AdminModeration';
import { AdminSmtp } from '../components/admin/AdminSmtp';
import { AdminAuditLogs } from '../components/admin/AdminAuditLogs';
import { fadeInVariants, slideUpVariants } from '../lib/motion';

export type AdminTab = 
  | 'stats' 
  | 'users' 
  | 'official' 
  | 'autofollow' 
  | 'verifications' 
  | 'reports'
   | 'moderation' 
  | 'smtp' 
  | 'audit';

interface TabItem {
  id: AdminTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export function Admin() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  // RBAC Guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full space-y-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Erişim Yetkisi Gerekli
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Bu sayfaya yalnızca Genç Sosyal sistem yöneticileri (ADMIN) erişebilir. Lütfen yetkili bir hesap ile giriş yapın.
            </p>
          </div>
          <Link to="/">
            <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Ana Sayfaya Dön
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { id: 'stats', label: 'Genel Bakış', shortLabel: 'Özet', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Kullanıcılar', shortLabel: 'Üyeler', icon: <Users className="w-4 h-4" /> },
    { id: 'verifications', label: 'Mavi Tik Başvuruları', shortLabel: 'Mavi Tik', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'moderation', label: 'Otomatik Moderasyon', shortLabel: 'Mod', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'reports', label: 'Kullanıcı Şikayetleri', shortLabel: 'Şikayet', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'official', label: 'Resmi Hesaplar', shortLabel: 'Resmi', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'autofollow', label: 'Otomatik Takip', shortLabel: 'Oto-Takip', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'smtp', label: 'SMTP Yapılandırması', shortLabel: 'SMTP', icon: <Mail className="w-4 h-4" /> },
    { id: 'audit', label: 'Denetim Kayıtları', shortLabel: 'Loglar', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Header / Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                title="Ana Sayfaya Dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base tracking-tight">
                      Genç Sosyal Admin
                    </span>
                    <Badge variant="danger" size="sm">YÖNETİCİ</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Uygulamaya Dön
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/90 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-pill"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10 border border-indigo-200/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'stats' && <AdminDashboard onNavigateTab={setActiveTab} />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'verifications' && <AdminVerification />}
            {activeTab === 'reports' && <AdminReports />}
            {activeTab === 'moderation' && <AdminModeration />}
            {activeTab === 'official' && <AdminOfficialAccounts />}
            {activeTab === 'autofollow' && <AdminAutoFollow />}
            {activeTab === 'smtp' && <AdminSmtp />}
            {activeTab === 'audit' && <AdminAuditLogs />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
export default Admin;
