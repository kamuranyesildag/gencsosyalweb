import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  X,
  SquarePen,
  Users,
  CheckCheck,
  MessageSquare,
  UserPlus,
  Image as ImageIcon,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";
import { useUnreadStore } from "../../context/useUnreadStore";
import { useMessagesSocket } from "../../hooks/useMessagesSocket";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../VerifiedBadge";
import { Skeleton, SkeletonCircle } from "../ui/Skeleton";
import { NewMessageDialog } from "../NewMessageDialog";
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupAvatar } from "./GroupAvatar";
import { ChatThreadPanel } from "./ChatThreadPanel";
import { formatTimeAgo, cn } from "../../lib/utils";
import { toast } from "../ui/Toast";
import type {
  ChatMessage,
  ConversationSummary,
  MessageUserBrief,
  TypingUserEvent,
} from "./types";

type InboxFilter = "all" | "groups" | "direct";

interface MessagingWorkspaceProps {
  activeConversationId: number | null;
}

export function MessagingWorkspace({ activeConversationId }: MessagingWorkspaceProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [quickContacts, setQuickContacts] = useState<MessageUserBrief[]>([]);

  const [showNewMsg, setShowNewMsg] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Real-time event state bridged down into the active ChatThreadPanel
  const [lastIncomingMessage, setLastIncomingMessage] = useState<ChatMessage | null>(null);
  const [detailRefreshNonce, setDetailRefreshNonce] = useState(0);
  const [readReceiptNonce, setReadReceiptNonce] = useState(0);
  const [typingByConv, setTypingByConv] = useState<Record<number, TypingUserEvent[]>>({});
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetchApi("/messages/conversations?page=1&limit=50");
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setConversations(json.data);
      }
    } catch {
      // Ignore transient fetch errors
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations(false);
    fetchApi("/users/suggestions?limit=10")
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.suggestions)
          ? json.data.suggestions
          : [];
        setQuickContacts(list.filter((u: any) => u && u.id !== currentUser?.id));
      })
      .catch(() => {});
  }, [fetchConversations, currentUser?.id]);

  // Real-time WebSocket listeners
  const { onlineUserIds, sendTyping } = useMessagesSocket({
    onMessageCreated: ({ conversationId, message }) => {
      setLastIncomingMessage(message);

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          fetchConversations(true);
          return prev;
        }
        const target = prev[idx];
        const isViewing = activeConversationId === conversationId;
        const isFromOther =
          message.sender?.id !== currentUser?.id && message.messageType !== "SYSTEM";

        const updated: ConversationSummary = {
          ...target,
          updatedAt: message.createdAt,
          unreadCount: isViewing
            ? 0
            : target.unreadCount + (isFromOther ? 1 : 0),
          lastMessage: {
            id: message.id,
            conversationId,
            senderId: message.sender?.id || 0,
            content: message.content,
            mediaUrl: message.mediaUrl,
            messageType: message.messageType || "TEXT",
            isRead: message.isRead,
            createdAt: message.createdAt,
            sender: message.sender
              ? {
                  id: message.sender.id,
                  username: message.sender.username,
                  displayName: message.sender.displayName,
                }
              : undefined,
          },
        };

        const rest = prev.filter((c) => c.id !== conversationId);
        return [updated, ...rest];
      });

      if (activeConversationId !== conversationId && message.sender?.id !== currentUser?.id) {
        useUnreadStore.getState().fetchUnread();
      }
    },

    onConversationCreated: () => {
      fetchConversations(true);
    },

    onConversationUpdated: ({ conversationId }) => {
      fetchConversations(true);
      if (conversationId === activeConversationId) {
        setDetailRefreshNonce((n) => n + 1);
      }
    },

    onConversationRemoved: ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        navigate("/messages", { replace: true });
      }
    },

    onConversationRead: ({ conversationId }) => {
      if (conversationId === activeConversationId) {
        setReadReceiptNonce((n) => n + 1);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, isRead: true } }
            : c
        )
      );
    },

    onTypingStart: (evt) => {
      const key = `${evt.conversationId}:${evt.userId}`;
      const existingTimer = typingTimeoutsRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      setTypingByConv((prev) => {
        const list = prev[evt.conversationId] || [];
        if (list.some((t) => t.userId === evt.userId)) return prev;
        return { ...prev, [evt.conversationId]: [...list, evt] };
      });

      const autoClear = setTimeout(() => {
        setTypingByConv((prev) => {
          const list = prev[evt.conversationId] || [];
          return {
            ...prev,
            [evt.conversationId]: list.filter((t) => t.userId !== evt.userId),
          };
        });
        typingTimeoutsRef.current.delete(key);
      }, 4500);

      typingTimeoutsRef.current.set(key, autoClear);
    },

    onTypingStop: (evt) => {
      const key = `${evt.conversationId}:${evt.userId}`;
      const existingTimer = typingTimeoutsRef.current.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
        typingTimeoutsRef.current.delete(key);
      }
      setTypingByConv((prev) => {
        const list = prev[evt.conversationId] || [];
        if (!list.some((t) => t.userId === evt.userId)) return prev;
        return {
          ...prev,
          [evt.conversationId]: list.filter((t) => t.userId !== evt.userId),
        };
      });
    },
  });

  useEffect(() => {
    const timers = typingTimeoutsRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const openConversation = useCallback(
    (conversationId: number) => {
      navigate(`/messages/${conversationId}`);
    },
    [navigate]
  );

  const handleStartDirectChat = async (targetUserId: number) => {
    try {
      const res = await fetchApi("/messages/conversations", {
        method: "POST",
        data: { targetUserId },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.id) {
        fetchConversations(true);
        openConversation(json.data.id);
      } else {
        toast.error(json?.error?.message || "Sohbet başlatılamadı.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    }
  };

  const handleMarkedRead = useCallback((conversationId: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const handleMessageSent = useCallback(
    (conversationId: number, msg: ChatMessage) => {
      setConversations((prev) => {
        const target = prev.find((c) => c.id === conversationId);
        if (!target) {
          fetchConversations(true);
          return prev;
        }
        const updated: ConversationSummary = {
          ...target,
          updatedAt: msg.createdAt,
          unreadCount: 0,
          lastMessage: {
            id: msg.id,
            conversationId,
            senderId: msg.sender?.id || currentUser?.id || 0,
            content: msg.content,
            mediaUrl: msg.mediaUrl,
            messageType: msg.messageType || "TEXT",
            isRead: msg.isRead,
            createdAt: msg.createdAt,
            sender: msg.sender
              ? {
                  id: msg.sender.id,
                  username: msg.sender.username,
                  displayName: msg.sender.displayName,
                }
              : undefined,
          },
        };
        return [updated, ...prev.filter((c) => c.id !== conversationId)];
      });
    },
    [currentUser?.id, fetchConversations]
  );

  const handleLeftGroup = useCallback(
    (conversationId: number) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      navigate("/messages", { replace: true });
    },
    [navigate]
  );

  const unreadTotals = useMemo(() => {
    let all = 0;
    let groups = 0;
    let direct = 0;
    for (const c of conversations) {
      const count = c.unreadCount || 0;
      all += count;
      if (c.isGroup) groups += count;
      else direct += count;
    }
    return { all, groups, direct };
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filter === "groups" && !c.isGroup) return false;
      if (filter === "direct" && c.isGroup) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = c.isGroup
          ? (c.name || "").toLowerCase()
          : (c.otherUser?.displayName || c.otherUser?.username || "").toLowerCase();
        const username = c.isGroup ? "" : (c.otherUser?.username || "").toLowerCase();
        const lastContent = (c.lastMessage?.content || "").toLowerCase();
        return title.includes(q) || username.includes(q) || lastContent.includes(q);
      }
      return true;
    });
  }, [conversations, filter, searchQuery]);

  const activeTypingUsers = activeConversationId
    ? typingByConv[activeConversationId] || []
    : [];

  const renderLastMessagePreview = (conv: ConversationSummary) => {
    const typingList = typingByConv[conv.id];
    if (typingList && typingList.length > 0) {
      const label = conv.isGroup
        ? `${typingList[0].displayName || typingList[0].username} yazıyor...`
        : "yazıyor...";
      return (
        <span className="text-blue-600 dark:text-blue-400 font-semibold truncate">
          {label}
        </span>
      );
    }

    const lm = conv.lastMessage;
    if (!lm) {
      return (
        <span className="text-slate-400 dark:text-slate-500 italic truncate">
          Sohbeti başlatın
        </span>
      );
    }

    if (lm.messageType === "SYSTEM") {
      return <span className="truncate">{lm.content}</span>;
    }

    const isMine = lm.senderId === currentUser?.id;
    const prefix = conv.isGroup
      ? isMine
        ? "Siz: "
        : `${lm.sender?.displayName?.split(" ")[0] || lm.sender?.username || ""}: `
      : "";

    return (
      <span className="flex items-center gap-1 min-w-0 truncate">
        {isMine && !conv.isGroup && (
          <CheckCheck
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              lm.isRead ? "text-blue-500" : "text-slate-400"
            )}
          />
        )}
        {lm.mediaUrl && !lm.content ? (
          <span className="inline-flex items-center gap-1 truncate">
            {prefix && <span>{prefix}</span>}
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Fotoğraf</span>
          </span>
        ) : (
          <span className="truncate">
            {prefix}
            {lm.content}
          </span>
        )}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full bg-white dark:bg-[#080E1A] transition-colors",
        activeConversationId
          ? "h-[calc(100dvh-60px)] md:h-[calc(100vh-60px)]"
          : "min-h-[calc(100vh-60px)] md:h-[calc(100vh-60px)]"
      )}
    >
      {/* LEFT INBOX RAIL — Always visible on desktop, hidden on mobile when inside an active thread */}
      <section
        aria-label="Sohbet Listesi"
        className={cn(
          "flex flex-col w-full md:w-[340px] lg:w-[380px] md:shrink-0 md:border-r border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1120] md:h-full",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Inbox Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08] space-y-3 shrink-0 bg-white/95 dark:bg-[#0B1120]/95 sticky top-[60px] md:static z-10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Mesajlar
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {conversations.length > 0
                  ? `${conversations.length} sohbet`
                  : "Doğrudan ve grup sohbetleri"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                aria-label="Yeni Grup Oluştur"
                title="Yeni Grup Oluştur"
                className="inline-flex items-center gap-1.5 min-h-[42px] px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Grup</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewMsg(true)}
                aria-label="Yeni Sohbet Başlat"
                title="Yeni Sohbet Başlat"
                className="w-[42px] h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <SquarePen className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sohbet veya grup ara..."
              aria-label="Sohbet veya grup ara"
              className="w-full bg-slate-100/80 dark:bg-white/[0.04] focus:bg-white dark:focus:bg-[#080E1A] rounded-xl pl-10 pr-9 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-transparent focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Aramayı temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs: Tümü | Gruplar | Kişiler */}
          <div className="grid grid-cols-3 p-1 bg-slate-100/90 dark:bg-white/[0.04] rounded-xl">
            {(
              [
                { id: "all", label: "Tümü", badge: unreadTotals.all },
                { id: "groups", label: "Gruplar", badge: unreadTotals.groups },
                { id: "direct", label: "Kişiler", badge: unreadTotals.direct },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "min-h-[36px] px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    active
                      ? "bg-white dark:bg-[#141F36] text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold leading-none tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Inbox Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Start Contacts Strip (shown when not searching and in all/direct tabs) */}
          {!searchQuery && filter !== "groups" && quickContacts.length > 0 && (
            <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hızlı Başlat
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(true)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-dashed border-blue-400/70 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-solid transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 max-w-[60px] truncate">
                    Yeni Grup
                  </span>
                </button>

                {quickContacts.map((contact) => {
                  const isOnline = onlineUserIds.has(contact.id);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleStartDirectChat(contact.id)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar
                          url={contact.avatarUrl}
                          name={contact.displayName || contact.username}
                          size="md"
                          className="w-12 h-12 ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-blue-500 transition-all"
                        />
                        {isOnline && (
                          <span
                            title="Çevrimiçi"
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1120]"
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[60px] truncate">
                        {(contact.displayName || contact.username).split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations List */}
          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3.5 p-4">
                  <SkeletonCircle size="lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-10 rounded-md" />
                    </div>
                    <Skeleton className="h-3.5 w-44 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-slate-100/90 dark:divide-white/[0.05]">
              {filteredConversations.map((conv) => {
                const isSelected = activeConversationId === conv.id;
                const hasUnread = conv.unreadCount > 0 && !isSelected;
                const otherUser = conv.otherUser;
                const isOtherOnline = Boolean(
                  !conv.isGroup &&
                    otherUser &&
                    (onlineUserIds.has(otherUser.id) || otherUser.isOnline)
                );

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => openConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 min-h-[72px] text-left transition-colors cursor-pointer relative",
                      isSelected
                        ? "bg-blue-50/90 dark:bg-blue-950/40"
                        : hasUnread
                        ? "bg-blue-50/30 dark:bg-blue-950/15 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Avatar */}
                    {conv.isGroup ? (
                      <GroupAvatar
                        avatarUrl={conv.avatarUrl}
                        name={conv.name}
                        members={conv.membersPreview}
                        size="lg"
                      />
                    ) : (
                      <div className="relative shrink-0">
                        <Avatar
                          url={otherUser?.avatarUrl}
                          name={otherUser?.displayName || otherUser?.username}
                          size="lg"
                          className="w-12 h-12 ring-1 ring-slate-200 dark:ring-white/10"
                        />
                        {isOtherOnline && (
                          <span
                            title="Çevrimiçi"
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1120]"
                          />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "truncate text-sm sm:text-[15px] tracking-tight",
                              hasUnread || isSelected
                                ? "font-extrabold text-slate-900 dark:text-white"
                                : "font-bold text-slate-900 dark:text-slate-100"
                            )}
                          >
                            {conv.isGroup
                              ? conv.name || "Grup Sohbeti"
                              : otherUser?.displayName || otherUser?.username || "Kullanıcı"}
                          </span>

                          {!conv.isGroup && otherUser?.isVerified && (
                            <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />
                          )}

                          {conv.isGroup && (
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                              · {conv.memberCount} üye
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "text-[11px] shrink-0 tabular-nums",
                            hasUnread
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : "text-slate-400 dark:text-slate-500 font-medium"
                          )}
                        >
                          {formatTimeAgo(conv.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] truncate flex-1",
                            hasUnread
                              ? "font-semibold text-slate-900 dark:text-slate-100"
                              : "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {renderLastMessagePreview(conv)}
                        </p>

                        {hasUnread && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-md bg-blue-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-14 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.05] text-slate-400 flex items-center justify-center mb-3.5">
                {filter === "groups" ? (
                  <Users className="w-6 h-6" />
                ) : (
                  <MessageSquare className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {searchQuery.trim()
                  ? "Sonuç Bulunamadı"
                  : filter === "groups"
                  ? "Henüz Grup Sohbetiniz Yok"
                  : "Mesaj Kutunuz Boş"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                {searchQuery.trim()
                  ? `"${searchQuery}" ile eşleşen sohbet bulunamadı.`
                  : filter === "groups"
                  ? "Arkadaşlarınız veya proje ekibinizle hemen bir grup sohbeti oluşturun."
                  : "Yeni bir sohbet veya grup oluşturarak konuşmaya başlayın."}
              </p>
              {!searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    filter === "groups" ? setShowCreateGroup(true) : setShowNewMsg(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {filter === "groups" ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>İlk Grubu Oluştur</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Sohbet Başlat</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT ACTIVE CHAT PANE */}
      <section
        aria-label="Aktif Sohbet"
        className={cn(
          "flex-1 min-w-0 h-full",
          activeConversationId ? "flex" : "hidden md:flex"
        )}
      >
        {activeConversationId ? (
          <ChatThreadPanel
            conversationId={activeConversationId}
            onlineUserIds={onlineUserIds}
            typingUsers={activeTypingUsers}
            incomingMessage={lastIncomingMessage}
            detailRefreshNonce={detailRefreshNonce}
            readReceiptNonce={readReceiptNonce}
            showBackButton
            onBack={() => navigate("/messages")}
            onSendTyping={sendTyping}
            onMessageSent={handleMessageSent}
            onMarkedRead={handleMarkedRead}
            onConversationChanged={() => fetchConversations(true)}
            onLeftGroup={handleLeftGroup}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC] dark:bg-[#080E1A]">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Mesajlarınız Burada
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Soldaki listeden bir sohbet seçin, birebir mesaj başlatın veya ekibiniz için yeni bir grup sohbeti oluşturun.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Users className="w-4.5 h-4.5" />
                <span>Yeni Grup Oluştur</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewMsg(true)}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/[0.1] text-sm font-bold active:scale-[0.98] transition-all cursor-pointer"
              >
                <SquarePen className="w-4.5 h-4.5" />
                <span>Yeni Sohbet</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MODALS */}
      <NewMessageDialog
        isOpen={showNewMsg}
        onClose={() => setShowNewMsg(false)}
        onSwitchToGroup={() => setShowCreateGroup(true)}
        onConversationStarted={(convId) => {
          fetchConversations(true);
          openConversation(convId);
        }}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={(convId) => {
          fetchConversations(true);
          openConversation(convId);
        }}
      />
    </div>
  );
}
