import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchApi, api } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import { motion, AnimatePresence } from "motion/react";
import { PostCard } from "../components/PostCard";
import { RichText } from "../components/RichText";
import { MentionAutocomplete } from "../components/MentionAutocomplete";
import { ReportDialog } from "../components/ReportDialog";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard, SkeletonCircle } from "../components/ui/Skeleton";
import {
  ArrowLeft,
  Users,
  Plus,
  X,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { formatTimeAgo } from "../lib/utils";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "../components/ui/Dropdown";

const CommentItem = ({ comment, postId, onDeleted }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.id === comment.userId;

  
  const handleEdit = async () => {
    if (!editContent.trim() || editContent === currentContent) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetchApi(`/posts/comments/${comment.id}`, {
        method: "PUT",
        data: { content: editContent.trim() }
      });
      const json = await res.json();
      if (json.success) {
        setCurrentContent(editContent.trim());
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirmDialog("Onay", "Yorumu silmek istediğinize emin misiniz?"))) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/posts/comments/${comment.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(comment.id);
        toast.success("Yorum silindi.");
      } else {
        toast.error("Yorum silinemedi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetchApi(`/posts/comments/${comment.id}`, {
        method: "PATCH",
        data: { content: editContent.trim() },
      });
      if (res.ok) {
        setCurrentContent(editContent.trim());
        setIsEditing(false);
        toast.success("Yorum güncellendi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Yorum güncellenemedi.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 border-b border-slate-100/80 hover:bg-slate-50/80 transition-colors flex gap-3.5 sm:gap-4 group">
      <div className="shrink-0 pt-0.5">
        <Avatar url={comment.user?.avatarUrl} name={comment.user?.displayName || comment.user?.username} size="sm" className="ring-2 ring-white shadow-xs" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px]">
            <span className="font-extrabold text-slate-900 truncate tracking-tight">
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="text-slate-500 font-medium truncate">@{comment.user?.username}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-400 font-medium whitespace-nowrap">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <button
                type="button"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Yorum seçenekleri"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-40 rounded-2xl shadow-lg border-slate-100">
              {isOwner ? (
                <>
                  <DropdownItem
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="font-semibold text-slate-700">Düzenle</span>
                  </DropdownItem>
                  <DropdownItem
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-rose-600 focus:bg-rose-50"
                  >
                    <span className="font-semibold text-rose-600">Sil</span>
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem
                  icon={<AlertTriangle className="w-4 h-4" />}
                  onClick={() => setShowReportDialog(true)}
                  className="text-rose-600 focus:bg-rose-50"
                >
                  <span className="font-semibold text-rose-600">Bildir</span>
                </DropdownItem>
              )}
            </DropdownContent>
          </Dropdown>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <textarea
              className="w-full bg-slate-50/50 border border-slate-200/60 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-[14px] sm:text-[15px] text-slate-800 outline-none transition-colors min-h-[80px] resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Yorumunuzu düzenleyin..."
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
                disabled={isSubmittingEdit}
                className="rounded-full text-slate-500 hover:bg-slate-100 px-4"
              >
                İptal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEdit}
                isLoading={isSubmittingEdit}
                disabled={!editContent.trim() || editContent === currentContent}
                className="rounded-full px-5 font-bold shadow-sm"
              >
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-[14px] sm:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed mt-0.5">
            <RichText text={currentContent} />
          </div>
        )}
      </div>

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetId={comment.id}
        targetType="comment"
      />
    </div>  );
};

