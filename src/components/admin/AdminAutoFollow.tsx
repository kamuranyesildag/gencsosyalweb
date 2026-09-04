import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Info, 
  Users, 
  Sparkles,
  ExternalLink
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

export function AdminAutoFollow() {
  const [autoFollowUsers, setAutoFollowUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/admin/auto-follow');
      const json = await res.json();
      if (json.success) {
        setAutoFollowUsers(json.data || []);
      } else {
        throw new Error(json.error?.message || 'Otomatik takip listesi alınamadı.');
      }
    } catch (err: any) {
      console.error('Failed to load auto-follow accounts:', err);
      setError(err.message || 'Otomatik takip listesi yüklenirken bir hata oluştu.');
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

  const addAccount = async (targetUser: any) => {
    setActionId(targetUser.id);
    try {
      const currentIds = autoFollowUsers.map((u) => u.id);
      if (currentIds.includes(targetUser.id)) {
        toast.info('Bu hesap zaten otomatik takip listesinde.');
        return;
      }

      const newIds = [...currentIds, targetUser.id];
      const res = await fetchApi('/admin/auto-follow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: newIds }),
      });

      if (res.ok) {
        setAutoFollowUsers((prev) => [...prev, targetUser]);
        setSearchedUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        toast.success(`@${targetUser.username} otomatik takip listesine eklendi.`);
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || 'Eklenemedi.');
      }
    } catch (err) {
      toast.error('İşlem başarısız oldu.');
    } finally {
      setActionId(null);
    }
  };

  const removeAccount = async (userId: number, username: string) => {
    const confirmed = await confirmDialog(
      'Otomatik Takibi Kaldır',
      `@${username} hesabını yeni kayıt olan kullanıcıların otomatik takip listesinden çıkarmak istiyor musunuz?`
    );
    if (!confirmed) return;

    setActionId(userId);
    try {
      const newIds = autoFollowUsers.filter((u) => u.id !== userId).map((u) => u.id);
      const res = await fetchApi('/admin/auto-follow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: newIds }),
      });

      if (res.ok) {
        setAutoFollowUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success(`@${username} otomatik takip listesinden çıkarıldı.`);
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || 'Kaldırılamadı.');
      }
    } catch (err) {
      toast.error('İşlem başarısız oldu.');
    } finally {
      setActionId(null);
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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-slate-900 dark:text-slate-100" />
            <span>Otomatik Takip (Auto-Follow)</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
            Platforma yeni kayıt olan kullanıcıların otomatik olarak takip edeceği resmi ve vitrin hesapları yönetin.
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

      {/* Explanatory Info Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed">
        <Info className="w-5 h-5 text-slate-900 dark:text-slate-100 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Nasıl Çalışır?</span> Bu listede yer alan hesaplar, platforma yeni kaydolan her kullanıcı için kayıt anında otomatik takip kuyruğuna alınır. Böylece yeni üyeler boş bir akış yerine Genç Sosyal resmi duyuruları ve kaliteli vitrin içerikleriyle karşılaşır.
        </div>
      </div>

      {/* Add to Auto-Follow Card */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Otomatik Takibe Hesap Ekle</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kullanıcı adı veya e-posta ile arama yapıp listeye dahil edin.</p>
          </div>
          <Badge variant="default" size="sm">Oto-Takip Kuyruğu</Badge>
        </div>

        <form onSubmit={handleSearchUsers} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Hesap ara (Örn: admin, gencsosyal, isim)..."
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
            Ara
          </Button>
        </form>

        {/* Search Results */}
        {searchedUsers.length > 0 && (
          <div className="mt-3 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2 bg-slate-50 dark:bg-slate-900/70 divide-y divide-slate-100 space-y-1">
            <div className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Arama Sonuçları ({searchedUsers.length})
            </div>
            {searchedUsers.map((u) => {
              const isAlreadyAdded = autoFollowUsers.some((a) => a.id === u.id);
              return (
                <div key={u.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar url={u.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate flex items-center gap-1.5">
                        <span>{u.displayName || u.username}</span>
                        {isAlreadyAdded && <Badge variant="success" size="sm">Listede</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{u.username} • {u.email}</div>
                    </div>
                  </div>

                  <Button
                    variant={isAlreadyAdded ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isAlreadyAdded || actionId === u.id}
                    isLoading={actionId === u.id}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => addAccount(u)}
                  >
                    {isAlreadyAdded ? 'Zaten Ekli' : 'Listeye Ekle'}
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
          title="Liste Yüklenemedi"
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
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </Card>
      )}

      {/* Active Auto Follow Accounts */}
      {!loading && !error && (
        <>
          {autoFollowUsers.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="w-7 h-7" />}
              title="Otomatik Takip Hesabı Tanımlanmamış"
              description="Platforma yeni kaydolan kullanıcılar için henüz otomatik takip hesabı belirlenmedi. Yukarıdaki arama kutusundan resmi hesapları ekleyebilirsiniz."
            />
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Otomatik Takip Listesindeki Hesaplar ({autoFollowUsers.length})</span>
                <span>İşlem</span>
              </div>

              <div className="divide-y divide-slate-100">
                {autoFollowUsers.map((u) => {
                  const isBusy = actionId === u.id;
                  return (
                    <div
                      key={u.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar url={u.avatarUrl} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/profile/${u.username}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-slate-900 dark:text-slate-100 transition-colors text-sm sm:text-base truncate"
                            >
                              {u.displayName || u.username}
                            </Link>
                            <Badge variant="success" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                              Yeni Üyelere Oto
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            @{u.username} • <span className="text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/profile/${u.username}`}
                          className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-900 dark:text-slate-100 rounded-xl hover:bg-slate-100 dark:bg-slate-900 transition-colors"
                          title="Profili Gör"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isBusy}
                          isLoading={isBusy}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => removeAccount(u.id, u.username)}
                        >
                          Listeden Çıkar
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
