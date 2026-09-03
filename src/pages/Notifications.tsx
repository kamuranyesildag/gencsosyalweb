import React, { useEffect } from "react";
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
import { fetchApi } from "../lib/api";
import { Avatar } from "../components/ui/Avatar";
import { formatTimeAgo } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";

export function Notifications() {
  const { data: notifications, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination("/notifications");
  const navigate = useNavigate();

  useEffect(() => {
    loadInitial();
    // Mark as read
    fetchApi("/notifications/read", { method: "PUT" }).catch(console.error);
  }, [loadInitial]);

  const getNotificationDetails = (type: string) => {
    switch (type) {
      case "like":
        return {
          icon: <Heart className="w-4.5 h-4.5 text-rose-600 fill-rose-600" />,
          bg: "bg-rose-50 border-rose-100 text-rose-600",
          text: "gönderini beğendi.",
        };
      case "project_like":
        return {
          icon: <Heart className="w-4.5 h-4.5 text-rose-600 fill-rose-600" />,
          bg: "bg-rose-50 border-rose-100 text-rose-600",
          text: "projeni beğendi.",
        };
      case "comment":
        return {
          icon: <MessageCircle className="w-4.5 h-4.5 text-slate-900 dark:text-slate-100 fill-slate-600" />,
          bg: "bg-slate-100 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100",
          text: "gönderine yorum yaptı.",
        };
      case "project_comment":
        return {
          icon: <MessageCircle className="w-4.5 h-4.5 text-slate-900 dark:text-slate-100 fill-slate-600" />,
          bg: "bg-slate-100 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100",
          text: "projene yorum yaptı.",
        };
      case "follow":
        return {
          icon: <UserPlus className="w-4.5 h-4.5 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
          text: "seni takip etmeye başladı.",
        };
      case "repost":
        return {
          icon: <Repeat2 className="w-4.5 h-4.5 text-teal-600 stroke-[2.5]" />,
          bg: "bg-teal-50 border-teal-100 text-teal-600",
          text: "gönderini yeniden paylaştı.",
        };
      case "post":
        return {
          icon: <Megaphone className="w-4.5 h-4.5 text-slate-900 dark:text-slate-100" />,
          bg: "bg-slate-100 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100",
          text: "yeni bir duyuru/gönderi paylaştı.",
        };
      case "verification":
      case "verified":
        return {
          icon: <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 fill-sky-100" />,
          bg: "bg-sky-50 border-sky-100 text-sky-600",
          text: "hesap doğrulama durumun güncellendi.",
        };
      case "collaborator_invite":
      case "project_invite":
        return {
          icon: <Users className="w-4.5 h-4.5 text-amber-600" />,
          bg: "bg-amber-50 border-amber-100 text-amber-600",
          text: "seni bir projede iş birliğine davet etti.",
        };
      default:
        return {
          icon: <Bell className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />,
          bg: "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400",
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

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-100 dark:border-slate-800 min-h-screen bg-white dark:bg-slate-950 select-none">
      {/* STICKY HEADER */}
      <header className="sticky top-16 z-20 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Bildirimler
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-xs rounded-full">
              {unreadCount} yeni
            </span>
          )}
        </div>
      </header>

      {/* NOTIFICATIONS LIST / SKELETON / EMPTY */}
      <div className="flex flex-col flex-1 pb-24">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4 p-4 sm:p-5 items-start">
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
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
<InfiniteScroll items={notifications} hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore} renderItem={(notif) => {const details = getNotificationDetails(notif.type);
                const isUnread = !notif.isRead;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 transition-colors cursor-pointer group relative ${
                      isUnread
                        ? "bg-slate-100/40 hover:bg-slate-100/70"
                        : "hover:bg-slate-50/80 bg-white dark:bg-slate-950"
                    }`}
                  >
                    {/* Unread Left Border Highlight Indicator */}
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                    )}

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
                                className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all"
                              />
                            </Link>
                          )}
                          <Link
                            to={notif.actor ? `/profile/${notif.actor.username}` : "#"}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-slate-900 dark:text-slate-100 transition-colors text-sm sm:text-[15px]"
                          >
                            {notif.actor?.displayName || notif.actor?.username || "Genç Sosyal"}
                          </Link>
                          {notif.actor?.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100 fill-slate-100 shrink-0" />
                          )}
                        </div>

                        {/* Unread Status Dot */}
                        {isUnread && (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-slate-100 shrink-0 mt-1" />
                        )}
                      </div>

                      {/* Text Description */}
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                        {details.text}
                      </p>

                      {/* Post / Content Snippet if available */}
                      {notif.post?.content && (
                        <div className="mt-2 p-2.5 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/70 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          "{notif.post.content}"
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );}} />
</div>
        ) : (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Bell className="w-8 h-8 text-slate-400" />}
              title="Henüz Bildirim Yok"
              description="Yeni bir beğeni, yorum, takipçi veya etkileşim aldığınızda burada listelenecektir."
              action={{ label: "Topluluğu Keşfet", onClick: () => navigate("/explore") }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
