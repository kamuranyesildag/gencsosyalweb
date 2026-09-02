import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Search, 
  CheckCircle2, 
  Bell, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Trash2, 
  RefreshCw,
  Sliders,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { toast } from '../ui/Toast';
import { confirmDialog } from '../ui/ConfirmDialog';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';
import { Link } from 'react-router';

export function AdminOfficialAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [autoFollowIds, setAutoFollowIds] = useState<number[]>([]);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accRes, afRes] = await Promise.all([
        fetchApi('/admin/official-accounts'),
        fetchApi('/admin/auto-follow'),
      ]);
      const accJson = await accRes.json();
      const afJson = await afRes.json();

      if (accJson.success) setAccounts(accJson.data || []);
      if (afJson.success && Array.isArray(afJson.data)) {
        setAutoFollowIds(afJson.data.map((u: any) => u.id));
      }
    } catch (err: any) {
      console.error('Failed to load official accounts:', err);
      setError(err.message || 'Resmi hesaplar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetchApi(`/admin/users?q=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setSearchedUsers(json.data || []);
      }
    } catch (err: any) {
      toast.error('Kullanıcı aranamadı.');
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleOfficial = async (targetUser: any, makeOfficial: boolean) => {
    setActionId(targetUser.id);
    try {
      const res = await fetchApi(`/admin/official-accounts/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOfficialAccount: makeOfficial,
          officialNotifyEnabled: makeOfficial,
          officialPriority: 'normal',
        }),
      });

      if (res.ok) {
        if (makeOfficial) {
          setAccounts((prev) => [
            {
              ...targetUser,
              isOfficialAccount: true,
              officialNotifyEnabled: true,
              officialPriority: 'normal',
            },
            ...prev.filter((a) => a.id !== targetUser.id),
          ]);
          setSearchedUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, isOfficialAccount: true } : u))
          );
          toast.success(`@${targetUser.username} resmi hesap olarak tanımlandı.`);
        } else {
          setAccounts((prev) => prev.filter((a) => a.id !== targetUser.id));
          setSearchedUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, isOfficialAccount: false } : u))
          );
          toast.success(`@${targetUser.username} resmi hesap listesinden kaldırıldı.`);
        }
      } else {
        toast.error('İşlem başarısız oldu.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Hata oluştu.');
    } finally {
      setActionId(null);
    }
  };

  const updateAccountSettings = async (
    targetId: number,
    notifyEnabled: boolean,
    priority: string
  ) => {
    setActionId(targetId);
    try {
      const res = await fetchApi(`/admin/official-accounts/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOfficialAccount: true,
          officialNotifyEnabled: notifyEnabled,
          officialPriority: priority,
        }),
      });
      if (res.ok) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === targetId
              ? { ...a, officialNotifyEnabled: notifyEnabled, officialPriority: priority }
              : a
          )
        );
        toast.success('Resmi hesap tercihleri güncellendi.');
      }
    } catch (err: any) {
      toast.error('Güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const toggleAutoFollow = async (userId: number) => {
    const isCurrentlyAuto = autoFollowIds.includes(userId);
    const newIds = isCurrentlyAuto
      ? autoFollowIds.filter((id) => id !== userId)
      : [...autoFollowIds, userId];

    setAutoFollowIds(newIds);
    try {
      const res = await fetchApi('/admin/auto-follow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: newIds }),
      });
      if (res.ok) {
        toast.success(
          isCurrentlyAuto
            ? 'Hesap otomatik takip listesinden çıkarıldı.'
            : 'Hesap otomatik takip listesine eklendi.'
        );
      } else {
        loadData(); // Revert
      }
    } catch (err) {
      loadData();
      toast.error('Otomatik takip güncellenemedi.');
    }
  };

  const confirmRemoveOfficial = async (acc: any) => {
    const confirmed = await confirmDialog(
      'Resmi Hesabı Kaldır',
      `@${acc.username} kullanıcısının resmi hesap statüsünü kaldırmak istediğinizden emin misiniz?`
    );
    if (confirmed) {
      toggleOfficial(acc, false);
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
            <Megaphone className="w-6 h-6 text-slate-900" />
            <span>Resmi Hesap Yönetimi</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Genç Sosyal kurumsal ve duyuru hesaplarını yapılandırın, bildirim ve otomatik takip önceliklerini yönetin.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={loadData}
        >
          Yenile
        </Button>
      </div>

      {/* Add New Official Account Card */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Yeni Resmi Hesap Tanımla</h3>
            <p className="text-xs text-slate-500 font-medium">Sistemdeki bir kullanıcıyı resmi duyuru hesabı olarak işaretleyin.</p>
          </div>
          <Badge variant="info" size="sm">Kurumsal Rozet</Badge>
        </div>

        <form onSubmit={handleSearchUsers} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Resmi yapılacak kullanıcıyı ara (Kullanıcı adı veya E-posta)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              clearable
              onClear={() => {
                setSearch('');
                setSearchedUsers([]);
              }}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={searchLoading}
          >
            Bul
          </Button>
        </form>

        {/* Searched Users Results Dropdown / Box */}
        {searchedUsers.length > 0 && (
          <div className="mt-3 border border-slate-200/80 rounded-2xl p-2 bg-slate-50/70 divide-y divide-slate-100 space-y-1">
            <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Arama Sonuçları ({searchedUsers.length})
            </div>
            {searchedUsers.map((u) => {
              const isOfficial = accounts.some((a) => a.id === u.id) || u.isOfficialAccount;
              return (
                <div key={u.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar url={u.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        <span>{u.displayName || u.username}</span>
                        {isOfficial && <Badge variant="info" size="sm">Zaten Resmi</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">@{u.username} • {u.email}</div>
                    </div>
                  </div>

                  <Button
                    variant={isOfficial ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isOfficial || actionId === u.id}
                    isLoading={actionId === u.id}
                    onClick={() => toggleOfficial(u, true)}
                  >
                    {isOfficial ? 'Resmi Hesap' : 'Resmi Yap'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Resmi Hesaplar Yüklenemedi"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <Card variant="default" padding="none" className="divide-y divide-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SkeletonCircle size="lg" />
                <div className="space-y-2 w-48">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          ))}
        </Card>
      )}

      {/* Official Accounts List */}
      {!loading && !error && (
        <>
          {accounts.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-7 h-7" />}
              title="Kayıtlı Resmi Hesap Yok"
              description="Platformda henüz resmi kurumsal hesap tanımlanmadı. Yukarıdaki arama kutusundan bir hesabı resmi yapabilirsiniz."
            />
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Aktif Resmi Hesaplar ({accounts.length})</span>
                <span>Öncelik & Otomasyon</span>
              </div>

              <div className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const isAuto = autoFollowIds.includes(acc.id);
                  const isBusy = actionId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar url={acc.avatarUrl} size="lg" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/profile/${acc.username}`}
                              className="font-bold text-slate-900 hover:text-slate-900 transition-colors text-base truncate"
                            >
                              {acc.displayName || acc.username}
                            </Link>
                            <Badge variant="info" size="sm" icon={<Megaphone className="w-3 h-3" />}>
                              Resmi
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            @{acc.username} • <span className="text-slate-400">{acc.email}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant={acc.officialNotifyEnabled ? 'success' : 'secondary'}
                              size="sm"
                              icon={<Bell className="w-3 h-3" />}
                            >
                              {acc.officialNotifyEnabled ? 'Bildirim Açık' : 'Bildirim Kapalı'}
                            </Badge>

                            <Badge
                              variant={
                                acc.officialPriority === 'high'
                                  ? 'warning'
                                  : acc.officialPriority === 'low'
                                  ? 'secondary'
                                  : 'default'
                              }
                              size="sm"
                              icon={<Sliders className="w-3 h-3" />}
                            >
                              Öncelik: {acc.officialPriority || 'Normal'}
                            </Badge>

                            {isAuto && (
                              <Badge variant="success" size="sm" icon={<UserCheck className="w-3 h-3" />}>
                                Yeni Üyelere Oto-Takip
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <Button
                          variant={isAuto ? 'primary' : 'outline'}
                          size="sm"
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                          onClick={() => toggleAutoFollow(acc.id)}
                        >
                          {isAuto ? 'Oto-Takip Aktif' : 'Oto-Takibe Ekle'}
                        </Button>

                        <Button
                          variant={acc.officialNotifyEnabled ? 'outline' : 'secondary'}
                          size="sm"
                          leftIcon={<Bell className="w-3.5 h-3.5" />}
                          disabled={isBusy}
                          onClick={() =>
                            updateAccountSettings(
                              acc.id,
                              !acc.officialNotifyEnabled,
                              acc.officialPriority || 'normal'
                            )
                          }
                        >
                          {acc.officialNotifyEnabled ? 'Bildirimi Kapat' : 'Bildirimi Aç'}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          disabled={isBusy}
                          onClick={() => confirmRemoveOfficial(acc)}
                        >
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
