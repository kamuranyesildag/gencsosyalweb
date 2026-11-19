import { useSEO } from "../hooks/useSEO";
import React, { useEffect, useState, useMemo } from "react";
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
  ShieldCheck,
  CheckCheck,
  AlertTriangle,
  Settings,
  AtSign,
  Award,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { Avatar } from "../components/ui/Avatar";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { formatTimeAgo, cn } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle } from "../components/ui/Skeleton";
import { toast } from "../components/ui/Toast";

type NotifFilter = "all" | "follow" | "like" | "comment" | "mention";

export function Notifications() {
  useSEO({ allowIndexing: false, title: "Bildirimler | Genç Sosyal" });
  const {
    data: notifications,
    loading,
    loadingMore,
    hasMore,
    loadInitial,
    loadMore,
    setData,
  } = usePagination("/notifications");
  const [filter, setFilter] = useState<NotifFilter>("all");
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [followedBackIds, setFollowedBackIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleMarkAllAsRead = async () => {
    if (isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await fetchApi("/notifications/read", { method: "PUT" });
      setData((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Tüm bildirimler okundu olarak işaretlendi.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const getNotificationDetails = (type: string) => {
    switch (type) {
      case "like":
      case "project_like":
        return {
          icon: <Heart className="w-3 h-3 text-white fill-white" />,
          badgeBg: "bg-rose-500",
          text: type === "project_like" ? "projeni beğendi." : "gönderini beğendi.",
        };
      case "comment":
      case "project_comment":
        return {
          icon: <MessageCircle className="w-3 h-3 text-white fill-white" />,
          badgeBg: "bg-emerald-500",
          text: type === "project_comment" ? "projene yorum yaptı:" : "yorum yaptı:",
        };
      case "follow":
      case "follow_request":
      case "follow_accepted":
        return {
          icon: <UserPlus className="w-3 h-3 text-white" />,
          badgeBg: "bg-blue-600",
          text:
            type === "follow_request"
              ? "sana takip isteği gönderdi."
              : type === "follow_accepted"
              ? "takip isteğini kabul etti."
              : "seni takip etmeye başladı.",
        };
      case "repost":
        return {
          icon: <Repeat2 className="w-3 h-3 text-white" />,
          badgeBg: "bg-teal-500",
          text: "gönderini yeniden paylaştı.",
        };
      case "mention":
        return {
          icon: <AtSign className="w-3 h-3 text-white" />,
          badgeBg: "bg-amber-500",
          text: "bir gönderide senden bahsetti:",
        };
      case "verification":
      case "verified":
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-white" />,
          badgeBg: "bg-sky-500",
          text: "hesap doğrulama durumun güncellendi.",
        };
      default:
        return {
          icon: <Bell className="w-3 h-3 text-white" />,
          badgeBg: "bg-indigo-600",
          text: "yeni bir bildirim gönderdi.",
        };
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      fetchApi(`/notifications/${notif.id}/read`, { method: "POST" }).catch(console.error);
      setData((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    }

    if (notif.type?.startsWith("community") || notif.community) {
      if (notif.community?.slug) {
        navigate(`/communities/${notif.community.slug}`);
      } else {
        navigate(`/communities`);
      }
    } else if (
      notif.type?.includes("collaborator_invite") ||
      notif.type?.includes("project_invite")
    ) {
      navigate(`/settings?tab=invites`);
    } else if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    } else if (notif.projectId) {
      navigate(
        notif.projectCommentId
          ? `/projects/${notif.projectId}#comment-${notif.projectCommentId}`
          : `/projects/${notif.projectId}`
      );
    } else if (notif.type === "follow" && notif.actor?.username) {
      navigate(`/profile/${notif.actor.username}`);
    } else if (notif.type === "verification") {
      navigate(`/settings?tab=verification`);
    }
  };

  const handleFollowBack = async (e: React.MouseEvent, actorId: number) => {
    e.stopPropagation();
    if (!actorId) return;
    setFollowedBackIds((prev) => new Set(prev).add(actorId));
    try {
      const res = await fetchApi(`/users/${actorId}/follow`, { method: "POST" });
      if (res.ok) {
        toast.success("Geri takip edildi!");
      }
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "follow") {
      return notifications.filter((n) => n.type?.startsWith("follow"));
    }
    if (filter === "like") {
      return notifications.filter((n) => n.type?.includes("like"));
    }
    if (filter === "comment") {
      return notifications.filter((n) => n.type?.includes("comment"));
    }
    if (filter === "mention") {
      return notifications.filter(
        (n) => n.type === "mention" || n.post?.content?.includes("@")
      );
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-[#F8FAFC] dark:bg-[#080E1A] transition-colors pb-24">
      {/* 1. STICKY HEADER (Matching Mockup 8) */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-[#F8FAFC]/95 dark:bg-[#080E1A]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 pt-3.5 pb-3 space-y-3 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Bildirimler
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} okunmamış bildirimin var`
                : "Tüm bildirimlerin güncel"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead || unreadCount === 0}
              title="Tümünü Okundu İşaretle"
              aria-label="Tümünü okundu işaretle"
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 disabled:opacity-45 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <CheckCheck className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              title="Bildirim Ayarları"
              aria-label="Bildirim ayarları"
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills: Tümü | Takip | Beğeni | Yorum | Bahsetme (Matching Mockup 8) */}
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Bildirim Filtresi"
        >
          {[
            { id: "all" as NotifFilter, label: "Tümü", count: unreadCount },
            { id: "follow" as NotifFilter, label: "Takip" },
            { id: "like" as NotifFilter, label: "Beğeni" },
            { id: "comment" as NotifFilter, label: "Yorum" },
            { id: "mention" as NotifFilter, label: "Bahsetme" },
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                  isSelected
                    ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500 shadow-xs"
                    : "bg-white dark:bg-[#0D1424] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-sky-400 dark:text-sky-200 font-black">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. NOTIFICATIONS STREAM WITH TIME SECTIONS */}
      <div className="flex flex-col flex-1 px-4 pt-4 space-y-5">
        {loading ? (
          <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3.5 p-4 items-start">
                <SkeletonCircle size="md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              BUGÜN & SON ETKİLEŞİMLER
            </div>

            <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden shadow-2xs">
              <InfiniteScroll
                items={filteredNotifications}
                hasMore={hasMore && filter === "all"}
                isLoading={loadingMore}
                onLoadMore={loadMore}
                renderItem={(notif) => {
                  const details = getNotificationDetails(notif.type);
                  const isUnread = !notif.isRead;
                  const isFollowedBack = followedBackIds.has(Number(notif.actor?.id));

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "flex items-center justify-between gap-3 p-4 transition-colors cursor-pointer group",
                        isUnread
                          ? "bg-blue-50/35 dark:bg-blue-950/15 hover:bg-blue-50/60"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Avatar with Type Badge Overlay (Matching Mockup 8) */}
                        <div className="relative shrink-0">
                          <Avatar
                            url={notif.actor?.avatarUrl}
                            name={
                              notif.actor?.displayName ||
                              notif.actor?.username ||
                              "Genç Sosyal"
                            }
                            size="md"
                            className="w-11 h-11 ring-1 ring-slate-200 dark:ring-white/10"
                          />
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center ring-2 ring-white dark:ring-[#0D1424]",
                              details.badgeBg
                            )}
                          >
                            {details.icon}
                          </div>
                        </div>

                        {/* Text & Snippet */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {notif.actor?.displayName ||
                                notif.actor?.username ||
                                "Genç Sosyal"}
                            </span>{" "}
                            <span>{details.text}</span>
                            {notif.post?.content && (
                              <span className="text-slate-500 dark:text-slate-400">
                                {" "}
                                &quot;{notif.post.content.slice(0, 80)}&quot;
                              </span>
                            )}
                          </p>

                          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                            {formatTimeAgo(notif.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Button & Unread Dot */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {notif.type === "follow" && notif.actor?.id && (
                          <button
                            type="button"
                            onClick={(e) => handleFollowBack(e, Number(notif.actor.id))}
                            className={cn(
                              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer",
                              isFollowedBack
                                ? "bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                            )}
                          >
                            {isFollowedBack ? "Takip Ediliyor" : "Geri Takip Et"}
                          </button>
                        )}

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] px-6 py-14 text-center shadow-2xs">
            <EmptyState
              icon={<Bell className="w-8 h-8 text-slate-400" />}
              title="Bildirim Bulunamadı"
              description="Yeni bir beğeni, yorum, takipçi veya topluluk etkileşimi aldığınızda burada listelenecektir."
              action={{
                label: "Topluluğu Keşfet",
                onClick: () => navigate("/explore"),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