export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [collabUserId, setCollabUserId] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: comments,
    setData: setComments,
    loadingMore,
    hasMore,
    loadInitial,
    loadMore,
    addItem,
  } = usePagination(`/posts/${id}/comments`);

  useSEO({
    title: post ? `${post.user?.displayName || post.user?.username} (@${post.user?.username}) - Genç Sosyal` : undefined,
    description: post?.content ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content) : undefined,
  });

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await fetchApi(`/posts/${id}`);
        const json = await res.json();
        if (json.success) {
          setPost(json.data);
          api
            .get(`/api/v1/posts/${json.data.id}/collaborators`)
            .then((c) => {
              if (c.data?.success) setCollaborators(c.data.data);
            })
            .catch(console.error);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
    loadInitial();
  }, [id, loadInitial]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabUserId.trim()) return;
    setAddingCollab(true);
    try {
      const res = await api.get(`/api/v1/search?q=${collabUserId.trim()}&limit=1`);
      if (res.data?.success && res.data.data.length > 0) {
        const targetUser = res.data.data[0];
        await api.post(`/api/v1/posts/${post?.id}/collaborators`, { targetUserId: targetUser.id });
        toast.success("Davet gönderildi.");
        setCollabUserId("");
      } else {
        toast.error("Kullanıcı bulunamadı.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Hata oluştu.");
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollaborator = async (userId: number) => {
    if (!(await confirmDialog("Onay", "Ortak üreticiyi kaldırmak istediğinize emin misiniz?"))) return;
    try {
      await api.delete(`/api/v1/posts/${post?.id}/collaborators/${userId}`);
      setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      toast.success("Ortak üretici kaldırıldı.");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Hata oluştu.");
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) return openModal();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetchApi(`/posts/${id}/comments`, {
        method: "POST",
        data: { content: commentText.trim() },
      });
      const json = await res.json();
      if (json.success) {
        setCommentText("");
        addItem(json.data);
        setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
        toast.success("Yanıtınız paylaşıldı.");
      } else {
        toast.error(json.error?.message || "Yanıt gönderilemedi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Yanıt gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 min-h-screen bg-white p-6 space-y-4">
        <SkeletonCard />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] bg-white">
        <EmptyState
          icon={<MessageCircle className="w-7 h-7" />}
          title="Gönderi Bulunamadı"
          description="Görüntülemek istediğiniz gönderi mevcut değil veya silinmiş olabilir."
          action={{
            label: "Ana Sayfaya Dön",
            onClick: () => navigate("/home")
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 min-h-screen bg-white pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 sm:top-16 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 py-4 flex items-center gap-4 transition-all">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Geri"
          className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm border border-slate-200/50"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Gönderi
        </h1>
      </header>

      {/* Main Post Card */}
      <div className="border-b border-slate-200/80">
        <PostCard post={post} onPostDeleted={() => navigate("/home")} />

        {/* Collaborators Card */}
        {collaborators.length > 0 || user?.id === post.userId ? (
          <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-900" />
              Ortak Üreticiler
            </h3>

            <div className="space-y-2.5">
              {collaborators.map((collab) => (
                <div key={collab.userId} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <Avatar url={collab.avatarUrl} name={collab.displayName || collab.username} size="sm" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {collab.displayName || collab.username}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {collab.status === "accepted" ? "Ortak Üretici" : "Davet Bekleniyor"}
                      </p>
                    </div>
                  </div>
                  {(user?.id === post.userId || user?.id === collab.userId) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(collab.userId)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Kaldır"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {user?.id === post.userId && (
              <form onSubmit={handleAddCollaborator} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Kullanıcı adı ile davet et..."
                  value={collabUserId}
                  onChange={(e) => setCollabUserId(e.target.value)}
                  className="flex-1 text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={addingCollab || !collabUserId.trim()}
                  isLoading={addingCollab}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        ) : null}
      </div>

      {/* Comment Input */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex gap-2.5 items-center">
          <div className="relative flex-1">
            <input
              ref={inputRef as any}
              type="text"
              placeholder="Düşünceni veya yanıtını yaz..."
              className="w-full bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all min-h-[44px]"
              value={commentText}
              onClick={() => {
                if (!isAuthenticated) openModal();
              }}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <div className="absolute bottom-full mb-2 left-0 z-30">
              <MentionAutocomplete
                text={commentText}
                onSelect={setCommentText}
                inputRef={inputRef as any}
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!commentText.trim() || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleComment}
            className="rounded-full px-5 min-h-[44px]"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Yanıtla
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col flex-1">
        {comments.length > 0 ? (
          <InfiniteScroll 
        items={comments}
        renderItem={(comment) => (
          <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                onDeleted={(delId: number) => {
                  setComments((prev) => prev.filter((c: any) => c.id !== delId));
                  setPost((prev: any) => ({
                    ...prev,
                    commentCount: Math.max(0, (prev.commentCount || 0) - 1),
                  }));
                }}
              />
        )}
        hasMore={hasMore} 
        isLoading={loadingMore} 
        onLoadMore={loadMore} 
      />
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm font-medium">
            Henüz bir yanıt yok. İlk düşünceyi sen paylaş!
          </div>
        )}
      </div>
    </div>
  );
}
