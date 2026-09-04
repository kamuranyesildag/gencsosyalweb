import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  User, 
  ExternalLink, 
  Mail, 
  Calendar,
  Filter,
  Check,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
  Ban,
  KeyRound,
  Shield,
  Trash2,
  Megaphone,
  Lock,
  Copy,
  MoreVertical,
  AlertTriangle,
  Send,
  SlidersHorizontal,
  Eraser
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // 'ALL' | 'ACTIVE' | 'BANNED'
  const [verifiedFilter, setVerifiedFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected User for Modals
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Modals visibility
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('Spam veya Sahte Hesap');
  const [banCustomNote, setBanCustomNote] = useState('');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'USER' | 'MODERATOR' | 'ADMIN'>('USER');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [purgeSubmitting, setPurgeSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  // Active action menu row id
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const loadUsers = async (searchTerm: string = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `/admin/users?q=${encodeURIComponent(searchTerm)}&limit=100`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      const res = await fetchApi(url);
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
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  // 1. Toggle Verification (Mavi Tik)
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
      setOpenMenuId(null);
    }
  };

  // 2. Open Ban Modal
  const openBanModal = (user: any) => {
    setSelectedUser(user);
    setBanReason('Spam veya Sahte Hesap');
    setBanCustomNote('');
    setBanModalOpen(true);
    setOpenMenuId(null);
  };

  // 2. Submit Ban
  const handleBanSubmit = async () => {
    if (!selectedUser) return;
    setBanSubmitting(true);
    try {
      const fullReason = banCustomNote.trim() 
        ? `${banReason}: ${banCustomNote.trim()}` 
        : banReason;

      const res = await fetchApi(`/admin/users/${selectedUser.id}/ban`, {
        method: 'PATCH',
        data: { isActive: false, reason: fullReason },
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, isActive: false } : u))
        );
        toast.success(`@${selectedUser.username} başarıyla yasaklandı ve oturumları sonlandırıldı.`);
        setBanModalOpen(false);
      } else {
        toast.error(json.error?.message || 'Yasaklama işlemi başarısız oldu.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setBanSubmitting(false);
    }
  };

  // 3. Unban User
  const handleUnban = async (user: any) => {
    setActionLoadingId(user.id);
    try {
      const res = await fetchApi(`/admin/users/${user.id}/ban`, {
        method: 'PATCH',
        data: { isActive: true },
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: true } : u))
        );
        toast.success(`@${user.username} kullanıcısının yasağı kaldırıldı.`);
      } else {
        toast.error(json.error?.message || 'Yasak kaldırılamadı.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setActionLoadingId(null);
      setOpenMenuId(null);
    }
  };

  // 4. Open Role Modal
  const openRoleModal = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role || 'USER');
    setRoleModalOpen(true);
    setOpenMenuId(null);
  };

  // 4. Submit Role Change
  const handleRoleSubmit = async () => {
    if (!selectedUser) return;
    setRoleSubmitting(true);
    try {
      const res = await fetchApi(`/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        data: { role: selectedRole },
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, role: selectedRole } : u))
        );
        toast.success(`@${selectedUser.username} kullanıcısının rolü '${selectedRole}' yapıldı.`);
        setRoleModalOpen(false);
      } else {
        toast.error(json.error?.message || 'Rol güncellenemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  // 5. Open Password Reset Modal
  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordModalOpen(true);
    setOpenMenuId(null);
  };

  // Generate strong random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  // 5. Submit Password Reset
  const handlePasswordSubmit = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 8) {
      toast.error('Parola en az 8 karakter olmalıdır.');
      return;
    }
    setPasswordSubmitting(true);
    try {
      const res = await fetchApi(`/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        data: { newPassword },
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${selectedUser.username} için yeni parola tanımlandı.`);
        setPasswordModalOpen(false);
      } else {
        toast.error(json.error?.message || 'Parola sıfırlanamadı.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // 6. Reset 2FA
  const handleReset2FA = async (user: any) => {
    if (!window.confirm(`@${user.username} kullanıcısının İki Adımlı Doğrulama (2FA) korumasını sıfırlamak istediğinize emin misiniz?`)) {
      return;
    }
    setActionLoadingId(user.id);
    try {
      const res = await fetchApi(`/admin/users/${user.id}/reset-2fa`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, twoFactorEnabled: false } : u))
        );
        toast.success(`@${user.username} 2FA koruması sıfırlandı.`);
      } else {
        toast.error(json.error?.message || '2FA sıfırlanamadı.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setActionLoadingId(null);
      setOpenMenuId(null);
    }
  };

  // 7. Purge Content (Delete all posts/comments)
  const openPurgeModal = (user: any) => {
    setSelectedUser(user);
    setPurgeModalOpen(true);
    setOpenMenuId(null);
  };

  const handlePurgeSubmit = async () => {
    if (!selectedUser) return;
    setPurgeSubmitting(true);
    try {
      const res = await fetchApi(`/admin/users/${selectedUser.id}/purge-content`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${selectedUser.username} kullanıcısının tüm gönderi ve yorumları silindi.`);
        setPurgeModalOpen(false);
      } else {
        toast.error(json.error?.message || 'İçerikler silinemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setPurgeSubmitting(false);
    }
  };

  // 8. Delete User Permanently
  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetchApi(`/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        toast.success(`@${selectedUser.username} hesabı kalıcı olarak silindi.`);
        setDeleteModalOpen(false);
      } else {
        toast.error(json.error?.message || 'Kullanıcı silinemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // 9. Broadcast Announcement
  const handleBroadcastSubmit = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Duyuru mesajı boş bırakılamaz.');
      return;
    }
    setBroadcastSubmitting(true);
    try {
      const res = await fetchApi('/admin/broadcast', {
        method: 'POST',
        data: {
          title: broadcastTitle.trim() || 'Genç Sosyal Duyurusu',
          message: broadcastMessage.trim(),
        },
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || 'Duyuru tüm kullanıcılara iletildi.');
        setBroadcastModalOpen(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
      } else {
        toast.error(json.error?.message || 'Duyuru gönderilemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  // Local filter for quick UI responsiveness
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (verifiedFilter === 'VERIFIED' && !u.isVerified) return false;
    if (verifiedFilter === 'UNVERIFIED' && u.isVerified) return false;
    if (statusFilter === 'ACTIVE' && u.isActive === false) return false;
    if (statusFilter === 'BANNED' && u.isActive !== false) return false;
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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-slate-900 dark:text-slate-100" />
            <span>Kullanıcı Yönetimi & Yetkilendirme</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
            Kullanıcıları yasaklayın, yasağı kaldırın, rol ve yetkileri düzenleyin, şifre veya 2FA sıfırlayın.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Megaphone className="w-3.5 h-3.5 text-primary-600" />}
            onClick={() => setBroadcastModalOpen(true)}
            className="border-primary-200 hover:bg-primary-50 text-primary-700 font-semibold"
          >
            Sistem Duyurusu Gönder
          </Button>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <form onSubmit={handleSearchSubmit} className="lg:col-span-4 flex gap-2">
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

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tüm Hesap Durumları' },
                { value: 'ACTIVE', label: '🟢 Yalnızca Aktifler' },
                { value: 'BANNED', label: '🔴 Yasaklı / Askıda Olanlar' },
              ]}
            />
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-3">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tüm Roller' },
                { value: 'ADMIN', label: '🛡️ Yöneticiler (ADMIN)' },
                { value: 'MODERATOR', label: '⚖️ Moderatörler (MOD)' },
                { value: 'USER', label: '👤 Standart Kullanıcılar' },
              ]}
            />
          </div>

          {/* Verified Filter */}
          <div className="lg:col-span-2">
            <Select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tüm Rozetler' },
                { value: 'VERIFIED', label: 'Mavi Tikli' },
                { value: 'UNVERIFIED', label: 'Standart' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium gap-3">
          <span>Toplam <strong>{filteredUsers.length}</strong> kullanıcı listeleniyor</span>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {users.filter((u) => u.isActive !== false).length} Aktif
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <Ban className="w-3.5 h-3.5" />
              {users.filter((u) => u.isActive === false).length} Yasaklı
            </span>
            <span className="flex items-center gap-1 text-primary-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {users.filter((u) => u.isVerified).length} Mavi Tik
            </span>
            <span className="flex items-center gap-1 text-purple-600">
              <Shield className="w-3.5 h-3.5" />
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
                search || statusFilter !== 'ALL' || roleFilter !== 'ALL' || verifiedFilter !== 'ALL'
                  ? {
                      label: 'Filtreleri Temizle',
                      onClick: () => {
                        setSearch('');
                        setStatusFilter('ALL');
                        setRoleFilter('ALL');
                        setVerifiedFilter('ALL');
                        loadUsers('');
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden shadow-xs">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Kullanıcı</th>
                      <th className="py-3.5 px-4">Durum</th>
                      <th className="py-3.5 px-4">Rol</th>
                      <th className="py-3.5 px-4">Doğrulama</th>
                      <th className="py-3.5 px-4">Kayıt Tarihi</th>
                      <th className="py-3.5 px-6 text-right">Yönetim İşlemleri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((u) => {
                      const isActioning = actionLoadingId === u.id;
                      const isBanned = u.isActive === false;

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                            isBanned ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <Avatar url={u.avatarUrl} size="md" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    to={`/profile/${u.username}`}
                                    className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors truncate"
                                  >
                                    {u.displayName || u.username}
                                  </Link>
                                  {u.isVerified && (
                                    <CheckCircle2 className="w-4 h-4 text-primary-600 fill-primary-600/10 shrink-0" />
                                  )}
                                  {u.isOfficialAccount && (
                                    <Badge variant="info" size="sm">Resmi</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-2 mt-0.5">
                                  <span>@{u.username}</span>
                                  <span>•</span>
                                  <span className="text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Durum */}
                          <td className="py-4 px-4">
                            {isBanned ? (
                              <Badge variant="danger" size="sm" dot>
                                Yasaklı / Askıda
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm" dot>
                                Aktif
                              </Badge>
                            )}
                          </td>

                          {/* Rol */}
                          <td className="py-4 px-4">
                            {u.role === 'ADMIN' ? (
                              <Badge variant="danger" size="sm">
                                🛡️ Admin
                              </Badge>
                            ) : u.role === 'MODERATOR' ? (
                              <Badge variant="warning" size="sm">
                                ⚖️ Moderatör
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                👤 Üye
                              </Badge>
                            )}
                          </td>

                          {/* Doğrulama */}
                          <td className="py-4 px-4">
                            {u.isVerified ? (
                              <Badge variant="info" size="sm">
                                Mavi Tik
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                Standart
                              </Badge>
                            )}
                          </td>

                          {/* Kayıt Tarihi */}
                          <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </td>

                          {/* İşlemler */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Profil Gör */}
                              <Link
                                to={`/profile/${u.username}`}
                                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Profili Yeni Sekmede Aç"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Mavi Tik Butonu */}
                              <Button
                                variant={u.isVerified ? 'outline' : 'secondary'}
                                size="sm"
                                isLoading={isActioning}
                                onClick={() => toggleVerification(u.id, u.isVerified)}
                                title={u.isVerified ? 'Mavi Tik Rozetini Kaldır' : 'Mavi Tik Rozeti Ver'}
                              >
                                {u.isVerified ? 'Tik Kaldır' : 'Mavi Tik'}
                              </Button>

                              {/* Yasakla / Yasağı Kaldır */}
                              {isBanned ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  isLoading={isActioning}
                                  onClick={() => handleUnban(u)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  leftIcon={<Check className="w-3.5 h-3.5" />}
                                >
                                  Yasağı Kaldır
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled={u.role === 'ADMIN'}
                                  onClick={() => openBanModal(u)}
                                  leftIcon={<Ban className="w-3.5 h-3.5" />}
                                >
                                  Yasakla
                                </Button>
                              )}

                              {/* Daha Fazla İşlem Menüsü */}
                              <div className="relative">
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  aria-label="Kullanıcı Menüsü"
                                  onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                                >
                                  <MoreVertical className="w-4 h-4 text-slate-500" />
                                </IconButton>

                                {openMenuId === u.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-20" 
                                      onClick={() => setOpenMenuId(null)} 
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 divide-y divide-slate-100 dark:divide-slate-800 text-left">
                                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Yetki & Hesap
                                      </div>

                                      <div className="py-1">
                                        <button
                                          type="button"
                                          onClick={() => openRoleModal(u)}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                          <Shield className="w-4 h-4 text-purple-600" />
                                          Rol / Yetki Düzenle
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => openPasswordModal(u)}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                          <KeyRound className="w-4 h-4 text-amber-600" />
                                          Şifre Sıfırla
                                        </button>

                                        {u.twoFactorEnabled && (
                                          <button
                                            type="button"
                                            onClick={() => handleReset2FA(u)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <Lock className="w-4 h-4 text-indigo-600" />
                                            2FA Sıfırla
                                          </button>
                                        )}
                                      </div>

                                      <div className="py-1">
                                        <button
                                          type="button"
                                          onClick={() => openPurgeModal(u)}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                                        >
                                          <Eraser className="w-4 h-4" />
                                          İçerikleri Temizle (Spam)
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => openDeleteModal(u)}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Hesabı Kalıcı Sil
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isActioning = actionLoadingId === u.id;
                  const isBanned = u.isActive === false;

                  return (
                    <div 
                      key={u.id} 
                      className={`p-4 space-y-3.5 ${isBanned ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar url={u.avatarUrl} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/profile/${u.username}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 truncate text-sm"
                              >
                                {u.displayName || u.username}
                              </Link>
                              {u.isVerified && (
                                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{u.username}</div>
                            <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isBanned ? (
                            <Badge variant="danger" size="sm" dot>
                              Yasaklı
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot>
                              Aktif
                            </Badge>
                          )}
                          <Badge 
                            variant={u.role === 'ADMIN' ? 'danger' : u.role === 'MODERATOR' ? 'warning' : 'secondary'} 
                            size="sm"
                          >
                            {u.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {/* Mavi Tik */}
                          <Button
                            variant={u.isVerified ? 'outline' : 'secondary'}
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => toggleVerification(u.id, u.isVerified)}
                          >
                            {u.isVerified ? 'Tik Kaldır' : 'Mavi Tik'}
                          </Button>

                          {/* Yasakla / Aç */}
                          {isBanned ? (
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={isActioning}
                              onClick={() => handleUnban(u)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              Yasağı Aç
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={u.role === 'ADMIN'}
                              onClick={() => openBanModal(u)}
                              leftIcon={<Ban className="w-3.5 h-3.5" />}
                            >
                              Yasakla
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleModal(u)}
                          >
                            Rol
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordModal(u)}
                          >
                            Şifre
                          </Button>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Kullanıcı Menüsü"
                            onClick={() => openDeleteModal(u)}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. YASAKLAMA MODALI (BAN MODAL) */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Ban className="w-5 h-5" />
            <span>Kullanıcıyı Yasakla & Oturumları Kapat</span>
          </div>
        }
        description="Bu kullanıcının platforma erişimi tamamen askıya alınacak ve mevcut tüm aktif oturumları kapatılacaktır."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setBanModalOpen(false)}
              disabled={banSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={banSubmitting}
              leftIcon={<Ban className="w-4 h-4" />}
              onClick={handleBanSubmit}
            >
              Hesabı Yasakla
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
              <Avatar url={selectedUser.avatarUrl} size="md" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedUser.displayName || selectedUser.username}
                </p>
                <p className="text-xs text-slate-500">@{selectedUser.username} • {selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Yasaklama Gerekçesi
              </label>
              <Select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                options={[
                  { value: 'Spam veya Sahte Hesap', label: 'Spam veya Sahte Hesap' },
                  { value: 'Hakaret / Nefret Söylemi / Taciz', label: 'Hakaret / Nefret Söylemi / Taciz' },
                  { value: 'Topluluk Kuralları İhlali', label: 'Topluluk Kuralları İhlali' },
                  { value: 'Şüpheli Giriş / Güvenlik Riski', label: 'Şüpheli Giriş / Güvenlik Riski' },
                  { value: 'Telif Hakkı İhlali', label: 'Telif Hakkı İhlali' },
                  { value: 'Diğer / Özel Sebep', label: 'Diğer / Özel Sebep' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Yönetici Notu / Ek Açıklama (İsteğe Bağlı)
              </label>
              <Textarea
                rows={3}
                placeholder="Yasaklama hakkında denetim kaydına eklenecek açıklama..."
                value={banCustomNote}
                onChange={(e) => setBanCustomNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 2. ROL & YETKİ DÜZENLEME MODALI */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-purple-600">
            <Shield className="w-5 h-5" />
            <span>Kullanıcı Rolü & Yetkileri</span>
          </div>
        }
        description="Kullanıcının platformdaki yetki seviyesini belirleyin."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setRoleModalOpen(false)}
              disabled={roleSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={roleSubmitting}
              onClick={handleRoleSubmit}
            >
              Rolü Kaydet
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
              <Avatar url={selectedUser.avatarUrl} size="md" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedUser.displayName || selectedUser.username}
                </p>
                <p className="text-xs text-slate-500">Mevcut Rol: <strong>{selectedUser.role}</strong></p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Yeni Rol Seçin
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: 'USER',
                    title: 'Standart Kullanıcı (USER)',
                    desc: 'Standart topluluk üyesi yetkileri; içerik paylaşımı, yorum ve profil düzenleme.',
                    icon: <User className="w-4 h-4 text-slate-600" />,
                  },
                  {
                    id: 'MODERATOR',
                    title: 'Moderatör (MODERATOR)',
                    desc: 'İçerik moderasyonu, şikayetleri ve kullanıcı raporlarını inceleyip karara bağlama yetkisi.',
                    icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
                  },
                  {
                    id: 'ADMIN',
                    title: 'Yönetici (ADMIN)',
                    desc: 'Tam sistem kontrolü: Kullanıcı yasaklama, rol verme, sistem yapılandırması ve audit logları.',
                    icon: <Shield className="w-4 h-4 text-rose-600" />,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRole(item.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === item.id
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 ring-2 ring-primary-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedRole === item.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300'
                      }`}>
                        {selectedRole === item.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. ŞİFRE SIFIRLAMA MODALI */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-amber-600">
            <KeyRound className="w-5 h-5" />
            <span>Kullanıcı Şifresini Sıfırla</span>
          </div>
        }
        description="Kullanıcı için yeni bir parola tanımlayın. Bu işlem kullanıcının tüm açık oturumlarını sonlandırır."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={passwordSubmitting}
              onClick={handlePasswordSubmit}
            >
              Yeni Şifreyi Kaydet
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
              <Avatar url={selectedUser.avatarUrl} size="md" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedUser.displayName || selectedUser.username}
                </p>
                <p className="text-xs text-slate-500">@{selectedUser.username} • {selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Yeni Parola (En az 8 karakter)
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Güçlü Şifre Üret
                </button>
              </div>
              <Input
                type="text"
                placeholder="Yeni şifreyi giriniz..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium">
                  <span>Oluşturulan: <strong className="font-mono">{newPassword}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newPassword);
                      toast.success('Şifre panoya kopyalandı.');
                    }}
                    className="flex items-center gap-1 text-amber-900 hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Kopyala
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 4. İÇERİK TEMİZLEME (PURGE) MODALI */}
      <Modal
        isOpen={purgeModalOpen}
        onClose={() => setPurgeModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Eraser className="w-5 h-5" />
            <span>Kullanıcının Tüm İçeriklerini Sil (Spam Temizliği)</span>
          </div>
        }
        description="Bu işlem kullanıcının paylaştığı tüm gönderileri, yorumları ve projeleri kalıcı olarak silecektir. Bu işlem geri alınamaz!"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setPurgeModalOpen(false)}
              disabled={purgeSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={purgeSubmitting}
              onClick={handlePurgeSubmit}
            >
              Tüm İçerikleri Sil
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
            <Avatar url={selectedUser.avatarUrl} size="md" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                @{selectedUser.username} kullanıcısının tüm içerikleri temizlensin mi?
              </p>
              <p className="text-xs text-slate-500">Spam botları veya kural ihlali yapan hesaplar için uygundur.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. HESABI KALICI OLARAK SİLME MODALI */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <span>Kullanıcı Hesabını Kalıcı Olarak Sil</span>
          </div>
        }
        description="DİKKAT: Bu hesap veritabanından tamamen silinecektir. Profil, gönderiler, takip ilişkileri ve tüm ilişkili veriler yok edilecektir."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={deleteSubmitting}
              onClick={handleDeleteSubmit}
            >
              Hesabı Kalıcı Olarak Sil
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-1">
              <p className="font-bold">Silinecek Hesap Bilgileri:</p>
              <p>Kullanıcı Adı: @{selectedUser.username}</p>
              <p>E-posta: {selectedUser.email}</p>
              <p>Rol: {selectedUser.role}</p>
            </div>
            <p className="text-xs text-slate-500">
              Bu işlem geri alınamaz. Onaylamak için aşağıdaki butona tıklayın.
            </p>
          </div>
        )}
      </Modal>

      {/* 6. SİSTEM DUYURUSU GÖNDERME MODALI */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-primary-600">
            <Megaphone className="w-5 h-5" />
            <span>Tüm Kullanıcılara Sistem Duyurusu Gönder</span>
          </div>
        }
        description="Gönderdiğiniz duyuru platformdaki tüm aktif kullanıcıların bildirim merkezine anında iletilecektir."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setBroadcastModalOpen(false)}
              disabled={broadcastSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={broadcastSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleBroadcastSubmit}
            >
              Duyuruyu Yayınla
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Duyuru Başlığı
            </label>
            <Input
              placeholder="Örn: Yeni Sürüm Yayında! / Topluluk Güncellemesi"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Duyuru Mesajı
            </label>
            <Textarea
              rows={4}
              placeholder="Kullanıcılara iletilecek duyuru detaylarını buraya yazın..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Alıcı Kitlesi:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {users.filter(u => u.isActive !== false).length || 'Tüm'} Aktif Kullanıcı
            </span>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
