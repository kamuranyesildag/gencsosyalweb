import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileCheck2, 
  AlertTriangle, 
  Megaphone, 
  Server, 
  ArrowUpRight, 
  ShieldCheck, 
  Mail, 
  History, 
  UserCheck, 
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton, SkeletonText } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';
import { Link } from 'react-router';

interface AdminDashboardProps {
  onNavigateTab: (tab: 'stats' | 'users' | 'official' | 'autofollow' | 'verifications' | 'reports' | 'smtp' | 'audit') => void;
}

interface StatsData {
  totalUsers: number;
  pendingVerifications: number;
  openReports?: number;
  officialAccounts?: number;
}

export function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, verRes, reportsRes, officialRes] = await Promise.all([
        fetchApi('/admin/stats'),
        fetchApi('/admin/verifications?limit=5&status=pending'),
        fetchApi('/admin/reports?status=PENDING&limit=1'),
        fetchApi('/admin/official-accounts'),
      ]);

      const statsJson = await statsRes.json();
      const verJson = await verRes.json();
      const reportsJson = await reportsRes.json();
      const officialJson = await officialRes.json();

      if (statsJson.success) {
        setStats({
          totalUsers: statsJson.data.totalUsers || 0,
          pendingVerifications: statsJson.data.pendingVerifications || 0,
          openReports: Array.isArray(reportsJson.data) ? reportsJson.data.length : 0,
          officialAccounts: Array.isArray(officialJson.data) ? officialJson.data.length : 0,
        });
      }
      if (verJson.success && Array.isArray(verJson.data)) {
        setRecentVerifications(verJson.data.slice(0, 3));
      }
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(err.message || 'İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (error) {
    return (
      <ErrorState
        title="Genel Bakış Yüklenemedi"
        message={error}
        onRetry={loadDashboardData}
      />
    );
  }

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers ?? 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-slate-900 dark:text-slate-100',
      bg: 'bg-slate-100 dark:bg-slate-900',
      badge: 'Aktif Platform',
      badgeVariant: 'default' as const,
      tab: 'users' as const,
    },
    {
      title: 'Bekleyen Başvurular',
      value: stats?.pendingVerifications ?? 0,
      icon: <FileCheck2 className="w-5 h-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badge: stats?.pendingVerifications ? `${stats.pendingVerifications} İnceleme Bekliyor` : 'Temiz',
      badgeVariant: stats?.pendingVerifications ? ('warning' as const) : ('success' as const),
      tab: 'verifications' as const,
    },
    {
      title: 'Açık Şikayetler',
      value: stats?.openReports ?? 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      badge: stats?.openReports ? `${stats.openReports} Bekleyen Rapor` : 'Sorunsuz',
      badgeVariant: stats?.openReports ? ('danger' as const) : ('success' as const),
      tab: 'reports' as const,
    },
    {
      title: 'Resmi Hesaplar',
      value: stats?.officialAccounts ?? 0,
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      badge: 'Doğrulanmış Kurumsal',
      badgeVariant: 'info' as const,
      tab: 'official' as const,
    },
  ];

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-slate-1000/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-950/10 backdrop-blur-md text-slate-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yönetim ve Güvenlik Merkezi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Genç Sosyal Yönetim Paneli
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed font-normal">
              Kullanıcı hesapları, moderasyon raporları, doğrulama başvuruları ve sistem yapılandırmasını tek merkezden yönetin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadDashboardData}
              className="bg-white dark:bg-slate-950/10 hover:bg-white dark:bg-slate-950/20 text-white border-white/10 backdrop-blur-md"
            >
              Yenile
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Users className="w-4 h-4" />}
              onClick={() => onNavigateTab('users')}
            >
              Kullanıcıları Yönet
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="elevated" padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <SkeletonText lines={2} />
              </Card>
            ))
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  variant="interactive"
                  padding="md"
                  onClick={() => onNavigateTab(stat.tab)}
                  className="flex flex-col justify-between h-full group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-xs`}>
                        {stat.icon}
                      </div>
                      <Badge variant={stat.badgeVariant} size="sm">
                        {stat.badge}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                        {stat.value.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700">
                    <span>Yönetime Git</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Quick Actions & System Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <Card variant="default" padding="lg" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Hızlı Yönetim İşlemleri</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sık kullanılan yönetim sayfalarına doğrudan erişim</p>
            </div>
            <Activity className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('verifications')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/70 hover:border-slate-200 dark:border-slate-800 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 flex items-center justify-between">
                  <span>Mavi Tik Başvuruları</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Doğrulama taleplerini incele ve onayla</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-rose-50/60 border border-slate-200 dark:border-slate-800/70 hover:border-rose-200 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-700 flex items-center justify-between">
                  <span>Moderasyon & Raporlar</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Şikayet edilen içerikleri ve kullanıcıları denetle</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('official')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-sky-50/60 border border-slate-200 dark:border-slate-800/70 hover:border-sky-200 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 flex items-center justify-between">
                  <span>Resmi Hesaplar</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Kurumsal rozet ve öncelikli bildirim ayarları</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('autofollow')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-emerald-50/60 border border-slate-200 dark:border-slate-800/70 hover:border-emerald-200 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 flex items-center justify-between">
                  <span>Otomatik Takip</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Yeni kayıt olanların otomatik takip edeceği hesaplar</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('smtp')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/70 hover:border-slate-200 dark:border-slate-800 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 flex items-center justify-between">
                  <span>SMTP / E-posta</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Sistem e-posta sunucusu ve bağlantı testi</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/70 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800/80 text-slate-700 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 flex items-center justify-between">
                  <span>Denetim Kayıtları</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Yönetici eylem geçmişi ve güvenlik logları</p>
              </div>
            </button>
          </div>
        </Card>

        {/* System Health Card */}
        <Card variant="default" padding="lg" className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sistem Sağlığı</h3>
              <Badge variant="success" dot>Çalışıyor</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Veritabanı</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bağlı (PostgreSQL)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Kimlik Doğrulama</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> JWT & Refresh Token
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">API Durumu</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" /> v1 / Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<History className="w-4 h-4" />}
              onClick={() => onNavigateTab('audit')}
            >
              Denetim Geçmişini Görüntüle
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Pending Verifications Preview */}
      {recentVerifications.length > 0 && (
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">İnceleme Bekleyen Son Başvurular</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kullanıcılardan gelen mavi tik onay talepleri</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
              onClick={() => onNavigateTab('verifications')}
            >
              Tümünü Gör ({stats?.pendingVerifications || recentVerifications.length})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentVerifications.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/70 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">@{v.username}</span>
                    <Badge variant="warning" size="sm">Bekliyor</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic">
                    "{v.reason}"
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateTab('verifications')}
                  >
                    İncele
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
