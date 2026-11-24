import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import {
  X,
  Camera,
  Pencil,
  Check,
  UserPlus,
  Search,
  Loader2,
  Shield,
  ShieldOff,
  UserMinus,
  LogOut,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../VerifiedBadge";
import { GroupAvatar } from "./GroupAvatar";
import { toast } from "../ui/Toast";
import { confirmDialog } from "../ui/ConfirmDialog";
import { cn } from "../../lib/utils";
import type { ConversationDetail, MessageUserBrief } from "./types";

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ConversationDetail | null;
  onlineUserIds: Set<number>;
  onUpdated: () => void;
  onLeftGroup: () => void;
}

export function GroupInfoDrawer({
  isOpen,
  onClose,
  conversation,
  onlineUserIds,
  onUpdated,
  onLeftGroup,
}: GroupInfoDrawerProps) {
  const { user: currentUser } = useAuthStore();
  const isAdmin = conversation?.myRole === "ADMIN";

  const [editingInfo, setEditingInfo] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MessageUserBrief[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversation) {
      setNameInput(conversation.name || "");
      setDescInput(conversation.description || "");
    }
    if (!isOpen) {
      setEditingInfo(false);
      setShowAddMembers(false);
      setMemberQuery("");
      setSearchResults([]);
    }
  }, [conversation, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Live search for adding new members
  useEffect(() => {
    if (!showAddMembers || !conversation) return;
    const trimmed = memberQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const existingIds = new Set(conversation.members.map((m) => m.id));
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(trimmed)}&type=users`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSearchResults(json.data.filter((u: any) => u && !existingIds.has(u.id)));
        }
      } catch {
        // Ignore transient errors
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberQuery, showAddMembers, conversation]);

  if (!isOpen || !conversation || !conversation.isGroup || typeof document === "undefined") {
    return null;
  }

  const handleSaveInfo = async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName.length < 2) {
      toast.error("Grup adı en az 2 karakter olmalıdır.");
      return;
    }
    setSavingInfo(true);
    try {
      const res = await fetchApi(`/messages/conversations/${conversation.id}`, {
        method: "PATCH",
        data: {
          name: trimmedName,
          description: descInput.trim() || null,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Grup bilgileri güncellendi.");
        setEditingInfo(false);
        onUpdated();
      } else {
        toast.error(json?.error?.message || "Güncellenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel seçin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Görsel en fazla 5 MB olabilir.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetchApi("/media/upload", {
        method: "POST",
        data: formData,
      });
      const uploadJson = await uploadRes.json();
      const uploadedUrl = uploadJson?.data?.url || uploadJson?.url;
      if (!uploadRes.ok || !uploadedUrl) {
        toast.error("Fotoğraf yüklenemedi.");
        return;
      }

      const patchRes = await fetchApi(`/messages/conversations/${conversation.id}`, {
        method: "PATCH",
        data: { avatarUrl: uploadedUrl },
      });
      const patchJson = await patchRes.json();
      if (patchRes.ok && patchJson.success) {
        toast.success("Grup fotoğrafı güncellendi.");
        onUpdated();
      } else {
        toast.error(patchJson?.error?.message || "Grup fotoğrafı kaydedilemedi.");
      }
    } catch {
      toast.error("Fotoğraf güncellenirken hata oluştu.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddMember = async (targetUser: MessageUserBrief) => {
    setAddingUserId(targetUser.id);
    try {
      const res = await fetchApi(`/messages/conversations/${conversation.id}/members`, {
        method: "POST",
        data: { memberIds: [targetUser.id] },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`@${targetUser.username} gruba eklendi.`);
        setSearchResults((prev) => prev.filter((u) => u.id !== targetUser.id));
        onUpdated();
      } else {
        toast.error(json?.error?.message || "Üye eklenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setAddingUserId(null);
    }
  };

  const handleToggleRole = async (memberId: number, currentRole: string, username: string) => {
    const nextRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    setActionUserId(memberId);
    try {
      const res = await fetchApi(
        `/messages/conversations/${conversation.id}/members/${memberId}/role`,
        {
          method: "PATCH",
          data: { role: nextRole },
        }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          nextRole === "ADMIN"
            ? `@${username} grup yöneticisi yapıldı.`
            : `@${username} yöneticilikten alındı.`
        );
        onUpdated();
      } else {
        toast.error(json?.error?.message || "Rol güncellenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleRemoveMember = async (memberId: number, username: string) => {
    const confirmed = await confirmDialog({
      title: "Üyeyi Gruptan Çıkar",
      message: `@${username} kullanıcısını "${conversation.name}" grubundan çıkarmak istediğinize emin misiniz?`,
      confirmLabel: "Çıkar",
      cancelLabel: "İptal",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionUserId(memberId);
    try {
      const res = await fetchApi(
        `/messages/conversations/${conversation.id}/members/${memberId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`@${username} gruptan çıkarıldı.`);
        onUpdated();
      } else {
        toast.error(json?.error?.message || "Üye çıkarılamadı.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser?.id) return;
    const confirmed = await confirmDialog({
      title: "Gruptan Ayrıl",
      message: `"${conversation.name}" grubundan ayrılmak istediğinize emin misiniz? Ayrıldıktan sonra tekrar yalnızca bir yönetici tarafından eklenebilirsiniz.`,
      confirmLabel: "Gruptan Ayrıl",
      cancelLabel: "Vazgeç",
      variant: "danger",
    });
    if (!confirmed) return;

    setLeaving(true);
    try {
      const res = await fetchApi(
        `/messages/conversations/${conversation.id}/members/${currentUser.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Gruptan ayrıldınız.");
        onClose();
        onLeftGroup();
      } else {
        toast.error(json?.error?.message || "Gruptan ayrılınamadı.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setLeaving(false);
    }
  };

  const sortedMembers = [...conversation.members].sort((a, b) => {
    if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
    if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
    return 0;
  });

  const liveOnlineCount = conversation.members.filter(
    (m) => m.id === currentUser?.id || onlineUserIds.has(m.id) || m.isOnline
  ).length;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[125] flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Grup Bilgileri"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs"
        />

        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#0D1424] border-l border-slate-200/80 dark:border-white/[0.08] h-full flex flex-col shadow-2xl"
        >
          {/* Drawer Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Grup Bilgileri
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70 dark:divide-white/[0.06]">
            {/* Identity Block */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-3.5">
                <GroupAvatar
                  avatarUrl={conversation.avatarUrl}
                  name={conversation.name}
                  members={conversation.members}
                  size="xl"
                />
                {isAdmin && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      aria-label="Grup fotoğrafını değiştir"
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#0D1424] transition-all active:scale-95 cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {editingInfo ? (
                <div className="w-full space-y-2.5 mt-1 text-left">
                  <input
                    type="text"
                    maxLength={80}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Grup adı"
                    className="w-full bg-slate-50 dark:bg-[#080E1A] rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.1] focus:border-blue-500 outline-none"
                  />
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Grup açıklaması"
                    className="w-full bg-slate-50 dark:bg-[#080E1A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] focus:border-blue-500 outline-none resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInfo(false);
                        setNameInput(conversation.name || "");
                        setDescInput(conversation.description || "");
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInfo}
                      disabled={savingInfo}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {savingInfo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 max-w-full">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                      {conversation.name || "İsimsiz Grup"}
                    </h3>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setEditingInfo(true)}
                        aria-label="Grup adını düzenle"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                    {conversation.memberCount} üye · {liveOnlineCount} çevrimiçi
                  </p>
                  {conversation.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-sm">
                      {conversation.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Members Section */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 tabular-nums">
                  Üyeler ({conversation.memberCount})
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddMembers((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showAddMembers ? "Kapat" : "Üye Ekle"}</span>
                  </button>
                )}
              </div>

              {/* Expandable Add Member Panel */}
              {isAdmin && showAddMembers && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Eklenecek kullanıcıyı ara..."
                      className="w-full bg-white dark:bg-[#080E1A] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.08] focus:border-blue-500 outline-none"
                      autoFocus
                    />
                  </div>

                  {searching ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {searchResults.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#080E1A]/80 border border-slate-100 dark:border-white/[0.05]"
                        >
                          <Avatar
                            url={u.avatarUrl}
                            name={u.displayName || u.username}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.displayName || u.username}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">@{u.username}</p>
                          </div>
                          <button
                            type="button"
                            disabled={addingUserId === u.id}
                            onClick={() => handleAddMember(u)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            {addingUserId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Ekle"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : memberQuery.trim().length >= 2 ? (
                    <p className="text-xs text-center text-slate-400 py-2">
                      Eklenebilecek kullanıcı bulunamadı.
                    </p>
                  ) : null}
                </div>
              )}

              {/* Member Rows */}
              <div className="space-y-1">
                {sortedMembers.map((member) => {
                  const isMe = member.id === currentUser?.id;
                  const isOnline = isMe || onlineUserIds.has(member.id) || Boolean(member.isOnline);
                  const isMemberAdmin = member.role === "ADMIN";
                  const busy = actionUserId === member.id;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <Link
                        to={`/profile/${member.username}`}
                        onClick={onClose}
                        className="relative shrink-0"
                      >
                        <Avatar
                          url={member.avatarUrl}
                          name={member.displayName || member.username}
                          size="md"
                          className="ring-1 ring-slate-200 dark:ring-white/10"
                        />
                        {isOnline && (
                          <span
                            title="Çevrimiçi"
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0D1424]"
                          />
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link
                            to={`/profile/${member.username}`}
                            onClick={onClose}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                          >
                            {member.displayName || member.username}
                            {isMe ? " (Siz)" : ""}
                          </Link>
                          {member.isVerified && (
                            <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="truncate">@{member.username}</span>
                          {isMemberAdmin && (
                            <>
                              <span>·</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                Yönetici
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {isAdmin && !isMe && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleToggleRole(member.id, member.role, member.username)
                            }
                            title={isMemberAdmin ? "Yöneticilikten al" : "Yönetici yap"}
                            aria-label={isMemberAdmin ? "Yöneticilikten al" : "Yönetici yap"}
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer",
                              isMemberAdmin
                                ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                : "text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            )}
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isMemberAdmin ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleRemoveMember(member.id, member.username)}
                            title="Gruptan çıkar"
                            aria-label="Gruptan çıkar"
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Leave Group Action */}
          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-slate-200/80 dark:border-white/[0.08] shrink-0">
            <button
              type="button"
              disabled={leaving}
              onClick={handleLeaveGroup}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {leaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Gruptan Ayrıl</span>
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>,
    document.body
  );
}
