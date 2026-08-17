import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  ExternalLink, 
  Mail, 
  Calendar,
  Filter,
  Check,
  X,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Select } from '../ui/Select';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { toast } from '../ui/Toast';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';
import { Link } from 'react-router';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (searchTerm: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/admin/users?q=${encodeURIComponent(searchTerm)}&limit=50`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      } else {
        throw new Error(json.error?.message || 'Kullanıcılar alınamadı.');
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(search);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const toggleVerification = async (userId: number, currentStatus: boolean) => {
    setActionLoadingId(userId);
    try {
      const res = await fetchApi(`/admin/users/${userId}/verify`, {
        method: 'PATCH',
        data: { isVerified: !currentStatus },
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: !currentStatus } : u))
        );
        toast.success(
          !currentStatus ? 'Kullanıcıya mavi tik rozeti verildi.' : 'Kullanıcının mavi tik rozeti kaldırıldı.'
        );
      } else {
        toast.error(json.error?.message || 'İşlem gerçekleştirilemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter users based on local role/verified filter
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (verifiedFilter === 'VERIFIED' && !u.isVerified) return false;
    if (verifiedFilter === 'UNVERIFIED' && u.isVerified) return false;
    return true;
  });

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Kullanıcı Yönetimi</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kayıtlı tüm kullanıcıları listeleyin, arayın ve mavi tik doğrulama durumlarını düzenleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => loadUsers(search)}
          >
            Yenile
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card variant="default" padding="md" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Kullanıcı adı, e-posta veya isim ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                clearable
                onClear={() => {
                  setSearch('');
                  loadUsers('');
                }}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
            >
              Ara
            </Button>
          </form>

          <div className="md:col-span-3">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tüm Roller' },
                { value: 'ADMIN', label: 'Yöneticiler (ADMIN)' },
                { value: 'USER', label: 'Standart Kullanıcılar' },
              ]}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tüm Doğrulamalar' },
                { value: 'VERIFIED', label: 'Yalnızca Mavi Tikliler' },
                { value: 'UNVERIFIED', label: 'Mavi Tiksizler' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <span>Toplam {filteredUsers.length} kullanıcı gösteriliyor</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              {users.filter((u) => u.isVerified).length} Doğrulanmış
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              {users.filter((u) => u.role === 'ADMIN').length} Admin
            </span>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Kullanıcılar Yüklenemedi"
          message={error}
          onRetry={() => loadUsers(search)}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <Card variant="default" padding="none" className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SkeletonCircle size="md" />
                <div className="space-y-1.5 w-48">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          ))}
        </Card>
      )}

      {/* User List / Table */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-7 h-7" />}
              title="Kullanıcı Bulunamadı"
              description={
                search
                  ? `"${search}" kriterine uygun kullanıcı kaydı bulunamadı.`
                  : 'Sistemde henüz bu filtreye uygun kullanıcı kaydı yok.'
              }
              action={
                search
                  ? {
                      label: 'Aramayı Temizle',
                      onClick: () => {
                        setSearch('');
                        setRoleFilter('ALL');
                        setVerifiedFilter('ALL');
                        loadUsers('');
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Kullanıcı</th>
                      <th className="py-3.5 px-4">Rol</th>
                      <th className="py-3.5 px-4">Doğrulama</th>
                      <th className="py-3.5 px-4">Kayıt Tarihi</th>
                      <th className="py-3.5 px-6 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isActioning = actionLoadingId === u.id;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <Avatar url={u.avatarUrl} size="md" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    to={`/profile/${u.username}`}
                                    className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                                  >
                                    {u.displayName || u.username}
                                  </Link>
                                  {u.isVerified && (
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-600/10 shrink-0" />
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-2 mt-0.5">
                                  <span>@{u.username}</span>
                                  <span>•</span>
                                  <span className="text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {u.role === 'ADMIN' ? (
                              <Badge variant="danger" size="sm">
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                Üye
                              </Badge>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {u.isVerified ? (
                              <Badge variant="success" size="sm" dot>
                                Mavi Tik Aktif
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                Standart
                              </Badge>
                            )}
                          </td>

                          <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/profile/${u.username}`}
                                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
                                title="Profili Görüntüle"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <Button
                                variant={u.isVerified ? 'danger' : 'primary'}
                                size="sm"
                                isLoading={isActioning}
                                onClick={() => toggleVerification(u.id, u.isVerified)}
                              >
                                {u.isVerified ? 'Mavi Tiki Kaldır' : 'Mavi Tik Ver'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isActioning = actionLoadingId === u.id;
                  return (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar url={u.avatarUrl} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/profile/${u.username}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 truncate text-sm"
                              >
                                {u.displayName || u.username}
                              </Link>
                              {u.isVerified && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 truncate">@{u.username}</div>
                            <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {u.role === 'ADMIN' && (
                            <Badge variant="danger" size="sm">
                              Admin
                            </Badge>
                          )}
                          {u.isVerified ? (
                            <Badge variant="success" size="sm">
                              Onaylı
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">
                              Standart
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <Link
                          to={`/profile/${u.username}`}
                          className="text-xs font-semibold text-indigo-600 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Profili Gör
                        </Link>

                        <Button
                          variant={u.isVerified ? 'danger' : 'primary'}
                          size="sm"
                          isLoading={isActioning}
                          onClick={() => toggleVerification(u.id, u.isVerified)}
                        >
                          {u.isVerified ? 'Mavi Tiki Kaldır' : 'Mavi Tik Ver'}
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
