import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Loader2,
  Camera,
  Check,
  Users,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../VerifiedBadge";
import { toast } from "../ui/Toast";
import { cn } from "../../lib/utils";
import type { MessageUserBrief } from "./types";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: number) => void;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const { user: currentUser } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<MessageUserBrief[]>([]);
  const [searchResults, setSearchResults] = useState<MessageUserBrief[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<MessageUserBrief[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when closing & fetch suggestions when opening
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setAvatarUrl(null);
      setQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setSubmitting(false);
      return;
    }

    let cancelled = false;
    setLoadingUsers(true);
    fetchApi("/users/suggestions?limit=12")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.suggestions)
          ? json.data.suggestions
          : [];
        setSuggestedUsers(
          list.filter((u: any) => u && u.id !== currentUser?.id)
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUser?.id]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, submitting, onClose]);

  // Debounced user search
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingUsers(true);
      try {
        const res = await fetchApi(
          `/search?q=${encodeURIComponent(trimmed)}&type=users`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSearchResults(
            json.data.filter((u: any) => u && u.id !== currentUser?.id)
          );
        }
      } catch {
        // Ignore transient search errors
      } finally {
        setLoadingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, currentUser?.id]);

  const toggleUser = (target: MessageUserBrief) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === target.id);
      if (exists) {
        return prev.filter((u) => u.id !== target.id);
      }
      if (prev.length >= 49) {
        toast.error("Bir gruba en fazla 49 kişi ekleyebilirsiniz.");
        return prev;
      }
      return [...prev, target];
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Görsel boyutu en fazla 5 MB olabilir.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchApi("/media/upload", {
        method: "POST",
        data: formData,
      });
      const json = await res.json();
      const uploadedUrl = json?.data?.url || json?.url;
      if (res.ok && uploadedUrl) {
        setAvatarUrl(uploadedUrl);
      } else {
        toast.error(json?.error?.message || "Fotoğraf yüklenemedi.");
      }
    } catch {
      toast.error("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Grup adı en az 2 karakter olmalıdır.");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Gruba en az 1 kişi eklemelisiniz.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchApi("/messages/conversations/group", {
        method: "POST",
        data: {
          name: trimmedName,
          description: description.trim() || null,
          avatarUrl: avatarUrl || null,
          memberIds: selectedUsers.map((u) => u.id),
        },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.id) {
        toast.success(`"${trimmedName}" grubu oluşturuldu.`);
        onGroupCreated(json.data.id);
        onClose();
      } else {
        toast.error(json?.error?.message || "Grup oluşturulamadı.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedUsers = query.trim().length >= 2 ? searchResults : suggestedUsers;
  const selectedIdSet = new Set(selectedUsers.map((u) => u.id));
  const canCreate = name.trim().length >= 2 && selectedUsers.length > 0 && !submitting && !uploadingAvatar;

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => !submitting && onClose()}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: 32, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 32, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 28, stiffness: 340 }}
          className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
        >
          {/* Mobile Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div>
              <h2
                id="create-group-title"
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight"
              >
                Yeni Grup Oluştur
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Üyeleri seçin, grubunuza isim verin ve sohbete başlayın
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Kapat"
              className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Group Identity Section */}
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.08] space-y-3.5 shrink-0 bg-slate-50/60 dark:bg-white/[0.015]">
              <div className="flex items-start gap-4">
                {/* Group Avatar Picker */}
                <div className="relative shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    aria-label="Grup fotoğrafı seç"
                    className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0D1424] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer group"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Grup fotoğrafı"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-bold opacity-90">Fotoğraf</span>
                      </div>
                    )}
                    {avatarUrl && !uploadingAvatar && (
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(null)}
                      aria-label="Fotoğrafı kaldır"
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:bg-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Name & Description */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="group-name-input"
                        className="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Grup Adı *
                      </label>
                      <span className="text-[11px] tabular-nums text-slate-400">
                        {name.trim().length}/80
                      </span>
                    </div>
                    <input
                      id="group-name-input"
                      type="text"
                      maxLength={80}
                      placeholder="Örn: Teknofest Yazılım Ekibi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white dark:bg-[#080E1A] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/[0.1] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Kısa açıklama (isteğe bağlı)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white dark:bg-[#080E1A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200 dark:border-white/[0.08] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Selected Members Strip */}
              {selectedUsers.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Seçilen Üyeler
                    </span>
                    <span className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {selectedUsers.length} / 49
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    {selectedUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUser(u)}
                        className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                      >
                        <Avatar
                          url={u.avatarUrl}
                          name={u.displayName || u.username}
                          size="xs"
                          className="w-5 h-5"
                        />
                        <span className="max-w-[96px] truncate">
                          {u.displayName || u.username}
                        </span>
                        <X className="w-3.5 h-3.5 opacity-75" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Member Search Box */}
            <div className="px-5 py-3 border-b border-slate-200/70 dark:border-white/[0.06] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Üye eklemek için isim veya @kullanıcı adı ara..."
                  className="w-full bg-slate-100/80 dark:bg-white/[0.04] focus:bg-white dark:focus:bg-[#080E1A] rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200/80 dark:border-white/[0.08] focus:border-blue-500 outline-none transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Aramayı temizle"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {query.trim().length >= 2 ? "Arama Sonuçları" : "Önerilen Kişiler"}
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              ) : displayedUsers.length > 0 ? (
                displayedUsers.map((u) => {
                  const isSelected = selectedIdSet.has(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 min-h-[52px] rounded-2xl text-left transition-all cursor-pointer border",
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/35 border-blue-200 dark:border-blue-500/30"
                          : "border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <Avatar
                        url={u.avatarUrl}
                        name={u.displayName || u.username}
                        size="md"
                        className="shrink-0 ring-1 ring-slate-200 dark:ring-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {u.displayName || u.username}
                          </span>
                          {u.isVerified && (
                            <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          @{u.username}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all border",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-white/20 bg-white dark:bg-transparent"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {query.trim().length >= 2 ? "Kullanıcı bulunamadı" : "Kişi arayın"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {query.trim().length >= 2
                      ? "Farklı bir isim veya kullanıcı adı deneyin."
                      : "Gruba eklemek istediğiniz kişilerin adını yukarıya yazın."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 border-t border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                {selectedUsers.length > 0
                  ? `Siz + ${selectedUsers.length} kişi (${selectedUsers.length + 1} üye)`
                  : "En az 1 üye seçin"}
              </div>
              <button
                type="submit"
                disabled={!canCreate}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 disabled:hover:bg-blue-600 text-white text-sm font-bold shadow-sm shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor</span>
                  </>
                ) : (
                  <>
                    <span>Grubu Oluştur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
