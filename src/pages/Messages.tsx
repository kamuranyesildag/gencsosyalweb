import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { 
  Mail, 
  Plus, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sparkles,
  Search,
  X
} from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";
import { formatTimeAgo } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { NewMessageDialog } from "../components/NewMessageDialog";

export function Messages() {
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination("/messages/conversations");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const u = c.otherUser;
      return (
        u?.displayName?.toLowerCase().includes(q) ||
        u?.username?.toLowerCase().includes(q) ||
        c.lastMessage?.content?.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 dark:border-white/[0.08] min-h-screen bg-white dark:bg-[#070A10] transition-colors">
      {/* STICKY HEADER */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/85 dark:bg-[#070A10]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Mesajlar
            </h1>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white font-bold text-xs rounded-full">
                {totalUnread} okunmamış
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
            onClick={() => setShowNewMsg(true)}
            className="rounded-full font-bold shadow-xs shadow-blue-500/20"
          >
            Yeni Mesaj
          </Button>
        </div>

        {/* Quick Search Bar */}
        {conversations.length > 0 && (
          <div className="px-4 sm:px-6 pb-3 pt-0.5">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:focus:bg-[#0D121D] rounded-xl pl-9.5 pr-8 py-2 outline-none border border-slate-200/80 dark:border-white/[0.08] focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Sohbetlerde Ara"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Aramayı temizle"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/[0.1] active:scale-95 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CONVERSATIONS LIST / SKELETON / EMPTY */}
      <div className="flex flex-col flex-1 pb-24">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3.5 p-4 sm:p-5">
                <SkeletonCircle size="lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-3.5 w-48 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
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
                      className={`flex items-center gap-3.5 sm:gap-4 p-4 sm:p-5 transition-all group relative ${
                        hasUnread
                          ? "bg-blue-50/40 dark:bg-blue-950/15 hover:bg-blue-50/70 dark:hover:bg-blue-950/25"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.02] bg-white dark:bg-[#070A10]"
                      }`}
                    >
                      {/* Avatar */}
                      <Avatar
                        url={otherUser?.avatarUrl}
                        name={otherUser?.displayName || otherUser?.username}
                        size="lg"
                        className="ring-1 ring-slate-200 dark:ring-white/[0.1] group-hover:ring-slate-300 transition-all shrink-0"
                      />

                      {/* Conversation Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`font-bold truncate text-sm sm:text-base transition-colors ${
                                hasUnread
                                  ? "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                  : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              }`}
                            >
                              {otherUser?.displayName || otherUser?.username || "Kullanıcı"}
                            </span>
                            {otherUser?.isVerified && (
                              <VerifiedBadge
                                iconClassName="w-4 h-4"
                                withModal={false}
                                targetUser={{ username: otherUser.username, isVerified: !!otherUser.isVerified }}
                              />
                            )}
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate hidden sm:inline">
                              @{otherUser?.username}
                            </span>
                          </div>

                          <span
                            className={`text-xs shrink-0 font-medium ${
                              hasUnread ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {formatTimeAgo(conv.updatedAt)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <p
                            className={`truncate text-xs sm:text-sm leading-relaxed ${
                              hasUnread
                                ? "font-semibold text-slate-900 dark:text-slate-100"
                                : "text-slate-500 dark:text-slate-400 font-normal"
                            }`}
                          >
                            {conv.lastMessage?.content || "Medya/Ek içerik"}
                          </p>

                          {hasUnread && (
                            <span className="bg-blue-600 dark:bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0 shadow-xs">
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
        ) : searchQuery.trim().length > 0 ? (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Search className="w-8 h-8 text-slate-400" />}
              title="Sonuç Bulunamadı"
              description={`"${searchQuery}" ile eşleşen bir sohbet veya mesaj bulunamadı.`}
              action={{
                label: "Aramayı Temizle",
                onClick: () => setSearchQuery(""),
              }}
            />
          </div>
        ) : (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Mail className="w-8 h-8 text-slate-400" />}
              title="Mesaj Kutunuz Boş"
              description="Topluluktaki diğer kullanıcılarla doğrudan iletişime geçmek için ilk sohbetinizi başlatın."
              action={{
                label: "Yeni Sohbet Başlat",
                onClick: () => setShowNewMsg(true),
              }}
            />
          </div>
        )}
      </div>

      {/* NEW MESSAGE DIALOG */}
      <NewMessageDialog isOpen={showNewMsg} onClose={() => setShowNewMsg(false)} />
    </div>
  );
}
