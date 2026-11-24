import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { Link } from "react-router";
import {
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  ImagePlus,
  X,
  Info,
  Users,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";
import { useUnreadStore } from "../../context/useUnreadStore";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../VerifiedBadge";
import { GroupAvatar } from "./GroupAvatar";
import { GroupInfoDrawer } from "./GroupInfoDrawer";
import { toast } from "../ui/Toast";
import { cn } from "../../lib/utils";
import type { ChatMessage, ConversationDetail, TypingUserEvent } from "./types";

interface ChatThreadPanelProps {
  conversationId: number;
  onlineUserIds: Set<number>;
  typingUsers: TypingUserEvent[];
  incomingMessage: ChatMessage | null;
  detailRefreshNonce: number;
  readReceiptNonce: number;
  showBackButton?: boolean;
  onBack?: () => void;
  onSendTyping: (conversationId: number, isTyping: boolean) => void;
  onMessageSent: (conversationId: number, msg: ChatMessage) => void;
  onMarkedRead: (conversationId: number) => void;
  onConversationChanged: () => void;
  onLeftGroup: (conversationId: number) => void;
}

const SENDER_NAME_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-amber-600 dark:text-amber-400",
  "text-violet-600 dark:text-violet-400",
  "text-rose-600 dark:text-rose-400",
  "text-cyan-600 dark:text-cyan-400",
];

function getSenderNameColor(userId: number) {
  return SENDER_NAME_COLORS[Math.abs(userId) % SENDER_NAME_COLORS.length];
}

