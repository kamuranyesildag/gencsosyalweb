import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { VerifiedBadge } from "./VerifiedBadge";
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
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          navigate(`/post/${post.id}`);
        }
      }}
      className={cn(
        "group flex flex-col sm:flex-row gap-3 p-4 sm:p-5 mb-3 mx-2 sm:mx-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-2xl sm:rounded-[24px] shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-300",
        post.type === "SENSITIVE" && !isRevealed && "opacity-90"
      )}
    >
      {/* 1. LEFT COLUMN: Avatar */}
      <div className="hidden sm:block shrink-0">
        <Link to={`/profile/${post.user?.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar 
            url={post.user?.avatarUrl} 
            name={post.user?.displayName || post.user?.username} 
            size="md"
            className="hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      {/* 2. RIGHT COLUMN: Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header: Author info & Context */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2 overflow-hidden flex-wrap sm:flex-nowrap">
            {/* Mobile Avatar */}
            <div className="sm:hidden shrink-0 mr-1">
              <Link to={`/profile/${post.user?.username}`} onClick={(e) => e.stopPropagation()}>
                <Avatar url={post.user?.avatarUrl} name={post.user?.displayName || post.user?.username} size="sm" />
              </Link>
            </div>
            
            <Link 
              to={`/profile/${post.user?.username}`} 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 truncate group/author"
            >
              <span className="font-bold text-slate-900 dark:text-white text-[15px] group-hover/author:underline truncate">
                {post.user?.displayName || post.user?.username}
              </span>
              {post.user?.isVerified && <VerifiedBadge iconClassName="w-4 h-4" />}
            </Link>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[14px] shrink-0">
              <span className="hidden sm:inline">@{post.user?.username}</span>
              <span className="hidden sm:inline">&middot;</span>
              <time dateTime={post.createdAt} className="hover:underline">
                {formatTimeAgo(post.createdAt)}
              </time>
            </div>
          </div>
          {/* Post Options Menu */}
          <div className="shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            <Dropdown>
              <DropdownTrigger>
                <button
                  type="button"
                  aria-label="Gönderi seçenekleri"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-900 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownTrigger>
              <DropdownContent align="right" className="w-48">
                <DropdownItem onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                  toast.success("Bağlantı kopyalandı");
                }}>
                  <Link2 className="w-4 h-4 mr-2" /> Bağlantıyı Kopyala
                </DropdownItem>
                {currentUser?.id === post.user?.id ? (
                  <>
                    <DropdownItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Düzenle
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleDelete} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" /> Sil
                    </DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownItem onClick={() => setShowReportDialog(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Bildir
                    </DropdownItem>
                  </>
                )}
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="mt-2 mb-3" onClick={(e) => e.stopPropagation()}>
            <textarea
              autoFocus
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[15px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none min-h-[100px]"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(currentContent); }}>
                İptal
              </Button>
              <Button size="sm" variant="primary" onClick={handleEditSubmit}>
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-[15px] leading-[1.5] text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
            {post.type === "SENSITIVE" && !isRevealed ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-3">Bu gönderi gizlenmiş olabilir.</p>
                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}>
                  Yine de göster
                </Button>
              </div>
            ) : (
              <>
                <RichText text={currentContent} />
                
                {/* Poll Data */}
                {pollData && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {pollData.options.map((opt: any, i: number) => {
                      const totalVotes = pollData.options.reduce((acc: number, curr: any) => acc + curr.votes, 0);
                      const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                      const isVotedByMe = pollData.userVotedIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isVoting || pollData.userVotedIndex !== undefined}
                          onClick={(e) => handleVote(e, i)}
                          className={cn(
                            "relative w-full flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
                            pollData.userVotedIndex === undefined ? "hover:bg-slate-50 dark:bg-slate-900" : "cursor-default"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 bg-slate-100 dark:bg-slate-900 transition-all duration-500 ease-out",
                              isVotedByMe && "bg-slate-200 dark:bg-slate-800"
                            )}
                            style={{ width: `${pollData.userVotedIndex !== undefined ? percent : 0}%` }}
                          />
                          <span className={cn("relative z-10 text-[14px] font-medium", isVotedByMe ? "text-slate-900 dark:text-slate-100 font-bold" : "text-slate-700")}>
                            {opt.text}
                          </span>
                          <span className="relative z-10 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                            {pollData.userVotedIndex !== undefined ? `%${percent}` : ""}
                          </span>
                        </button>
                      );
                    })}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-[12px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      Toplam {pollData.options.reduce((acc: number, curr: any) => acc + curr.votes, 0)} oy
                    </div>
                  </div>
                )}

                {/* Media Grid */}
                {post.media && post.media.length > 0 && (
                  <div 
                    className={cn(
                      "mt-3 grid gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/50",
                      post.media.length === 1 ? "grid-cols-1" : 
                      post.media.length === 2 ? "grid-cols-2" : 
                      post.media.length === 3 ? "grid-cols-2" : 
                      "grid-cols-2 sm:grid-cols-3"
                    )}
                  >
                    {post.media.map((mediaUrl: string, i: number) => {
                      const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes('video');
                      return (
                        <div
                          key={i}
                          className={cn(
                            "relative bg-slate-100 dark:bg-slate-900 overflow-hidden",
                            post.media.length === 1
                              ? "aspect-[16/9] sm:aspect-auto sm:max-h-[500px]"
                              : post.media.length === 3 && i === 0
                              ? "row-span-2 aspect-[4/5] sm:aspect-square"
                              : "aspect-square"
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
                              alt="Gönderi Eki"
                              loading="lazy"
                              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
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
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 max-w-md pt-2 mt-2 select-none">
          {/* Comment */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
            aria-label="Yorum yap"
            className="group/btn flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 -m-2 rounded-full group-hover/btn:bg-blue-50 transition-colors">
              <MessageCircle className="w-[18px] h-[18px] stroke-[1.8]" />
            </div>
            <span className="text-[13px] font-medium min-w-[20px]">{post.commentCount || 0}</span>
          </motion.button>

          {/* Repost */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleRepost}
            aria-label="Yeniden Paylaş"
            className={cn(
              "group/btn flex items-center gap-1.5 transition-colors",
              reposted ? "text-emerald-600" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600"
            )}
          >
            <div className={cn("p-2 -m-2 rounded-full transition-colors", reposted ? "bg-emerald-50/50" : "group-hover/btn:bg-emerald-50")}>
              <Repeat2 className={cn("w-[18px] h-[18px]", reposted ? "stroke-[2.5]" : "stroke-[1.8]")} />
            </div>
            <span className="text-[13px] font-medium min-w-[20px]">{repostCount}</span>
          </motion.button>

          {/* Like */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            aria-label="Beğen"
            className={cn(
              "group/btn flex items-center gap-1.5 transition-colors",
              liked ? "text-rose-600" : "text-slate-500 dark:text-slate-400 hover:text-rose-600"
            )}
          >
            <div className={cn("p-2 -m-2 rounded-full transition-colors", liked ? "bg-rose-50/50" : "group-hover/btn:bg-rose-50")}>
              <Heart className={cn("w-[18px] h-[18px]", liked ? "fill-rose-600 stroke-rose-600" : "stroke-[1.8]")} />
            </div>
            <span className="text-[13px] font-medium min-w-[20px]">{likeCount}</span>
          </motion.button>

          {/* Bookmark & Share (Grouped) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              aria-label="Kaydet"
              className={cn(
                "group/btn p-2 -m-2 rounded-full transition-colors",
                saved ? "text-blue-600" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <Bookmark className={cn("w-[18px] h-[18px]", saved ? "fill-blue-600 stroke-blue-600" : "stroke-[1.8]")} />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                toast.success("Bağlantı kopyalandı");
              }}
              aria-label="Paylaş"
              className="group/btn p-2 -m-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-4"
            >
              <Share2 className="w-[18px] h-[18px] stroke-[1.8]" />
            </motion.button>
          </div>
        </div>
      </div>
      <ReportDialog isOpen={showReportDialog} onClose={() => setShowReportDialog(false)} targetType="post" targetId={post.id} />
    </article>
  );

}
