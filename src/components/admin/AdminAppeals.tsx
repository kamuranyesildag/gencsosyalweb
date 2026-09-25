import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  User, 
  AlertCircle, 
  Calendar, 
  Send, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { toast } from '../ui/Toast';

interface AppealUser {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  banExpiresAt?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface AppealItem {
  id: number;
  userId: number;
  banReason: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminResponse?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: AppealUser;
}

export function AdminAppeals() {
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminResponseNote, setAdminResponseNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/admin/appeals?status=${statusFilter}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAppeals(json.data);
      } else {
        toast.error('İtirazlar alınamadı.');
      }
    } catch {
      toast.error('İtiraz verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleOpenActionModal = (appeal: AppealItem, action: 'APPROVE' | 'REJECT') => {
    setSelectedAppeal(appeal);
    setActionType(action);
    setAdminResponseNote(
      action === 'APPROVE'
        ? 'İtirazınız haklı bulunmuş ve hesap kısıtlamanız kaldırılmıştır.'
        : 'İtirazınız incelenmiş ancak tespit edilen kural ihlali nedeniyle kısıtlamanın devamına karar verilmiştir.'
    );
    setModalOpen(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppeal) return;

    setSubmittingAction(true);
    try {
      const res = await fetchApi(`/admin/appeals/${selectedAppeal.id}`, {
        method: 'PATCH',
        data: {
          action: actionType,
          adminResponse: adminResponseNote.trim(),
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          actionType === 'APPROVE'
            ? `@${selectedAppeal.user.username} kullanıcısının itirazı onaylandı ve yasağı kaldırıldı.`
            : `@${selectedAppeal.user.username} kullanıcısının itirazı reddedildi.`
        );
        setModalOpen(false);
        fetchAppeals();
      } else {
        toast.error(json.error?.message || 'İşlem gerçekleştirilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası oluştu.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredAppeals = appeals.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.user.username.toLowerCase().includes(q) ||
      (a.user.displayName && a.user.displayName.toLowerCase().includes(q)) ||
      a.user.email.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Hesap İtirazları</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Kısıtlanan veya askıya alınan hesapların yönetime sunduğu itiraz taleplerini inceleyin.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAppeals}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Yenile
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'PENDING', label: 'Bekleyenler' },
              { id: 'APPROVED', label: 'Onaylananlar' },
              { id: 'REJECTED', label: 'Reddedilenler' },
              { id: 'ALL', label: 'Tümü' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kullanıcı veya gerekçe ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Appeals List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          İtirazlar yükleniyor...
        </div>
      ) : filteredAppeals.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] text-center max-w-md mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">İtiraz Bulunamadı</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {statusFilter === 'PENDING'
              ? 'Şu anda incelenmeyi bekleyen aktif bir hesap itirazı bulunmuyor.'
              : 'Seçili filtreye uygun itiraz kaydı mevcut değil.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((appeal) => {
            const isTemporary = appeal.user.banExpiresAt;
            const expiryDate = isTemporary
              ? new Date(appeal.user.banExpiresAt!).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={appeal.id}
                className="bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Header row: User info & Status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      url={appeal.user.avatarUrl}
                      name={appeal.user.displayName || appeal.user.username}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {appeal.user.displayName || appeal.user.username}
                        </span>
                        <span className="text-xs text-slate-400">@{appeal.user.username}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {appeal.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {appeal.status === 'PENDING' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> İnceleniyor
                      </span>
                    )}
                    {appeal.status === 'APPROVED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı (Kaldırıldı)
                      </span>
                    )}
                    {appeal.status === 'REJECTED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Reddedildi
                      </span>
                    )}
                  </div>
                </div>

                {/* Suspension metadata context */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">
                      Uygulanan Yasak Gerekçesi
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {appeal.banReason || appeal.user.banReason || 'Belirtilmedi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Yasak Süresi</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isTemporary ? `Geçici (Bitiş: ${expiryDate})` : 'Kalıcı Yasak'}
                    </span>
                  </div>
                </div>

                {/* User's Appeal Explanation */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>Kullanıcının İtiraz Açıklaması</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      (
                      {new Date(appeal.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      )
                    </span>
                  </div>
                  <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {appeal.reason}
                  </div>
                </div>

                {/* Admin response note if already reviewed */}
                {appeal.adminResponse && (
                  <div className="p-3 bg-slate-100/70 dark:bg-slate-900/80 rounded-2xl text-xs space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">
                      Yönetici Açıklaması / Yanıtı
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{appeal.adminResponse}"
                    </p>
                  </div>
                )}

                {/* Action Buttons for Pending Appeals */}
                {appeal.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      onClick={() => handleOpenActionModal(appeal, 'REJECT')}
                    >
                      İtirazı Reddet
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleOpenActionModal(appeal, 'APPROVE')}
                    >
                      Kabul Et & Yasağı Kaldır
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RESOLVE / REJECT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {actionType === 'APPROVE' ? (
              <span className="text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                İtirazı Kabul Et & Hesabı Aç
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                İtirazı Reddet
              </span>
            )}
          </div>
        }
        description={
          actionType === 'APPROVE'
            ? 'Bu işlem kullanıcının yasağını derhal kaldırır ve hesabını aktif hale getirir.'
            : 'Bu işlem kullanıcının itirazını reddeder ve kısıtlamayı sürdürür.'
        }
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={submittingAction}
            >
              Vazgeç
            </Button>
            <Button
              variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
              size="md"
              isLoading={submittingAction}
              onClick={handleActionSubmit}
            >
              {actionType === 'APPROVE' ? 'Onayla ve Yasağı Kaldır' : 'İtirazı Reddet'}
            </Button>
          </div>
        }
      >
        {selectedAppeal && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-3">
              <Avatar
                url={selectedAppeal.user.avatarUrl}
                name={selectedAppeal.user.displayName || selectedAppeal.user.username}
                size="md"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedAppeal.user.displayName || selectedAppeal.user.username}
                </p>
                <p className="text-xs text-slate-500">@{selectedAppeal.user.username}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kullanıcıya Gönderilecek Yanıt Notu
              </label>
              <Textarea
                rows={3}
                value={adminResponseNote}
                onChange={(e) => setAdminResponseNote(e.target.value)}
                placeholder="Kullanıcının hesabında veya e-postasında göreceği açıklama..."
                className="w-full text-xs sm:text-sm"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