function formatDateDivider(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfMsg.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ChatThreadPanel({
  conversationId,
  onlineUserIds,
  typingUsers,
  incomingMessage,
  detailRefreshNonce,
  readReceiptNonce,
  showBackButton = false,
  onBack,
  onSendTyping,
  onMessageSent,
  onMarkedRead,
  onConversationChanged,
  onLeftGroup,
}: ChatThreadPanelProps) {
  const { user: currentUser } = useAuthStore();
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sending, setSending] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevScrollHeightRef = useRef(0);
  const stickToBottomRef = useRef(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingActiveRef = useRef(false);

  const markAsRead = useCallback(async () => {
    try {
      await fetchApi(`/messages/conversations/${conversationId}/read`, {
        method: "PATCH",
      });
      onMarkedRead(conversationId);
      useUnreadStore.getState().fetchUnread();
    } catch {
      // Ignore transient mark-read failures
    }
  }, [conversationId, onMarkedRead]);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetchApi(`/messages/conversations/${conversationId}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setDetail(json.data);
        setErrorMsg(null);
      } else {
        setErrorMsg(json?.error?.message || "Sohbet yüklenemedi.");
      }
    } catch {
      setErrorMsg("Sohbet bilgileri alınamadı.");
    }
  }, [conversationId]);

  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setPage(1);
    stickToBottomRef.current = true;
    try {
      const [detailRes, msgsRes] = await Promise.all([
        fetchApi(`/messages/conversations/${conversationId}`),
        fetchApi(`/messages/conversations/${conversationId}/messages?page=1&limit=40`),
      ]);
      const [detailJson, msgsJson] = await Promise.all([
        detailRes.json(),
        msgsRes.json(),
      ]);

      if (detailRes.ok && detailJson.success) {
        setDetail(detailJson.data);
      } else {
        setErrorMsg(detailJson?.error?.message || "Sohbete erişilemiyor.");
        setDetail(null);
        setMessages([]);
        return;
      }

      if (msgsRes.ok && msgsJson.success && Array.isArray(msgsJson.data)) {
        const chronological = [...msgsJson.data].reverse();
        setMessages(chronological);
        setHasMore(msgsJson.data.length >= 40);
        markAsRead();
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, markAsRead]);

  // Reset & reload when switching conversation
  useEffect(() => {
    setContent("");
    setPendingMediaUrl(null);
    setShowGroupInfo(false);
    fetchInitialMessages();

    return () => {
      if (isTypingActiveRef.current) {
        onSendTyping(conversationId, false);
        isTypingActiveRef.current = false;
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, fetchInitialMessages, onSendTyping]);

  // Refresh group detail when WS signals conversation:updated
  useEffect(() => {
    if (detailRefreshNonce > 0) {
      fetchDetail();
    }
  }, [detailRefreshNonce, fetchDetail]);

  // Update read checkmarks when WS signals conversation:read
  useEffect(() => {
    if (readReceiptNonce > 0) {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender?.id === currentUser?.id && !m.isRead ? { ...m, isRead: true } : m
        )
      );
    }
  }, [readReceiptNonce, currentUser?.id]);

  // Append live incoming WS message with idempotent deduplication
  useEffect(() => {
    if (!incomingMessage || incomingMessage.conversationId !== conversationId) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === incomingMessage.id)) return prev;
      return [...prev, incomingMessage];
    });
    if (incomingMessage.sender?.id !== currentUser?.id) {
      markAsRead();
    }
  }, [incomingMessage, conversationId, currentUser?.id, markAsRead]);

  // Auto-resize composer textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [content]);

  // Preserve scroll position on older load, or scroll to bottom on new messages
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (prevScrollHeightRef.current > 0) {
      container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    } else if (stickToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: loading ? "auto" : "smooth" });
    }
  }, [messages.length, loading, typingUsers.length]);

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore || loading) return;
    const container = scrollContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight - container.scrollTop;
    }
    setLoadingOlder(true);
    try {
      const nextPage = page + 1;
      const res = await fetchApi(
        `/messages/conversations/${conversationId}/messages?page=${nextPage}&limit=40`
      );
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        const older = [...json.data].reverse();
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueOlder = older.filter((m: ChatMessage) => !existingIds.has(m.id));
          return [...uniqueOlder, ...prev];
        });
        setPage(nextPage);
        setHasMore(json.data.length >= 40);
      }
    } catch {
      // Ignore transient pagination errors
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop < 60 && hasMore && !loadingOlder && !loading) {
      loadOlderMessages();
    }

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  };

  const handleInputChange = (value: string) => {
    setContent(value);

    if (value.trim().length > 0) {
      if (!isTypingActiveRef.current) {
        isTypingActiveRef.current = true;
        onSendTyping(conversationId, true);
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (isTypingActiveRef.current) {
          isTypingActiveRef.current = false;
          onSendTyping(conversationId, false);
        }
      }, 2500);
    } else if (isTypingActiveRef.current) {
      isTypingActiveRef.current = false;
      onSendTyping(conversationId, false);
    }
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Yalnızca görsel dosyaları gönderilebilir.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Görsel en fazla 6 MB olabilir.");
      return;
    }

    setUploadingMedia(true);
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
        setPendingMediaUrl(uploadedUrl);
      } else {
        toast.error(json?.error?.message || "Görsel yüklenemedi.");
      }
    } catch {
      toast.error("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if ((!trimmed && !pendingMediaUrl) || sending || uploadingMedia) return;

    setSending(true);
    if (isTypingActiveRef.current) {
      isTypingActiveRef.current = false;
      onSendTyping(conversationId, false);
    }

    try {
      const res = await fetchApi(`/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        data: {
          content: trimmed || undefined,
          mediaUrl: pendingMediaUrl || undefined,
        },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const sentMsg: ChatMessage = json.data;
        stickToBottomRef.current = true;
        setMessages((prev) =>
          prev.some((m) => m.id === sentMsg.id) ? prev : [...prev, sentMsg]
        );
        setContent("");
        setPendingMediaUrl(null);
        onMessageSent(conversationId, sentMsg);
      } else {
        toast.error(json?.error?.message || "Mesaj gönderilemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setSending(false);
    }
  };

  const isGroup = Boolean(detail?.isGroup);
  const otherUser = detail?.otherUser;
  const isOtherOnline = Boolean(
    otherUser && (onlineUserIds.has(otherUser.id) || otherUser.isOnline)
  );
  const liveGroupOnlineCount = detail?.isGroup
    ? detail.members.filter(
        (m) => m.id === currentUser?.id || onlineUserIds.has(m.id) || m.isOnline
      ).length
    : 0;

  const typingLabel =
    typingUsers.length === 1
      ? isGroup
        ? `${typingUsers[0].displayName || typingUsers[0].username} yazıyor...`
        : "yazıyor..."
      : typingUsers.length > 1
      ? `${typingUsers.length} kişi yazıyor...`
      : null;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#080E1A] relative overflow-hidden">
      {/* STICKY HEADER */}
      <header className="h-16 px-3 sm:px-5 bg-white/95 dark:bg-[#0D1424]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Mesajlara Dön"
              className="md:hidden w-11 h-11 -ml-1.5 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {loading && !detail ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-white/[0.08] animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-white/[0.08] animate-pulse" />
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-white/[0.05] animate-pulse" />
              </div>
            </div>
          ) : isGroup && detail ? (
            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
            >
              <GroupAvatar
                avatarUrl={detail.avatarUrl}
                name={detail.name}
                members={detail.members}
                size="md"
              />
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm sm:text-[15px] text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {detail.name || "Grup Sohbeti"}
                </h2>
                <p
                  className={cn(
                    "text-xs truncate tabular-nums",
                    typingLabel
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {typingLabel || `${detail.memberCount} üye · ${liveGroupOnlineCount} çevrimiçi`}
                </p>
              </div>
            </button>
          ) : otherUser ? (
            <Link
              to={`/profile/${otherUser.username}`}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div className="relative shrink-0">
                <Avatar
                  url={otherUser.avatarUrl}
                  name={otherUser.displayName || otherUser.username}
                  size="md"
                  className="ring-1 ring-slate-200 dark:ring-white/10"
                />
                {isOtherOnline && (
                  <span
                    title="Çevrimiçi"
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0D1424]"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="font-extrabold text-sm sm:text-[15px] text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {otherUser.displayName || otherUser.username}
                  </h2>
                  {otherUser.isVerified && (
                    <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    typingLabel
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : isOtherOnline
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {typingLabel || (isOtherOnline ? "Çevrimiçi" : `@${otherUser.username}`)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Sohbet</div>
          )}
        </div>

        {/* Right Header Actions */}
        {detail && (
          <div className="flex items-center gap-1 shrink-0">
            {isGroup ? (
              <button
                type="button"
                onClick={() => setShowGroupInfo(true)}
                aria-label="Grup bilgileri ve üyeler"
                title="Grup bilgileri ve üyeler"
                className="inline-flex items-center gap-1.5 min-h-[42px] px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Grup Bilgisi</span>
              </button>
            ) : otherUser ? (
              <Link
                to={`/profile/${otherUser.username}`}
                aria-label="Profili Gör"
                title="Profili Gör"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <ExternalLink className="w-4.5 h-4.5" />
              </Link>
            ) : null}
          </div>
        )}
      </header>

      {/* MESSAGE STREAM */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-1.5"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Mesajlar yükleniyor...</span>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Info className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{errorMsg}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sohbeti Başlatın
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {isGroup
                ? `"${detail?.name}" grubunda ilk mesajı siz yazın.`
                : "Aşağıdan ilk mesajınızı veya bir fotoğraf gönderin."}
            </p>
          </div>
        ) : (
          <>
            {loadingOlder && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            )}

            {messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
              const showDateDivider =
                !prevMsg || getDateKey(prevMsg.createdAt) !== getDateKey(msg.createdAt);

              // SYSTEM event row
              if (msg.messageType === "SYSTEM") {
                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <div className="flex justify-center py-3">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                          {formatDateDivider(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-center py-1.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md px-3">
                        {msg.content}
                      </p>
                    </div>
                  </React.Fragment>
                );
              }

              const isMe = msg.sender?.id === currentUser?.id;
              const sameSenderAsPrev =
                !showDateDivider &&
                prevMsg &&
                prevMsg.messageType !== "SYSTEM" &&
                prevMsg.sender?.id === msg.sender?.id &&
                new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() <
                  3 * 60 * 1000;

              const sameSenderAsNext =
                nextMsg &&
                nextMsg.messageType !== "SYSTEM" &&
                nextMsg.sender?.id === msg.sender?.id &&
                getDateKey(nextMsg.createdAt) === getDateKey(msg.createdAt) &&
                new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() <
                  3 * 60 * 1000;

              const showGroupSenderName = isGroup && !isMe && !sameSenderAsPrev;
              const showGroupAvatar = isGroup && !isMe && !sameSenderAsNext;

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center py-3">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                        {formatDateDivider(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-end gap-2",
                      isMe ? "justify-end" : "justify-start",
                      sameSenderAsPrev ? "mt-0.5" : "mt-2.5"
                    )}
                  >
                    {/* Group sender avatar slot */}
                    {isGroup && !isMe && (
                      <div className="w-7 shrink-0">
                        {showGroupAvatar && msg.sender && (
                          <Link to={`/profile/${msg.sender.username}`}>
                            <Avatar
                              url={msg.sender.avatarUrl}
                              name={msg.sender.displayName || msg.sender.username}
                              size="xs"
                              className="w-7 h-7 ring-1 ring-slate-200 dark:ring-white/10"
                            />
                          </Link>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[82%] sm:max-w-[68%] flex flex-col",
                        isMe ? "items-end" : "items-start"
                      )}
                    >
                      {showGroupSenderName && msg.sender && (
                        <Link
                          to={`/profile/${msg.sender.username}`}
                          className={cn(
                            "text-[11px] font-bold mb-1 ml-1 hover:underline",
                            getSenderNameColor(msg.sender.id)
                          )}
                        >
                          {msg.sender.displayName || msg.sender.username}
                        </Link>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl text-sm sm:text-[15px] leading-relaxed overflow-hidden",
                          msg.mediaUrl && !msg.content ? "p-1.5" : "px-3.5 py-2.5",
                          isMe
                            ? cn(
                                "bg-blue-600 text-white shadow-xs shadow-blue-600/15",
                                !sameSenderAsNext && "rounded-br-sm"
                              )
                            : cn(
                                "bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs",
                                !sameSenderAsNext && "rounded-bl-sm"
                              )
                        )}
                      >
                        {msg.mediaUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(msg.mediaUrl || null)}
                            className={cn(
                              "block overflow-hidden rounded-xl cursor-zoom-in",
                              msg.content ? "mb-2" : ""
                            )}
                          >
                            <img
                              src={msg.mediaUrl}
                              alt="Mesaj eki"
                              className="max-h-72 w-auto max-w-full object-cover rounded-xl"
                              loading="lazy"
                            />
                          </button>
                        )}

                        {msg.content && (
                          <div className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 text-[10px] font-medium mt-1 tabular-nums",
                            msg.mediaUrl && !msg.content ? "px-1.5 pb-0.5" : "",
                            isMe ? "text-blue-100/90" : "text-slate-400 dark:text-slate-500"
                          )}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && !isGroup && (
                            <span>
                              {msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-blue-200/75" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Live Typing Indicator Row */}
            {typingLabel && (
              <div className="flex items-center gap-2 pt-2 pl-1">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span className="font-medium">{typingLabel}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* COMPOSER BAR */}
      {!errorMsg && (
        <div className="px-3 sm:px-5 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:py-3.5 bg-white/95 dark:bg-[#0D1424]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] shrink-0">
          {/* Pending Media Preview */}
          {pendingMediaUrl && (
            <div className="mb-2.5 flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] w-fit">
              <img
                src={pendingMediaUrl}
                alt="Gönderilecek görsel"
                className="w-14 h-14 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setPendingMediaUrl(null)}
                aria-label="Görseli kaldır"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingMedia || sending}
              aria-label="Görsel ekle"
              title="Görsel ekle"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {uploadingMedia ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <ImagePlus className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1 flex items-end bg-slate-100/80 dark:bg-[#080E1A] focus-within:bg-white dark:focus-within:bg-[#080E1A] rounded-2xl border border-slate-200/90 dark:border-white/[0.1] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all px-3.5 py-1.5">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={isGroup ? "Gruba mesaj yazın..." : "Mesajınızı yazın..."}
                value={content}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent py-1.5 outline-none text-sm sm:text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 resize-none max-h-[132px] leading-snug"
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={(!content.trim() && !pendingMediaUrl) || sending || uploadingMedia}
              aria-label="Mesaj Gönder"
              className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/20 transition-all shrink-0 cursor-pointer"
            >
              {sending ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5 -mr-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* GROUP INFO DRAWER */}
      <GroupInfoDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        conversation={detail}
        onlineUserIds={onlineUserIds}
        onUpdated={() => {
          fetchDetail();
          onConversationChanged();
        }}
        onLeftGroup={() => onLeftGroup(conversationId)}
      />

      {/* IMAGE LIGHTBOX */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-[140] bg-slate-950/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Kapat"
            className="absolute top-4 right-4 w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Büyük görsel önizleme"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
}
