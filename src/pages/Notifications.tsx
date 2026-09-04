import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Bell, 
  Megaphone, 
  Repeat2, 
  CheckCircle2, 
  Users, 
  Rocket,
  ShieldCheck,
  CheckCheck
} from "lucide-react";
import { motion } from "motion/react";
import { fetchApi } from "../lib/api";
import { Avatar } from "../components/ui/Avatar";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { formatTimeAgo } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";

export function Notifications() {
  const { data: notifications, loading, loadingMore, hasMore, loadInitial, loadMore, setData } = usePagination("/notifications");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInitial();
    // Mark as read
    fetchApi("/notifications/read", { method: "PUT" }).catch(console.error);
  }, [loadInitial]);

  const handleMarkAllAsRead = async () => {
    if (isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await fetchApi("/notifications/read", { method: "PUT" });
      setData((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const getNotificationDetails = (type: string) => {
    switch (type) {
      case "like":
        return {
          icon: <Heart className="w-4.5 h-4.5 text-rose-600 fill-rose-600 dark:text-rose-400 dark:fill-rose-400" />,
          bg: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400",
          text: "gönderini beğendi.",
        };
      case "project_like":
        return {
          icon: <Heart className="w-4.5 h-4.5 text-rose-600 fill-rose-600 dark:text-rose-400 dark:fill-rose-400" />,
          bg: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400",
          text: "projeni beğendi.",
        };
      case "comment":
        return {
          icon: <MessageCircle className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400",
          text: "gönderine yorum yaptı.",
        };
      case "project_comment":
        return {
          icon: <MessageCircle className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400",
          text: "projene yorum yaptı.",
        };
      case "follow":
        return {
          icon: <UserPlus className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400",
          text: "seni takip etmeye başladı.",
        };
      case "repost":
        return {
          icon: <Repeat2 className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400 stroke-[2.5]" />,
          bg: "bg-teal-50/80 dark:bg-teal-950/30 border-teal-200/60 dark:border-teal-900/40 text-teal-600 dark:text-teal-400",
          text: "gönderini yeniden paylaştı.",
        };
      case "post":
        return {
          icon: <Megaphone className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
          bg: "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400",
          text: "yeni bir duyuru/gönderi paylaştı.",
        };
      case "verification":
      case "verified":
        return {
          icon: <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400 fill-sky-100 dark:fill-sky-950" />,
          bg: "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200/60 dark:border-sky-900/40 text-sky-600 dark:text-sky-400",
          text: "hesap doğrulama durumun güncellendi.",
        };
      case "collaborator_invite":
      case "project_invite":
        return {
          icon: <Users className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400",
          text: "seni bir projede iş birliğine davet etti.",
        };
      default:
        return {
          icon: <Bell className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />,
          bg: "bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400",
          text: "yeni bir bildirim gönderdi.",
        };
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    } else if (notif.projectId) {
      navigate(`/projects/${notif.projectId}`);
    } else if (notif.type?.includes("collaborator_invite") || notif.type?.includes("project_invite")) {
      navigate(`/settings?tab=invites`);
    } else if (notif.type === "follow" && notif.actor?.username) {
      navigate(`/profile/${notif.actor.username}`);
    } else if (notif.type === "verification") {
      navigate(`/settings?tab=verification`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 dark:border-white/[0.08] min-h-screen bg-white dark:bg-[#070A10] transition-colors">
      {/* STICKY HEADER */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/85 dark:bg-[#070A10]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Bildirimler
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white font-bold text-xs rounded-full">
                {unreadCount} yeni
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tümünü Okundu Say</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center px-4 border-t border-slate-200/60 dark:border-white/[0.06]"
          role="tablist"
          aria-label="Bildirim Filtresi"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center ${
              filter === "all"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Tümü</span>
            {filter === "all" && (
              <motion.div
                layoutId="notifActiveTab"
                className="absolute bottom-0 inset-x-4 h-0.5 bg-slate-900 dark:bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center ${
              filter === "unread"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Okunmamış</span>
            {filter === "unread" && (
              <motion.div
                layoutId="notifActiveTab"
                className="absolute bottom-0 inset-x-4 h-0.5 bg-slate-900 dark:bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS LIST / SKELETON / EMPTY */}
      <div className="flex flex-col flex-1 pb-24">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-3.5 p-4 sm:p-5 items-start">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <SkeletonCircle size="sm" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            <InfiniteScroll
              items={filteredNotifications}
              hasMore={hasMore && filter === "all"}
              isLoading={loadingMore}
              onLoadMore={loadMore}
              renderItem={(notif) => {
                const details = getNotificationDetails(notif.type);
                const isUnread = !notif.isRead;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 transition-colors cursor-pointer group relative ${
                      isUnread
                        ? "bg-blue-50/40 dark:bg-blue-950/15 hover:bg-blue-50/70 dark:hover:bg-blue-950/25"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.02] bg-white dark:bg-[#070A10]"
                    }`}
                  >
                    {/* Icon Badge */}
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${details.bg}`}
                      >
                        {details.icon}
                      </div>
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {notif.actor && (
                            <Link
                              to={`/profile/${notif.actor.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0"
                            >
                              <Avatar
                                url={notif.actor.avatarUrl}
                                name={notif.actor.displayName || notif.actor.username}
                                size="sm"
                                className="ring-1 ring-slate-200 dark:ring-white/[0.1] group-hover:ring-slate-300 transition-all"
                              />
                            </Link>
                          )}
                          <Link
                            to={notif.actor ? `/profile/${notif.actor.username}` : "#"}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-[15px]"
                          >
                            {notif.actor?.displayName || notif.actor?.username || "Genç Sosyal"}
                          </Link>
                          {notif.actor?.isVerified && (
                            <VerifiedBadge
                              iconClassName="w-4 h-4"
                              withModal={false}
                              targetUser={{ username: notif.actor.username, isVerified: !!notif.actor.isVerified }}
                            />
                          )}
                        </div>

                        {/* Unread Status Dot */}
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-950 shrink-0 mt-1" />
                        )}
                      </div>

                      {/* Text Description */}
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {details.text}
                      </p>

                      {/* Post / Content Snippet if available */}
                      {notif.post?.content && (
                        <div className="mt-2.5 p-2.5 bg-slate-100/70 dark:bg-white/[0.04] rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          "{notif.post.content}"
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-2 flex items-center gap-1">
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Bell className="w-8 h-8 text-slate-400" />}
              title={filter === "unread" ? "Okunmamış Bildirim Yok" : "Henüz Bildirim Yok"}
              description={
                filter === "unread"
                  ? "Tüm bildirimlerinizi okudunuz! Yeni bir bildirim geldiğinde burada göreceksiniz."
                  : "Yeni bir beğeni, yorum, takipçi veya etkileşim aldığınızda burada listelenecektir."
              }
              action={
                filter === "unread"
                  ? { label: "Tüm Bildirimleri Gör", onClick: () => setFilter("all") }
                  : { label: "Topluluğu Keşfet", onClick: () => navigate("/explore") }
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
