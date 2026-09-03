import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Filter, 
  Code, 
  Eye, 
  FileCheck2, 
  Users, 
  AlertTriangle, 
  Mail, 
  Server,
  Calendar,
  Clock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLogMetadata, setSelectedLogMetadata] = useState<any | null>(null);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);

  const loadLogs = async (filter: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = filter
        ? `/admin/audit-logs?limit=50&action=${encodeURIComponent(filter)}`
        : '/admin/audit-logs?limit=50';
      const res = await fetchApi(url);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
      } else {
        throw new Error(json.error?.message || 'Denetim kayıtları alınamadı.');
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Denetim kayıtları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(actionFilter);
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('verification_approved')) {
      return (
        <Badge variant="success" size="sm" icon={<FileCheck2 className="w-3 h-3" />}>
          Doğrulama Onaylandı
        </Badge>
      );
    }
    if (action.includes('verification_rejected')) {
      return (
        <Badge variant="danger" size="sm" icon={<FileCheck2 className="w-3 h-3" />}>
          Doğrulama Reddedildi
        </Badge>
      );
    }
    if (action.includes('verification')) {
      return (
        <Badge variant="info" size="sm" icon={<FileCheck2 className="w-3 h-3" />}>
          Doğrulama İşlemi
        </Badge>
      );
    }
    if (action.includes('user_verify')) {
      return (
        <Badge variant="default" size="sm" icon={<Users className="w-3 h-3" />}>
          Mavi Tik Değişimi
        </Badge>
      );
    }
    if (action.includes('report')) {
      return (
        <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
          Moderasyon İşlemi
        </Badge>
      );
    }
    if (action.includes('smtp')) {
      return (
        <Badge variant="default" size="sm" icon={<Mail className="w-3 h-3" />}>
          SMTP Güncellemesi
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm" icon={<Server className="w-3 h-3" />}>
        {action}
      </Badge>
    );
  };

  const handleOpenMetadata = (log: any) => {
    setSelectedLogMetadata(log);
    setMetadataModalOpen(true);
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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-slate-900 dark:text-slate-100" />
            <span>Yönetici Denetim Kayıtları (Audit Logs)</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
            Yöneticiler tarafından gerçekleştirilen tüm onay, doğrulama, silme ve yapılandırma eylemlerinin güvenlik geçmişi.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={() => loadLogs(actionFilter)}
        >
          Yenile
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
        {[
          { id: '', label: 'Tüm Eylemler' },
          { id: 'verification', label: 'Doğrulamalar' },
          { id: 'user_verify', label: 'Mavi Tik' },
          { id: 'report', label: 'Moderasyon' },
          { id: 'smtp', label: 'SMTP & Sistem' },
        ].map((tab) => {
          const isActive = actionFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-950 text-slate-950 shadow-xs border border-slate-200 dark:border-slate-800/70'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Denetim Kayıtları Yüklenemedi"
          message={error}
          onRetry={() => loadLogs(actionFilter)}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <Card variant="default" padding="none" className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SkeletonCircle size="md" />
                <div className="space-y-1.5 w-48">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          ))}
        </Card>
      )}

      {/* Logs Table / List */}
      {!loading && !error && (
        <>
          {logs.length === 0 ? (
            <EmptyState
              icon={<History className="w-7 h-7" />}
              title="Denetim Kaydı Yok"
              description="Seçilen eylem türüne ait kayıtlı bir yönetici işlemi bulunamadı."
            />
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Yönetici</th>
                      <th className="py-3.5 px-4">Eylem Türü</th>
                      <th className="py-3.5 px-4">Hedef (Target)</th>
                      <th className="py-3.5 px-4">Tarih / Saat</th>
                      <th className="py-3.5 px-6 text-right">Detaylar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-900/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar url={log.adminAvatarUrl} size="sm" />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">
                                {log.adminDisplayName || log.adminUsername || `Admin #${log.adminUserId}`}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                                @{log.adminUsername || `user_${log.adminUserId}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {getActionBadge(log.action)}
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-xs font-semibold text-slate-700">
                            <span className="uppercase text-slate-400 font-bold mr-1.5">
                              {log.targetType}:
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md font-mono text-[11px]">
                              {log.targetId || '-'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString('tr-TR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenMetadata(log)}
                          >
                            İncele
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Timeline View */}
              <div className="md:hidden divide-y divide-slate-100">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar url={log.adminAvatarUrl} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {log.adminDisplayName || log.adminUsername || `Admin #${log.adminUserId}`}
                          </div>
                          <div className="text-xs text-slate-400">
                            @{log.adminUsername}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {log.targetType} #{log.targetId}
                      </span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenMetadata(log)}
                      >
                        Metadata Gör
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Metadata Viewer Modal */}
      <Modal
        isOpen={metadataModalOpen}
        onClose={() => setMetadataModalOpen(false)}
        title="Denetim Kaydı Detayları"
        description={`Eylem ID: #${selectedLogMetadata?.id} • Eylem: ${selectedLogMetadata?.action}`}
        footer={
          <Button
            variant="secondary"
            size="md"
            onClick={() => setMetadataModalOpen(false)}
          >
            Kapat
          </Button>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/70 space-y-0.5">
              <span className="font-bold text-slate-500 dark:text-slate-400">Yönetici</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                @{selectedLogMetadata?.adminUsername} (ID: {selectedLogMetadata?.adminUserId})
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/70 space-y-0.5">
              <span className="font-bold text-slate-500 dark:text-slate-400">Hedef Varlık</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                {selectedLogMetadata?.targetType} #{selectedLogMetadata?.targetId}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />
              <span>Ham Eylem Verisi (Metadata Payload)</span>
            </label>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
              {JSON.stringify(selectedLogMetadata?.metadata || {}, null, 2)}
            </pre>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
