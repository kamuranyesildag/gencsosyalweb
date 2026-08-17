import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { toast } from '../ui/Toast';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';
import { Link } from 'react-router';

type VerificationStatus = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';

export function AdminVerification() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const loadVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter === 'all' 
        ? '/admin/verifications?limit=50' 
        : `/admin/verifications?limit=50&status=${statusFilter}`;
      
      const res = await fetchApi(url);
      const json = await res.json();
      if (json.success) {
        setVerifications(json.data || []);
      } else {
        throw new Error(json.error?.message || 'Başvurular alınamadı.');
      }
    } catch (err: any) {
      console.error('Failed to load verifications:', err);
      setError(err.message || 'Doğrulama başvuruları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [statusFilter]);

  const updateVerification = async (id: number, status: string, reason?: string) => {
    setActionLoadingId(id);
    try {
      const data: any = { status };
      if (reason) data.rejectionReason = reason;

      const res = await fetchApi(`/admin/verifications/${id}`, {
        method: 'PATCH',
        data,
      });
      const json = await res.json();
      if (json.success) {
        setVerifications((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status, rejectionReason: reason || v.rejectionReason } : v))
        );
        toast.success(
          status === 'approved'
            ? 'Başvuru onaylandı ve kullanıcıya mavi tik verildi.'
            : status === 'rejected'
            ? 'Başvuru reddedildi.'
            : 'Başvuru inceleme durumuna alındı.'
        );
      } else {
        toast.error(json.error?.message || 'İşlem başarısız oldu.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Hata oluştu.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (v: any) => {
    setSelectedReqForReject(v);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedReqForReject) return;
    setRejectSubmitting(true);
    try {
      await updateVerification(selectedReqForReject.id, 'rejected', rejectionReason.trim() || undefined);
      setRejectModalOpen(false);
    } finally {
      setRejectSubmitting(false);
    }
  };

  const filterTabs: { id: VerificationStatus; label: string; count?: number }[] = [
    { id: 'all', label: 'Tüm Başvurular' },
    { id: 'pending', label: 'Bekleyenler' },
    { id: 'under_review', label: 'İncelenenler' },
    { id: 'approved', label: 'Onaylananlar' },
    { id: 'rejected', label: 'Reddedilenler' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm" icon={<XCircle className="w-3 h-3" />}>Reddedildi</Badge>;
      case 'under_review':
        return <Badge variant="info" size="sm" icon={<Clock className="w-3 h-3" />}>İnceleniyor</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>Beklemede</Badge>;
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
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            <span>Doğrulama (Mavi Tik) Başvuruları</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kullanıcıların kimlik doğrulama ve tanınmış kişi mavi tik rozet başvurularını inceleyin.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={loadVerifications}
        >
          Yenile
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
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
          title="Başvurular Yüklenemedi"
          message={error}
          onRetry={loadVerifications}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonCircle size="md" />
                  <div className="space-y-1.5 w-40">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <SkeletonText lines={2} />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Requests List */}
      {!loading && !error && (
        <>
          {verifications.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="w-7 h-7" />}
              title="Başvuru Bulunamadı"
              description={
                statusFilter === 'all'
                  ? 'Sistemde henüz kayıtlı bir doğrulama başvurusu bulunmuyor.'
                  : `Seçili filtreye (${filterTabs.find((t) => t.id === statusFilter)?.label}) ait başvuru yok.`
              }
            />
          ) : (
            <div className="space-y-4">
              {verifications.map((v) => {
                const isActioning = actionLoadingId === v.id;
                return (
                  <motion.div
                    key={v.id}
                    variants={slideUpVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card variant="default" padding="lg" className="space-y-4">
                      {/* Top Bar: User & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Avatar url={v.avatarUrl} size="lg" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/profile/${v.username}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base truncate"
                              >
                                {v.displayName || v.username}
                              </Link>
                              <Link
                                to={`/profile/${v.username}`}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Profili Aç"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                              @{v.username} • <span className="text-slate-400">{v.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-center">
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(v.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {getStatusBadge(v.status)}
                        </div>
                      </div>

                      {/* Reason Description Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Başvuru Gerekçesi / Tanıtım</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                          {v.reason}
                        </p>
                      </div>

                      {/* Rejection reason if any */}
                      {v.rejectionReason && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Reddedilme Sebebi:
                          </span>
                          <p>{v.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        {v.status === 'pending' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => updateVerification(v.id, 'under_review')}
                          >
                            İncelemeye Al
                          </Button>
                        )}

                        {(v.status === 'pending' || v.status === 'under_review') && (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              isLoading={isActioning}
                              onClick={() => handleOpenRejectModal(v)}
                            >
                              Reddet
                            </Button>

                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<CheckCircle2 className="w-4 h-4" />}
                              isLoading={isActioning}
                              onClick={() => updateVerification(v.id, 'approved')}
                            >
                              Onayla ve Mavi Tik Ver
                            </Button>
                          </>
                        )}

                        {v.status === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => updateVerification(v.id, 'approved')}
                          >
                            Yeniden Değerlendir & Onayla
                          </Button>
                        )}

                        {v.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => updateVerification(v.id, 'rejected')}
                          >
                            Doğrulamayı İptal Et
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Reject Modal with Design System Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Başvuruyu Reddet"
        description={`@${selectedReqForReject?.username} kullanıcısının doğrulama başvurusunu reddetmek üzeresiniz.`}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setRejectModalOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={rejectSubmitting}
              onClick={handleConfirmReject}
            >
              Reddet
            </Button>
          </div>
        }
      >
        <div className="space-y-3 pt-2">
          <Textarea
            label="Red Gerekçesi (Opsiyonel)"
            placeholder="Kullanıcıya iletilecek açıklama mesajını yazın (ör: 'Yetersiz sosyal medya referansı', 'Profil eksiklikleri')..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </motion.div>
  );
}
