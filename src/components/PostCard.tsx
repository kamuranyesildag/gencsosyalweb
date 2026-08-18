import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldAlert,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  Smile,
  Share2,
  Eye,
  EyeOff,
  Link2,
  Loader2,
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { RichText } from "./RichText";
import { VerificationBottomSheet } from "./VerificationBottomSheet";
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
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [showVerification, setShowVerification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [currentContent, setCurrentContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
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

  // Reaction handler
  const handleReaction = async (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    setShowReactions(false);
    try {
      await fetchApi(`/posts/${post.id}/reaction`, {
        method: "POST",
        data: { type },
      });
      toast.success("Tepkiniz iletildi!");
    } catch (err) {
      console.error(err);
    }
  };

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
    if (!(await confirmDialog("Gönderiyi Sil", "Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."))) {
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

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <article
      ref={articleRef}
      onClick={handlePostClick}
      className="border-b border-slate-200/50 p-4 sm:p-5 hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer group select-none relative bg-white"
      aria-label={`${post.user?.displayName || post.user?.username} adlı kullanıcının gönderisi`}
    >
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* 1. Author Avatar */}
        <Link
          to={`/profile/${post.user?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-full mt-0.5"
          aria-label={`${post.user?.displayName || post.user?.username} profili`}
        >
          <Avatar
            url={post.user?.avatarUrl}
            name={post.user?.displayName || post.user?.username}
            size="md"
            className="ring-2 ring-white shadow-xs group-hover:shadow-md transition-all duration-300"
          />
        </Link>

        {/* 2. Main Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Author Info & Timestamp & Dropdown Menu */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm sm:text-[15px] min-w-0 pr-2">
              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-extrabold text-slate-900 hover:text-indigo-600 hover:underline truncate transition-colors tracking-tight text-[15px]"
              >
                {post.user?.displayName || post.user?.username}
              </Link>

              {post.user?.isVerified && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowVerification(true);
                  }}
                  className="focus:outline-none cursor-pointer inline-flex items-center shrink-0"
                  aria-label="Doğrulanmış Hesap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 fill-indigo-100 shrink-0" />
                </button>
              )}

              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-500 font-medium truncate text-xs sm:text-sm hover:text-slate-700"
              >
                @{post.user?.username}
              </Link>

              <span className="text-slate-300 shrink-0 select-none text-xs">·</span>

              <span className="text-slate-400 shrink-0 text-xs sm:text-sm font-medium">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>

            {/* Header More Dropdown Menu */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <Dropdown>
                <DropdownTrigger>
                  <div
                    role="button"
                    aria-label="Daha fazla seçenek"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <MoreHorizontal className="w-4.5 h-4.5" />
                  </div>
                </DropdownTrigger>
                <DropdownContent align="right" width="w-48">
                  {isOwner ? (
                    <>
                      <DropdownItem
                        icon={<Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
                        onClick={() => setIsEditing(true)}
                      >
                        Düzenle
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem
                        icon={<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />}
                        isDanger
                        disabled={isDeleting}
                        onClick={handleDelete}
                      >
                        Sil
                      </DropdownItem>
                    </>
                  ) : (
                    <>
                      <DropdownItem
                        icon={<Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
                        onClick={handleShare}
                      >
                        Bağlantıyı Kopyala
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem
                        icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />}
                        isDanger
                        onClick={() => setShowReportDialog(true)}
                      >
                        Gönderiyi Bildir
                      </DropdownItem>
                    </>
                  )}
                </DropdownContent>
              </Dropdown>
            </div>
          </div>

          {/* SENSITIVE CONTENT WRAPPER */}
          {post.postType === "SENSITIVE" && !isRevealed ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 shadow-xs">
                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">İçerik Uyarısı</h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-sm font-medium leading-relaxed">
                {post.contentWarning || "Bu gönderi hassas veya tetikleyici unsurlar içerebilir."}
              </p>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                onClick={() => setIsRevealed(true)}
                className="bg-white border-slate-200/90 text-slate-800 font-bold hover:bg-slate-50 shadow-xs"
              >
                İçeriği Göster
              </Button>
            </div>
          ) : (
            <motion.div
              initial={post.postType === "SENSITIVE" ? { opacity: 0, filter: "blur(8px)" } : false}
              animate={post.postType === "SENSITIVE" ? { opacity: 1, filter: "blur(0px)" } : false}
              transition={{ duration: 0.25 }}
            >
              {/* Sensitive Header Re-hide Banner */}
              {post.postType === "SENSITIVE" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs font-semibold text-amber-800"
                >
                  <span className="truncate">⚠️ {post.contentWarning || "Hassas İçerik"}</span>
                  <button
                    type="button"
                    onClick={() => setIsRevealed(false)}
                    className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-950 font-bold ml-2 underline underline-offset-2 shrink-0"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Gizle</span>
                  </button>
                </div>
              )}

              {/* TEXT CONTENT OR EDITING FORM */}
              {post.postType !== "POLL" && (
                <div className="text-slate-900 whitespace-pre-wrap break-words mb-3 text-[15px] sm:text-base leading-relaxed">
                  {isEditing ? (
                    <div className="flex flex-col gap-2 my-2" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm sm:text-base text-slate-900 min-h-[100px] leading-relaxed"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            setEditContent(currentContent);
                          }}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!editContent.trim()}
                          isLoading={isSubmittingEdit}
                          onClick={handleEditSubmit}
                        >
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <RichText text={currentContent} />
                  )}
                </div>
              )}

              {/* POLL UI */}
              {post.postType === "POLL" && pollData && (
                <div className="mt-1 mb-4 flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-[15px] sm:text-base text-slate-900 font-bold mb-1 leading-relaxed whitespace-pre-wrap break-words">
                    {currentContent}
                  </h3>

                  <div className="flex flex-col gap-2">
                    {pollData.options?.map((opt: any, idx: number) => {
                      const hasVoted = !!pollData.userVotedOptionId;
                      const isSelected = pollData.userVotedOptionId === opt.id;
                      const percentage =
                        pollData.totalVotes > 0
                          ? Math.round((opt.voteCount / pollData.totalVotes) * 100)
                          : 0;

                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          disabled={hasVoted || isVoting}
                          whileTap={hasVoted ? undefined : { scale: 0.98 }}
                          onClick={(e) => handleVote(e, opt.id)}
                          className={cn(
                            "relative overflow-hidden w-full text-left rounded-2xl border p-3.5 transition-all duration-200 min-h-[46px] flex items-center justify-between",
                            hasVoted
                              ? "border-slate-200/90 bg-slate-50/50 cursor-default"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 active:bg-indigo-50 cursor-pointer shadow-xs",
                            isSelected && "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                          )}
                        >
                          {/* Animated Progress Bar */}
                          {hasVoted && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-xl",
                                isSelected ? "bg-indigo-500/15" : "bg-slate-200/60"
                              )}
                            />
                          )}

                          {/* Left: Option text / radio */}
                          <div className="relative z-10 flex items-center gap-2.5 min-w-0 pr-2">
                            {!hasVoted && (
                              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                {idx + 1}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-sm sm:text-[15px] truncate",
                                isSelected
                                  ? "font-bold text-indigo-950"
                                  : "font-semibold text-slate-800"
                              )}
                            >
                              {opt.text}
                            </span>
                          </div>

                          {/* Right: Percentage and Checkmark */}
                          {hasVoted && (
                            <div className="relative z-10 flex items-center gap-2 shrink-0">
                              {isSelected && (
                                <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600 fill-indigo-100 shrink-0" />
                              )}
                              <span
                                className={cn(
                                  "text-sm font-extrabold",
                                  isSelected ? "text-indigo-600" : "text-slate-600"
                                )}
                              >
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-1 px-1">
                    <span>{pollData.totalVotes || 0} toplam oy</span>
                    {pollData.userVotedOptionId && (
                      <span className="text-indigo-600 font-semibold">Oyunuz kaydedildi</span>
                    )}
                  </div>
                </div>
              )}

              {/* MEDIA GALLERY */}
              {post.media && post.media.length > 0 && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "grid gap-2 mb-3.5 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-xs",
                    post.media.length === 1
                      ? "grid-cols-1"
                      : post.media.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 grid-rows-2"
                  )}
                >
                  {post.media.map((m: any, i: number) => {
                    const isVideo = m.type === "video" || m.mediaType === "video";
                    const mediaUrl = m.url || m.mediaUrl;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "relative bg-slate-900 overflow-hidden",
                          post.media.length === 1
                            ? "aspect-video max-h-[420px]"
                            : post.media.length === 3 && i === 0
                            ? "row-span-2 aspect-square"
                            : "aspect-video sm:aspect-[4/3]"
                        )}
                      >
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt="Gönderi Medyası"
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* 3. INTERACTION ACTION BAR */}
          <div className="flex items-center justify-between text-slate-500 max-w-md pt-1 mt-1 select-none">
            {/* Comment Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post.id}`);
              }}
              aria-label={`Yorumlar (${post.commentCount || 0})`}
              className="flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 active:bg-indigo-100 transition-colors group/btn min-h-[36px]"
            >
              <MessageCircle className="w-4.5 h-4.5 stroke-[1.8] group-hover/btn:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold">{post.commentCount || 0}</span>
            </motion.button>

            {/* Repost Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleRepost}
              aria-label={`Yeniden Paylaş (${repostCount})`}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-2 rounded-xl transition-colors group/btn min-h-[36px]",
                reposted
                  ? "text-emerald-600 bg-emerald-50/80 font-bold"
                  : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80 active:bg-emerald-100"
              )}
            >
              <Repeat2
                className={cn(
                  "w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform",
                  reposted ? "stroke-[2.5]" : "stroke-[1.8]"
                )}
              />
              <span className="text-xs sm:text-sm font-semibold">{repostCount}</span>
            </motion.button>

            {/* Like Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleLike}
              aria-label={`Beğen (${likeCount})`}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-2 rounded-xl transition-colors group/btn min-h-[36px]",
                liked
                  ? "text-rose-600 bg-rose-50/80 font-bold"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 active:bg-rose-100"
              )}
            >
              <Heart
                className={cn(
                  "w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform",
                  liked ? "fill-rose-600 stroke-rose-600" : "stroke-[1.8]"
                )}
              />
              <span className="text-xs sm:text-sm font-semibold">{likeCount}</span>
            </motion.button>

            {/* Bookmark Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleBookmark}
              aria-label={saved ? "Kaydedilenlerden Çıkar" : "Kaydet"}
              className={cn(
                "flex items-center justify-center p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px]",
                saved
                  ? "text-indigo-600 bg-indigo-50/80"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 active:bg-indigo-100"
              )}
            >
              <Bookmark
                className={cn(
                  "w-4.5 h-4.5 transition-transform",
                  saved ? "fill-indigo-600 stroke-indigo-600" : "stroke-[1.8]"
                )}
              />
            </motion.button>

            {/* Share / Reactions Menu */}
            <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactions(!showReactions);
                }}
                aria-label="Tepkiler ve Paylaş"
                className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50/80 active:bg-amber-100 transition-colors min-h-[36px] min-w-[36px]"
              >
                <Smile className="w-4.5 h-4.5 stroke-[1.8]" />
              </motion.button>

              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute bottom-full right-0 mb-2.5 bg-white border border-slate-200/90 rounded-full shadow-xl shadow-slate-900/10 p-1.5 flex items-center gap-1 z-30"
                  >
                    {[
                      { emoji: "❤️", type: "love", label: "Sevgi" },
                      { emoji: "🔥", type: "fire", label: "Ateş" },
                      { emoji: "😂", type: "haha", label: "Gülme" },
                      { emoji: "🚀", type: "rocket", label: "Roket" },
                      { emoji: "👏", type: "clap", label: "Alkış" },
                      { emoji: "😢", type: "sad", label: "Üzücü" },
                    ].map((r) => (
                      <button
                        key={r.type}
                        type="button"
                        onClick={(e) => handleReaction(r.type, e)}
                        aria-label={r.label}
                        className="text-lg hover:scale-130 active:scale-100 transition-transform p-1.5 rounded-full hover:bg-slate-100"
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Report Modals */}
      <VerificationBottomSheet
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
      />
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="post"
        targetId={post.id}
      />
    </article>
  );
}
