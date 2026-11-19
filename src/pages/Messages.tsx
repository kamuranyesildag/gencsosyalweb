import { useSEO } from "../hooks/useSEO";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  MessageSquarePlus,
  Search,
  X,
  ArrowLeft,
  SquarePen,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";
import { formatTimeAgo, cn } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { NewMessageDialog } from "../components/NewMessageDialog";
import { fetchApi } from "../lib/api";

type MessageTab = "chats" | "groups" | "requests";

export function Messages() {
  useSEO({ allowIndexing: false, title: "Mesajlar | Genç Sosyal" });
  const navigate = useNavigate();
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MessageTab>("chats");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);

  const {
    data: conversations,
    loading,
    loadingMore,
    hasMore,
    loadInitial,
    loadMore,
  } = usePagination("/messages/conversations");

  useEffect(() => {
    loadInitial();
    fetchApi("/users/suggestions?limit=8")
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j.data)
          ? j.data
          : Array.isArray(j.data?.suggestions)
          ? j.data.suggestions
          : [];
        setOnlineUsers(list);
      })
      .catch(() => {});

    fetchApi("/communities?limit=10")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setUserCommunities(j.data);
        }
      })
      .catch(() => {});
  }, [loadInitial]);

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const u = c.otherUser;
        return (
          u?.displayName?.toLowerCase().includes(q) ||
          u?.username?.toLowerCase().includes(q) ||
          c.lastMessage?.content?.toLowerCase().includes(q)
        );
      });
    }
    if (activeTab === "requests") {
      return list.filter((c) => c.isRequest);
    }
    return list;
  }, [conversations, searchQuery, activeTab]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-[#F8FAFC] dark:bg-[#080E1A] transition-colors relative">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-[#F8FAFC]/95 dark:bg-[#080E1A]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 pt-3.5 pb-3 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/home")}
              aria-label="Geri"
              className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Mesajlar
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowNewMsg(true)}
            aria-label="Yeni Sohbet"
            title="Yeni Sohbet"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <SquarePen className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Sohbetlerde ara"
            className="w-full bg-white dark:bg-[#0D1424] rounded-2xl pl-10 pr-9 py-2.5 outline-none border border-slate-200/90 dark:border-white/[0.08] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm shadow-2xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Sohbetlerde Ara"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Aramayı temizle"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Tabs: Sohbetler | Gruplar | İstekler */}
        <div className="grid grid-cols-3 p-1 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
          {[
            { id: "chats" as MessageTab, label: "Sohbetler", badge: totalUnread },
            { id: "groups" as MessageTab, label: "Topluluklar", badge: 0 },
            { id: "requests" as MessageTab, label: "İstekler", badge: 0 },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. "HIZLI SOHBET BAŞLAT" HORIZONTAL STRIP */}
      {onlineUsers.length > 0 && (
        <div className="px-4 pt-4 pb-2 space-y-2.5">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            HIZLI MESAJ GÖNDER
          </div>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            {onlineUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetchApi("/messages/conversations", {
                      method: "POST",
                      data: { targetUserId: u.id },
                    });
                    const json = await res.json();
                    if (json.success && json.data?.id) {
                      navigate(`/messages/${json.data.id}`);
                    }
                  } catch {}
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="relative">
                  <Avatar
                    url={u.avatarUrl}
                    name={u.displayName || u.username}
                    size="md"
                    className="w-13 h-13 ring-2 ring-white dark:ring-[#0D1424] group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#080E1A]" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[64px] truncate">
                  {(u.displayName || u.username || "").split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. CONVERSATIONS LIST CARD */}
      <div className="flex flex-col flex-1 px-4 pt-2 pb-28">
        {loading ? (
          <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3.5 p-4">
                <SkeletonCircle size="lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-3.5 w-48 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "groups" ? (
          userCommunities.length > 0 ? (
            <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden shadow-2xs">
              {userCommunities.map((comm) => (
                <Link
                  key={comm.id}
                  to={`/communities/${comm.slug}`}
                  className="flex items-center gap-3.5 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center font-black text-base shrink-0 overflow-hidden">
                    {comm.avatarUrl ? (
                      <img src={comm.avatarUrl} alt={comm.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(comm.name || "T").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {comm.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {comm.memberCount ?? 1} üye
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {comm.description || `c/${comm.slug} topluluğu`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] px-6 py-14 text-center shadow-2xs">
              <EmptyState
                icon={<Mail className="w-8 h-8 text-slate-400" />}
                title="Henüz Topluluk Bulunmuyor"
                description="Topluluklara katılarak ortak çalışma gruplarına erişebilirsiniz."
                action={{
                  label: "Toplulukları Keşfet",
                  onClick: () => navigate("/communities"),
                }}
              />
            </div>
          )
        ) : filteredConversations.length > 0 ? (
          <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden shadow-2xs">
            <InfiniteScroll
              items={filteredConversations}
              hasMore={hasMore && !searchQuery}
              isLoading={loadingMore}
              onLoadMore={loadMore}
              renderItem={(conv) => {
                const hasUnread = conv.unreadCount > 0;
                const otherUser = conv.otherUser;

                return (
                  <div key={conv.id}>
                    <Link
                      to={`/messages/${conv.id}`}
                      className={cn(
                        "flex items-center gap-3.5 p-4 transition-all group relative",
                        hasUnread
                          ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          url={otherUser?.avatarUrl}
                          name={otherUser?.displayName || otherUser?.username}
                          size="lg"
                          className="w-12 h-12 ring-1 ring-slate-200 dark:ring-white/10"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0D1424]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-extrabold truncate text-sm sm:text-[15px] text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {otherUser?.displayName || otherUser?.username || "Kullanıcı"}
                            </span>
                            {otherUser?.isVerified && (
                              <VerifiedBadge
                                iconClassName="w-4 h-4"
                                withModal={false}
                                targetUser={{
                                  username: otherUser.username,
                                  isVerified: !!otherUser.isVerified,
                                }}
                              />
                            )}
                          </div>

                          <span
                            className={cn(
                              "text-xs shrink-0",
                              hasUnread
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-slate-400 dark:text-slate-500 font-medium"
                            )}
                          >
                            {formatTimeAgo(conv.updatedAt)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <p
                            className={cn(
                              "truncate text-xs sm:text-sm leading-relaxed flex items-center gap-1",
                              hasUnread
                                ? "font-bold text-slate-900 dark:text-slate-100"
                                : "text-slate-500 dark:text-slate-400 font-normal"
                            )}
                          >
                            {!hasUnread && (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate">
                              {conv.lastMessage?.content || "Medya / Ek içerik"}
                            </span>
                          </p>

                          {hasUnread && (
                            <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg min-w-[22px] text-center shrink-0 shadow-2xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] px-6 py-14 text-center shadow-2xs">
            <EmptyState
              icon={<Mail className="w-8 h-8 text-slate-400" />}
              title={
                searchQuery.trim()
                  ? "Sonuç Bulunamadı"
                  : activeTab === "requests"
                  ? "Mesaj İsteği Yok"
                  : "Mesaj Kutunuz Boş"
              }
              description={
                searchQuery.trim()
                  ? `"${searchQuery}" ile eşleşen bir sohbet bulunamadı.`
                  : "Topluluktaki diğer üreticilerle doğrudan iletişime geçmek için yeni bir sohbet başlatın."
              }
              action={{
                label: "Yeni Sohbet Başlat",
                onClick: () => setShowNewMsg(true),
              }}
            />
          </div>
        )}
      </div>

      {/* 4. FLOATING "💬 YENİ SOHBET" BUTTON (Matching Mockup 6) */}
      <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-30">
        <button
          type="button"
          onClick={() => setShowNewMsg(true)}
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4.5 h-4.5 fill-white" />
          <span>Yeni Sohbet</span>
        </button>
      </div>

      {/* NEW MESSAGE DIALOG */}
      <NewMessageDialog isOpen={showNewMsg} onClose={() => setShowNewMsg(false)} />
    </div>
  );
}
