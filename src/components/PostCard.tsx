import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { VerifiedBadge } from "./VerifiedBadge";
import {
  ShieldAlert,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Share2,
  Eye,
  Link2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { RichText } from "./RichText";
import { ReportDialog } from "./ReportDialog";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownDivider } from "./ui/Dropdown";
import { formatTimeAgo, cn } from "../lib/utils";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "./ui/Toast";
import { confirmDialog } from "./ui/ConfirmDialog";

interface PostCardProps {
  post: any;
  key?: React.Key;
  onPostDeleted?: (id: number) => void;
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const navigate = useNavigate();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [reposted, setReposted] = useState(post.isReposted || false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [pollData, setPollData] = useState(post.pollData);
  const [isVoting, setIsVoting] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(post.user?.isFollowing || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  useEffect(() => {
    setIsFollowingUser(post.user?.isFollowing || false);
  }, [post.user?.isFollowing]);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [currentContent, setCurrentContent] = useState(post.content);
  const [, setIsDeleting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwner = currentUser?.id === post.userId;

  // View tracking observer
  const articleRef = useRef<HTMLElement>(null);
  const hasViewed = useRef(false);

  useEffect(() => {
    if (!articleRef.current || hasViewed.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasViewed.current) {
          hasViewed.current = true;
          fetchApi("/feed/view", {
            method: "POST",
            data: { postId: post.id },
          }).catch((err) => {
            console.error("View tracking failed", err);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(articleRef.current);
    return () => observer.disconnect();
  }, [post.id]);

  // Poll Vote Handler
  const handleVote = async (e: React.MouseEvent, optionId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isVoting || pollData?.userVotedOptionId) return;

    setIsVoting(true);
    try {
      const res = await fetchApi(`/posts/${post.id}/poll/vote`, {
        method: "POST",
        data: { optionId },
      });
      if (res.ok) {
        setPollData((prev: any) => {
          if (!prev) return prev;
          const newOptions = prev.options.map((o: any) =>
            o.id === optionId ? { ...o, voteCount: (o.voteCount || 0) + 1 } : o
          );
          return {
            ...prev,
            options: newOptions,
            totalVotes: (prev.totalVotes || 0) + 1,
            userVotedOptionId: optionId,
          };
        });
        toast.success("Oyunuz kaydedildi!");
      } else {
        toast.error("Oy verme başarısız.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Oy verme başarısız.");
    } finally {
      setIsVoting(false);
    }
  };

  // Lightbox scroll lock & esc key
  useEffect(() => {
    if (selectedMediaIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMediaIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMediaIndex !== null) {
        setSelectedMediaIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMediaIndex]);

  // Follow Handler
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isFollowLoading || !post.user?.id) return;

    setIsFollowLoading(true);
    // Optimistic
    const prev = isFollowingUser;
    setIsFollowingUser(true); // Since button disappears when followed

    try {
      const res = await fetchApi(`/users/${post.user.id}/follow`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setIsFollowingUser(prev);
        toast.error(json.error?.message || "Takip edilemedi");
      } else {
        toast.success("Takip edildi");
      }
    } catch {
      setIsFollowingUser(prev);
      toast.error("Bir hata oluştu");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Like Handler
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isLiking) return;
    setIsLiking(true);

    const isCurrentlyLiked = liked;
    const currentLikeCount = likeCount;

    try {
      setLiked(!isCurrentlyLiked);
      setLikeCount(isCurrentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1);

      const res = await fetchApi(`/posts/${post.id}/like`, {
        method: isCurrentlyLiked ? "DELETE" : "POST",
      });
      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(currentLikeCount);
      }
    } catch (e) {
      console.error(e);
      setLiked(isCurrentlyLiked);
      setLikeCount(currentLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  // Repost Handler
  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isReposting) return;
    setIsReposting(true);

    const isCurrentlyReposted = reposted;
    const currentRepostCount = repostCount;

    try {
      setReposted(!isCurrentlyReposted);
      setRepostCount(isCurrentlyReposted ? currentRepostCount - 1 : currentRepostCount + 1);

      const res = await fetchApi(`/posts/${post.id}/repost`, {
        method: isCurrentlyReposted ? "DELETE" : "POST",
      });
      if (!res.ok) {
        setReposted(isCurrentlyReposted);
        setRepostCount(currentRepostCount);
      } else {
        if (!isCurrentlyReposted) toast.success("Gönderi yeniden paylaşıldı!");
      }
    } catch (e) {
      console.error(e);
      setReposted(isCurrentlyReposted);
      setRepostCount(currentRepostCount);
    } finally {
      setIsReposting(false);
    }
  };

  // Bookmark Handler
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isSaving) return;
    setIsSaving(true);

    const isCurrentlySaved = saved;

    try {
      setSaved(!isCurrentlySaved);
      const res = await fetchApi(`/posts/${post.id}/bookmark`, {
        method: isCurrentlySaved ? "DELETE" : "POST",
      });
      if (!res.ok) {
        setSaved(isCurrentlySaved);
      } else {
        if (!isCurrentlySaved) toast.success("Kaydedilenlere eklendi!");
        else toast.info("Kaydedilenlerden kaldırıldı.");
      }
    } catch (e) {
      console.error(e);
      setSaved(isCurrentlySaved);
    } finally {
      setIsSaving(false);
    }
  };

  // Share Handler
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareTitle = `${post.user?.displayName || post.user?.username} - Genç Sosyal`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: currentContent?.slice(0, 100),
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Gönderi bağlantısı panoya kopyalandı!");
    } catch {
      toast.error("Bağlantı kopyalanamadı.");
    }
  };

  // Delete Handler
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !(await confirmDialog(
        "Gönderiyi Sil",
        "Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      ))
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Gönderi silindi.");
        if (onPostDeleted) onPostDeleted(post.id);
      } else {
        toast.error("Gönderi silinemedi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Silme işleminde hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit Handler
  const handleEditSubmit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetchApi(`/posts/${post.id}`, {
        method: "PATCH",
        data: { content: editContent },
      });
      if (res.ok) {
        setCurrentContent(editContent);
        setIsEditing(false);
        toast.success("Gönderi güncellendi.");
      } else {
        toast.error("Güncelleme başarısız.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Güncelleme başarısız.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <article
      ref={articleRef}
      id={`post-${post.id}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("button") && !target.closest("a") && !target.closest("textarea")) {
          navigate(`/post/${post.id}`);
        }
      }}
      className={cn(
        "group relative flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 mb-2.5 mx-2 sm:mx-4",
        "bg-white dark:bg-[#0D121D]",
        "border border-slate-200/80 dark:border-white/[0.08]",
        "rounded-2xl sm:rounded-2xl",
        "shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-white/[0.14]",
        "cursor-pointer transition-all duration-200",
        post.postType === "SENSITIVE" && !isRevealed && "opacity-95"
      )}
    >
      {/* 1. LEFT COLUMN: Author Avatar (Desktop) */}
      <div className="hidden sm:block shrink-0">
        <Link
          to={`/profile/${post.user?.username}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${post.user?.displayName || post.user?.username} profili`}
          className="block rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Avatar
            url={post.user?.avatarUrl}
            name={post.user?.displayName || post.user?.username}
            size="md"
            className="hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      {/* 2. RIGHT COLUMN: Main Post Structure */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header: Author info, Metadata, Options Menu */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
            {/* Mobile Avatar */}
            <div className="sm:hidden shrink-0">
              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${post.user?.displayName || post.user?.username} profili`}
              >
                <Avatar
                  url={post.user?.avatarUrl}
                  name={post.user?.displayName || post.user?.username}
                  size="sm"
                />
              </Link>
            </div>

            {/* Display Name & Verified Badge */}
            <Link
              to={`/profile/${post.user?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 min-w-0 truncate group/author"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] group-hover/author:underline truncate">
                {post.user?.displayName || post.user?.username}
              </span>
              {post.user?.isVerified && (
                <VerifiedBadge
                  iconClassName="w-4 h-4 text-blue-500"
                  targetUser={{ username: post.user.username, isVerified: !!post.user.isVerified }}
                />
              )}
            </Link>

            {/* Follow Button */}
            {currentUser?.id !== post.user?.id && !isFollowingUser && (
              <>
                <span className="text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">&middot;</span>
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-[14px] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {post.user?.followsMe ? "Sende Takip Et" : "Takip Et"}
                </button>
              </>
            )}

            {/* Handle & Timestamp */}
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] shrink-0 font-normal">
              <span className="hidden sm:inline">@{post.user?.username}</span>
              <span className="hidden sm:inline opacity-60">&middot;</span>
              <time dateTime={post.createdAt} className="hover:underline">
                {formatTimeAgo(post.createdAt)}
              </time>
              {post.visibility && (
                <span
                  className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 select-none ml-0.5"
                  title={
                    post.visibility === "PUBLIC"
                      ? "Herkese Açık"
                      : post.visibility === "FOLLOWERS"
                      ? "Sadece Takipçiler"
                      : "Yalnızca Ben"
                  }
                  aria-label={
                    post.visibility === "PUBLIC"
                      ? "Görünürlük: Herkese Açık"
                      : post.visibility === "FOLLOWERS"
                      ? "Görünürlük: Sadece Takipçiler"
                      : "Görünürlük: Yalnızca Ben"
                  }
                >
                  <span className="opacity-40">&middot;</span>
                  {post.visibility === "PUBLIC" && <Globe className="w-3.5 h-3.5 opacity-70" />}
                  {post.visibility === "FOLLOWERS" && <Users className="w-3.5 h-3.5 opacity-70" />}
                  {post.visibility === "PRIVATE" && <Lock className="w-3.5 h-3.5 opacity-70" />}
                </span>
              )}
            </div>
          </div>

          {/* Post Options Dropdown Menu */}
          <div className="shrink-0 -mr-1" onClick={(e) => e.stopPropagation()}>
            <Dropdown>
              <DropdownTrigger>
                <button
                  type="button"
                  aria-label="Gönderi seçenekleri"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
                >
                  <MoreHorizontal className="w-4.5 h-4.5" />
                </button>
              </DropdownTrigger>
              <DropdownContent align="right" className="w-48">
                <DropdownItem
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    toast.success("Bağlantı kopyalandı");
                  }}
                >
                  <Link2 className="w-4 h-4 mr-2 text-slate-500" /> Bağlantıyı Kopyala
                </DropdownItem>
                {isOwner ? (
                  <>
                    <DropdownItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2 text-slate-500" /> Düzenle
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      onClick={handleDelete}
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Sil
                    </DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownItem
                      onClick={() => setShowReportDialog(true)}
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Bildir
                    </DropdownItem>
                  </>
                )}
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        {/* Content Body: Text, Poll, Media */}
        {isEditing ? (
          <div className="mt-2 mb-3" onClick={(e) => e.stopPropagation()}>
            <textarea
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-[15px] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none min-h-[100px] leading-relaxed"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(currentContent);
                }}
              >
                İptal
              </Button>
              <Button
                size="sm"
                variant="primary"
                isLoading={isSubmittingEdit}
                onClick={handleEditSubmit}
              >
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 break-words">
            {post.postType === "SENSITIVE" && !isRevealed ? (
              <div className="p-4 my-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-center">
                <ShieldAlert className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {post.contentWarning || "Hassas İçerik"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Bu gönderi içerik uyarısı nedeniyle gizlenmiştir.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRevealed(true);
                  }}
                  className="rounded-lg"
                >
                  Yine de Göster
                </Button>
              </div>
            ) : (
              <>
                {currentContent && (
                  <div className="mb-2">
                    <RichText text={currentContent} />
                  </div>
                )}

                {/* Poll Section */}
                {pollData && (
                  <div
                    className="mt-3 mb-2 border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {pollData.options.map((opt: any, i: number) => {
                      const totalVotes =
                        pollData.options.reduce(
                          (acc: number, curr: any) => acc + (curr.votes || curr.voteCount || 0),
                          0
                        ) || 0;
                      const optVotes = opt.votes || opt.voteCount || 0;
                      const percent = totalVotes === 0 ? 0 : Math.round((optVotes / totalVotes) * 100);
                      const isVotedByMe =
                        pollData.userVotedIndex === i || pollData.userVotedOptionId === opt.id;

                      return (
                        <button
                          key={opt.id || i}
                          type="button"
                          disabled={isVoting || pollData.userVotedIndex !== undefined || !!pollData.userVotedOptionId}
                          onClick={(e) => handleVote(e, opt.id || i)}
                          className={cn(
                            "relative w-full flex items-center justify-between p-3 border-b border-slate-100 dark:border-white/[0.06] last:border-0 transition-colors text-left",
                            pollData.userVotedIndex === undefined && !pollData.userVotedOptionId
                              ? "hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer"
                              : "cursor-default"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 transition-all duration-500 ease-out",
                              isVotedByMe
                                ? "bg-blue-100/70 dark:bg-blue-950/50"
                                : "bg-slate-200/50 dark:bg-slate-800/50"
                            )}
                            style={{
                              width: `${
                                pollData.userVotedIndex !== undefined || pollData.userVotedOptionId
                                  ? percent
                                  : 0
                              }%`,
                            }}
                          />
                          <span
                            className={cn(
                              "relative z-10 text-sm font-medium",
                              isVotedByMe
                                ? "text-blue-700 dark:text-blue-300 font-semibold"
                                : "text-slate-800 dark:text-slate-200"
                            )}
                          >
                            {opt.text}
                          </span>
                          <span className="relative z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                            {pollData.userVotedIndex !== undefined || pollData.userVotedOptionId
                              ? `%${percent}`
                              : ""}
                          </span>
                        </button>
                      );
                    })}
                    <div className="px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/60 font-medium">
                      Toplam{" "}
                      {pollData.options.reduce(
                        (acc: number, curr: any) => acc + (curr.votes || curr.voteCount || 0),
                        0
                      )}{" "}
                      oy
                    </div>
                  </div>
                )}

                {/* Media Grid */}
                {post.media && post.media.length > 0 && (
                  <div
                    className={cn(
                      "mt-2.5 mb-1 grid gap-1.5 rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08]",
                      post.media.length === 1
                        ? "grid-cols-1"
                        : post.media.length === 2
                        ? "grid-cols-2"
                        : post.media.length === 3
                        ? "grid-cols-2"
                        : "grid-cols-2"
                    )}
                  >
                    {post.media.map((mediaItem: any, i: number) => {
                      const mUrl =
                        typeof mediaItem === "string"
                          ? mediaItem
                          : mediaItem.url || mediaItem.mediaUrl || "";
                      const mType =
                        typeof mediaItem === "string"
                          ? ""
                          : mediaItem.type || mediaItem.mediaType || "";
                      const isVideo =
                        mType.includes("video") ||
                        mUrl.match(/\.(mp4|webm|ogg)$/i) ||
                        mUrl.includes("video");

                      return (
                        <div
                          key={i}
                          className={cn(
                            "relative bg-slate-100 dark:bg-slate-900 overflow-hidden",
                            post.media.length === 1
                              ? "aspect-[16/10] sm:aspect-auto sm:max-h-[480px]"
                              : post.media.length === 3 && i === 0
                              ? "row-span-2 aspect-auto min-h-[220px]"
                              : "aspect-square"
                          )}
                        >
                          {isVideo ? (
                            <video
                              src={mUrl}
                              controls
                              playsInline
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedMediaIndex(i);
                              }}
                            />
                          ) : (
                            <img
                              src={mUrl}
                              alt="Gönderi görseli"
                              loading="lazy"
                              className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedMediaIndex(i);
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 3. INTERACTION ACTION BAR */}
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-2.5 mt-1 select-none border-t border-slate-100 dark:border-white/[0.04]">
          {/* Comment Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post.id}`);
            }}
            aria-label={`${post.commentCount || 0} yorum. Yorum yap.`}
            className="group/btn flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-blue-50/60 dark:hover:bg-blue-950/30"
          >
            <MessageCircle className="w-4.5 h-4.5 stroke-[1.75]" />
            <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
              {post.commentCount || 0}
            </span>
          </motion.button>

          {/* Repost Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleRepost}
            aria-label={`${repostCount} yeniden paylaşım. Yeniden paylaş.`}
            className={cn(
              "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
              reposted
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
            )}
          >
            <Repeat2 className={cn("w-4.5 h-4.5", reposted ? "stroke-[2.2]" : "stroke-[1.75]")} />
            <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
              {repostCount}
            </span>
          </motion.button>

          {/* Like Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleLike}
            aria-label={`${likeCount} beğeni. ${liked ? "Beğeniyi geri al" : "Beğen"}`}
            className={cn(
              "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
              liked
                ? "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30"
                : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30"
            )}
          >
            <Heart
              className={cn(
                "w-4.5 h-4.5",
                liked ? "fill-rose-600 dark:fill-rose-500 stroke-rose-600 dark:stroke-rose-500" : "stroke-[1.75]"
              )}
            />
            <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
              {likeCount}
            </span>
          </motion.button>

          {/* View Count (Subtle) */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-slate-400 dark:text-slate-500 py-1.5 px-1.5"
            title={`${post.viewCount || 0} görüntülenme`}
          >
            <Eye className="w-4 h-4 stroke-[1.75]" />
            <span className="text-xs font-medium">{post.viewCount || 0}</span>
          </div>

          {/* Bookmark & Share (Grouped Actions) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleBookmark}
              aria-label={saved ? "Kaydedilenlerden kaldır" : "Kaydet"}
              className={cn(
                "group/btn p-1.5 rounded-lg transition-colors",
                saved
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30"
              )}
            >
              <Bookmark
                className={cn(
                  "w-4.5 h-4.5",
                  saved ? "fill-blue-600 dark:fill-blue-400 stroke-blue-600 dark:stroke-blue-400" : "stroke-[1.75]"
                )}
              />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleShare}
              aria-label="Paylaş"
              className="group/btn p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors"
            >
              <Share2 className="w-4.5 h-4.5 stroke-[1.75]" />
            </motion.button>
          </div>
        </div>
      </div>

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="post"
        targetId={post.id}
      />

      {/* Media Lightbox Viewer Portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedMediaIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMediaIndex(null);
                }}
              >
                {/* Lightbox Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 w-full absolute top-0 left-0 z-50 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <Avatar url={post.user?.avatarUrl} size="md" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm sm:text-base drop-shadow-md">
                          {post.user?.displayName || post.user?.username}
                        </span>
                        {post.user?.isVerified && (
                          <VerifiedBadge
                            iconClassName="w-4 h-4 text-blue-400"
                            targetUser={{
                              username: post.user.username,
                              isVerified: !!post.user.isVerified,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-white/70">@{post.user?.username}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMediaIndex(null);
                    }}
                    aria-label="Kapat"
                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors pointer-events-auto cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Lightbox Media Stage */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full h-full pointer-events-none p-4">
                  {post.media.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaIndex((prev) =>
                            prev !== null
                              ? prev === 0
                                ? post.media.length - 1
                                : prev - 1
                              : 0
                          );
                        }}
                        aria-label="Önceki medya"
                        className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md z-50 transition-all pointer-events-auto cursor-pointer"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaIndex((prev) =>
                            prev !== null
                              ? prev === post.media.length - 1
                                ? 0
                                : prev + 1
                              : 0
                          );
                        }}
                        aria-label="Sonraki medya"
                        className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md z-50 transition-all pointer-events-auto cursor-pointer"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {(() => {
                    const mItem = post.media[selectedMediaIndex];
                    const mUrl =
                      typeof mItem === "string" ? mItem : mItem.url || mItem.mediaUrl || "";
                    const mType =
                      typeof mItem === "string" ? "" : mItem.type || mItem.mediaType || "";
                    const isVideo =
                      mType.includes("video") ||
                      mUrl.match(/\.(mp4|webm|ogg)$/i) ||
                      mUrl.includes("video");

                    return isVideo ? (
                      <video
                        src={mUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-[85vh] object-contain pointer-events-auto rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={mUrl}
                        alt="Büyütülmüş Görsel"
                        className="max-w-full max-h-[85vh] object-contain pointer-events-auto rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </article>
  );
}
