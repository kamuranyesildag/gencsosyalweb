import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Image as ImageIcon, 
  Upload, 
  X, 
  RefreshCw,
  Users,
  Shield,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { toast } from '../ui/Toast';
import { fetchApi } from '../../lib/api';
import { useAuthStore } from '../../context/useAuth';
import { AnnouncementModalContent, AnnouncementItem } from '../announcement/AnnouncementModalContent';
import { fadeInVariants } from '../../lib/motion';

export interface AdminAnnouncementItem {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  targetType: 'all' | 'authenticated' | 'specific_role';
  targetRole?: string | null;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  clicksCount?: number;
}

export function AdminAnnouncements() {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<AdminAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAnnouncementItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    buttonText: '',
    buttonUrl: '',
    status: 'draft' as 'draft' | 'scheduled' | 'published' | 'archived',
    targetType: 'all' as 'all' | 'authenticated' | 'specific_role',
    targetRole: 'USER',
    priority: 0,
    startsAt: '',
    endsAt: '',
  });

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState<AdminAnnouncementItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Load announcements
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      let url = `/admin/announcements?page=${page}&limit=20`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetchApi(url);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items || []);
        setTotal(json.data.total || 0);
      } else {
        toast.error(json.error?.message || 'Duyurular yüklenemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [page, statusFilter]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAnnouncements();
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      buttonText: 'Detayları Gör',
      buttonUrl: '/explore',
      status: 'published',
      targetType: 'all',
      targetRole: 'USER',
      priority: 0,
      startsAt: '',
      endsAt: '',
    });
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (item: AdminAnnouncementItem) => {
    setEditingItem(item);
    
    // Format dates for datetime-local input
    const formatForInput = (d?: string | null) => {
      if (!d) return '';
      try {
        const date = new Date(d);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      } catch {
        return '';
      }
    };

    setFormData({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      buttonText: item.buttonText || '',
      buttonUrl: item.buttonUrl || '',
      status: item.status,
      targetType: item.targetType,
      targetRole: item.targetRole || 'USER',
      priority: item.priority || 0,
      startsAt: formatForInput(item.startsAt),
      endsAt: formatForInput(item.endsAt),
    });
    setIsFormOpen(true);
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Lütfen geçerli bir görsel formatı seçin (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu en fazla 5MB olabilir.');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.data.url }));
        toast.success('Görsel başarıyla yüklendi.');
      } else {
        toast.error(json.error?.message || 'Görsel yüklenemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Görsel yükleme sırasında bağlantı hatası oluştu.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Duyuru başlığı boş bırakılamaz.');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Duyuru açıklaması boş bırakılamaz.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        buttonText: formData.buttonText.trim() || null,
        buttonUrl: formData.buttonUrl.trim() || null,
        status: formData.status,
        targetType: formData.targetType,
        targetRole: formData.targetType === 'specific_role' ? formData.targetRole : null,
        priority: Number(formData.priority) || 0,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
      };

      let res;
      if (editingItem) {
        res = await fetchApi(`/admin/announcements/${editingItem.id}`, {
          method: 'PUT',
          data: payload,
        });
      } else {
        res = await fetchApi('/admin/announcements', {
          method: 'POST',
          data: payload,
        });
      }

      const json = await res.json();
      if (json.success) {
        toast.success(editingItem ? 'Duyuru güncellendi.' : 'Yeni duyuru oluşturuldu.');
        setIsFormOpen(false);
        loadAnnouncements();
      } else {
        toast.error(json.error?.message || 'İşlem başarısız oldu.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Fast Publish Action
  const handlePublishNow = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetchApi(`/admin/announcements/${id}/publish`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Duyuru hemen yayına alındı.');
        loadAnnouncements();
      } else {
        toast.error(json.error?.message || 'Yayına alınamadı.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  // Fast Archive Action
  const handleArchive = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetchApi(`/admin/announcements/${id}/archive`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Duyuru arşivlendi.');
        loadAnnouncements();
      } else {
        toast.error(json.error?.message || 'Arşivlenemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetchApi(`/admin/announcements/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Duyuru ve ilişkili istatistikler başarıyla silindi.');
        setItemToDelete(null);
        loadAnnouncements();
      } else {
        toast.error(json.error?.message || 'Silinemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bağlantı hatası.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" dot>Yayında</Badge>;
      case 'scheduled':
        return <Badge variant="warning" dot>Zamanlandı</Badge>;
      case 'archived':
        return <Badge variant="neutral">Arşivlendi</Badge>;
      case 'draft':
      default:
        return <Badge variant="default">Taslak</Badge>;
    }
  };

  // Helper for audience label
  const getAudienceLabel = (type: string, role?: string | null) => {
    switch (type) {
      case 'authenticated':
        return 'Giriş Yapan Üyeler';
      case 'specific_role':
        return `Rol: ${role || 'Bilinmiyor'}`;
      case 'all':
      default:
        return 'Tüm Kullanıcılar';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Duyuru Yönetimi & Modal Popup</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Kullanıcıların karşısına çıkacak modern bildirim ve duyuru popuplarını yönetin, okundu/tıklanma oranlarını izleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="md"
            onClick={loadAnnouncements}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Yenile
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            Yeni Duyuru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200 dark:border-white/[0.08]">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'published', label: 'Yayında' },
              { id: 'scheduled', label: 'Zamanlandı' },
              { id: 'draft', label: 'Taslak' },
              { id: 'archived', label: 'Arşivlendi' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <Input
              type="text"
              placeholder="Duyuru başlığı veya içerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs"
            />
            <Button type="submit" variant="secondary" size="md">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Announcements List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Duyuru Bulunamadı"
          description={
            searchQuery
              ? `"${searchQuery}" aramasıyla eşleşen duyuru bulunamadı.`
              : 'Henüz sistemde kayıtlı duyuru yok. "Yeni Duyuru" butonuyla ilk duyurunuzu oluşturabilirsiniz.'
          }
          action={{
            label: 'Hemen Oluştur',
            onClick: handleOpenCreate,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const views = item.viewsCount || 0;
            const clicks = item.clicksCount || 0;
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';

            return (
              <motion.div
                key={item.id}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="h-full flex flex-col justify-between overflow-hidden border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all">
                  {/* Card Header & Content */}
                  <div>
                    {item.imageUrl && (
                      <div className="w-full h-36 bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-b border-slate-100 dark:border-white/[0.06]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {!item.imageUrl && (
                        <div className="flex items-center justify-between gap-2">
                          {getStatusBadge(item.status)}
                          <span className="text-[11px] font-semibold text-slate-400">
                            ID: #{item.id}
                          </span>
                        </div>
                      )}

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {item.content}
                      </p>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <Users className="w-3 h-3 text-slate-400" />
                          {getAudienceLabel(item.targetType, item.targetRole)}
                        </span>

                        {item.priority > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-semibold border border-amber-200/60 dark:border-amber-900/30">
                            Öncelik: +{item.priority}
                          </span>
                        )}

                        {item.buttonText && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-medium border border-blue-100 dark:border-blue-900/30">
                            Buton: {item.buttonText}
                          </span>
                        )}
                      </div>

                      {/* Metrics Box */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0C121E] border border-slate-100 dark:border-white/[0.04] text-center">
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                            Görüntüleme
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {views}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                            Tıklanma (CTA)
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {clicks}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                            CTR (%)
                          </span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            %{ctr}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Preview Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewItem(item)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Önizle
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Düzenle
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.status !== 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === item.id}
                          onClick={() => handlePublishNow(item.id)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          Yayına Al
                        </Button>
                      )}

                      {item.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === item.id}
                          onClick={() => handleArchive(item.id)}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          Arşivle
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        aria-label="Duyuruyu Sil"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination if more than 20 items */}
      {total > 20 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">
            Toplam {total} duyuru içinden {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} arası
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !formSubmitting && setIsFormOpen(false)}
        title={editingItem ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}
        description="Kullanıcı arayüzünde görüntülenecek duyuru detaylarını yapılandırın."
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <Input
            label="Duyuru Başlığı"
            placeholder="Örn: Genç Sosyal'de Yeni Özellik!"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={255}
          />

          {/* Content */}
          <Textarea
            label="Duyuru Açıklaması / İçerik"
            placeholder="Duyurunun detaylarını buraya yazın..."
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />

          {/* Image Upload Area */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Duyuru Görseli (Opsiyonel)
            </label>

            {formData.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] aspect-video max-h-48 bg-slate-100 dark:bg-slate-900 group">
                <img
                  src={formData.imageUrl}
                  alt="Duyuru önizleme"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  leftIcon={
                    uploadingImage ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )
                  }
                  className="w-full sm:w-auto"
                >
                  {uploadingImage ? 'Yükleniyor...' : 'Görsel Yükle (Max 5MB)'}
                </Button>

                <Input
                  type="url"
                  placeholder="Veya görsel URL'si yapıştırın (https://...)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 text-xs"
                />
              </div>
            )}
          </div>

          {/* Button CTA settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Input
              label="Buton Metni (Opsiyonel)"
              placeholder="Örn: Detayları Gör"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            />

            <Input
              label="Buton Bağlantısı (URL)"
              placeholder="Örn: /explore veya https://..."
              value={formData.buttonUrl}
              onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
            />
          </div>

          {/* Target Audience & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Hedef Kitle"
              value={formData.targetType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetType: e.target.value as 'all' | 'authenticated' | 'specific_role',
                })
              }
              options={[
                { value: 'all', label: 'Tüm Kullanıcılar' },
                { value: 'authenticated', label: 'Yalnızca Üyeler' },
                { value: 'specific_role', label: 'Belirli Rol' },
              ]}
            />

            {formData.targetType === 'specific_role' ? (
              <Select
                label="Hedef Rol"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                options={[
                  { value: 'USER', label: 'Kullanıcı (USER)' },
                  { value: 'MODERATOR', label: 'Moderatör (MODERATOR)' },
                  { value: 'ADMIN', label: 'Yönetici (ADMIN)' },
                ]}
              />
            ) : (
              <Input
                label="Öncelik Puanı (0-10)"
                type="number"
                min={0}
                max={100}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })}
              />
            )}

            <Select
              label="Yayın Durumu"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'draft' | 'scheduled' | 'published' | 'archived',
                })
              }
              options={[
                { value: 'published', label: 'Hemen Yayına Al' },
                { value: 'scheduled', label: 'Zamanlandı' },
                { value: 'draft', label: 'Taslak Olarak Kaydet' },
                { value: 'archived', label: 'Arşivlendi' },
              ]}
            />
          </div>

          {/* Timing (Starts At / Ends At) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Yayın Başlangıç Tarihi (Opsiyonel)"
              type="datetime-local"
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
            />

            <Input
              label="Yayın Bitiş Tarihi (Opsiyonel)"
              type="datetime-local"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setPreviewItem({
                  title: formData.title || 'Örnek Başlık',
                  content: formData.content || 'Örnek duyuru metni burada görüntülenecektir.',
                  imageUrl: formData.imageUrl || null,
                  buttonText: formData.buttonText || null,
                  buttonUrl: formData.buttonUrl || null,
                });
              }}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Önizle
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={formSubmitting}
                onClick={() => setIsFormOpen(false)}
              >
                İptal
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={formSubmitting}
                className="min-w-28"
              >
                {formSubmitting
                  ? 'Kaydediliyor...'
                  : editingItem
                  ? 'Güncelle'
                  : 'Oluştur'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setPreviewItem(null)}
            />
            <div className="relative z-10 w-full max-w-md my-auto">
              <AnnouncementModalContent
                announcement={previewItem}
                onClose={() => setPreviewItem(null)}
                isPreview={true}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleteSubmitting && setItemToDelete(null)}
        title="Duyuruyu Sil"
        size="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>"{itemToDelete?.title}"</strong> başlıklı duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve duyuruya ait tüm görüntülenme/tıklanma kayıtları da kaldırılacaktır.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              disabled={deleteSubmitting}
              onClick={() => setItemToDelete(null)}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={deleteSubmitting}
              onClick={handleDeleteConfirm}
            >
              {deleteSubmitting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
