import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserX, 
  RefreshCw, 
  FileText, 
  MessageSquare, 
  Users, 
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Skeleton, SkeletonText } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { toast } from '../ui/Toast';
import { confirmDialog } from '../ui/ConfirmDialog';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';
import { Link } from 'react-router';

type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('PENDING');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/admin/reports?status=${reportStatus}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      } else {
        throw new Error('Raporlar alınamadı.');
      }
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Moderasyon raporları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportStatus]);

  const handleReportAction = async (id: number, action: string, newStatus?: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetchApi(`/admin/reports/${id}`, {
        method: 'PATCH',
        data: { action, status: newStatus },
      });
      if (res.ok) {
        toast.success('Rapor başarıyla güncellendi.');
        loadReports();
      } else {
        toast.error('İşlem gerçekleştirilemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Hata oluştu.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmRemoveContent = async (r: any) => {
    const confirmed = await confirmDialog(
      'İçeriği Kaldır',
      `Bu ${r.targetType} içeriğini kalıcı olarak silmek ve raporu çözüldü olarak işaretlemek istiyor musunuz?`
    );
    if (confirmed) {
      handleReportAction(r.id, 'remove_content');
    }
  };

  const confirmSuspendUser = async (r: any) => {
    const confirmed = await confirmDialog(
      'Kullanıcıyı Askıya Al',
      `Bu içerik sahibini/kullanıcıyı platformdan askıya almak istiyor musunuz?`
    );
    if (confirmed) {
      handleReportAction(r.id, 'suspend_user');
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-3.5 h-3.5" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'community':
        return <Users className="w-3.5 h-3.5" />;
      case 'user':
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Moderasyon ve Şikayet Raporları</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kullanıcılar tarafından bildirilen uygunsuz gönderi, yorum, topluluk ve hesapları inceleyin.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={loadReports}
        >
          Yenile
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setReportStatus('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            reportStatus === 'PENDING'
              ? 'bg-white text-slate-950 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Açık Raporlar
        </button>
        <button
          onClick={() => setReportStatus('RESOLVED')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            reportStatus === 'RESOLVED'
              ? 'bg-white text-slate-950 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Çözülenler
        </button>
        <button
          onClick={() => setReportStatus('DISMISSED')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            reportStatus === 'DISMISSED'
              ? 'bg-white text-slate-950 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reddedilen / Kapatılanlar
        </button>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Raporlar Yüklenemedi"
          message={error}
          onRetry={loadReports}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <SkeletonText lines={3} />
            </Card>
          ))}
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && (
        <>
          {reports.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-7 h-7" />}
              title="Rapor Bulunamadı"
              description={
                reportStatus === 'PENDING'
                  ? 'Şu anda incelenmeyi bekleyen açık bir şikayet raporu bulunmuyor. Platform temiz!'
                  : 'Bu kategoride listelenecek bir rapor kaydı yok.'
              }
            />
          ) : (
            <div className="space-y-4">
              {reports.map((r) => {
                const isActioning = actionLoadingId === r.id;
                return (
                  <motion.div
                    key={r.id}
                    variants={slideUpVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card variant="default" padding="lg" className="space-y-4">
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">Rapor Eden:</span>
                          <span className="text-sm font-bold text-slate-900">@{r.reporterUsername || 'Bilinmeyen'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(r.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              r.targetType === 'post'
                                ? 'default'
                                : r.targetType === 'user'
                                ? 'danger'
                                : 'info'
                            }
                            size="sm"
                            icon={getTargetIcon(r.targetType)}
                          >
                            Hedef: {r.targetType?.toUpperCase()} (ID: {r.targetId})
                          </Badge>

                          <Badge
                            variant={
                              r.status === 'RESOLVED'
                                ? 'success'
                                : r.status === 'DISMISSED'
                                ? 'secondary'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {r.status === 'RESOLVED'
                              ? 'Çözüldü'
                              : r.status === 'DISMISSED'
                              ? 'Kapatıldı'
                              : 'Açık'}
                          </Badge>
                        </div>
                      </div>

                      {/* Reason Description */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Şikayet Nedeni ve Açıklama:
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                          {r.reason}
                        </p>
                      </div>

                      {/* Actions for Pending Reports */}
                      {r.status === 'PENDING' && (
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleReportAction(r.id, '', 'DISMISSED')}
                          >
                            Raporu Kapat (Geçersiz)
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            isLoading={isActioning}
                            onClick={() => confirmRemoveContent(r)}
                          >
                            İçeriği Kaldır
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<UserX className="w-4 h-4" />}
                            isLoading={isActioning}
                            onClick={() => confirmSuspendUser(r)}
                          >
                            Kullanıcıyı Askıya Al
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
