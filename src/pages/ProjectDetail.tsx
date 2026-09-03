import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getProject,
  Project,
  getProjectLikes,
  likeProject,
  unlikeProject,
  getProjectComments,
  addProjectComment,
  deleteProjectComment,
  ProjectComment,
} from "../lib/projects";
import {
  Loader2,
  ArrowLeft,
  Github,
  Link as LinkIcon,
  Edit3,
  Calendar,
  Share2,
  Check,
  Heart,
  MessageSquare,
  Trash2,
  Users,
  Plus,
  X,
  Send,
  Rocket,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { motion } from "motion/react";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard, SkeletonCircle } from "../components/ui/Skeleton";
import { Avatar } from "../components/ui/Avatar";

const getStatusText = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("fikir") || s === "idea") return "Fikir Aşamasında";
  if (s.includes("geliştiriliyor") || s === "in_progress") return "Geliştiriliyor";
  if (s.includes("tamamlandı") || s === "completed") return "Tamamlandı";
  if (s.includes("yayında") || s === "published") return "Yayında";
  if (s.includes("durduruldu") || s === "paused") return "Durduruldu";
  if (s.includes("prototip") || s === "prototype") return "Prototip";
  if (s.includes("arşivlendi") || s === "archived") return "Arşivlendi";
  return status;
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [collabUserId, setCollabUserId] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const pId = parseInt(id, 10);
      loadProject(pId);
      loadSocialData(pId);
    }
  }, [id, user]);

  const loadProject = async (projectId: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (e: any) {
      setError(e.message || "Proje yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const loadSocialData = async (projectId: number) => {
    setCommentsLoading(true);
    try {
      const [likesData, commentsData] = await Promise.all([
        getProjectLikes(projectId),
        getProjectComments(projectId),
      ]);

      setLikesCount(likesData.totalLikes || 0);
      if (user) {
        setHasLiked((likesData.likes || []).some((l: any) => l.userId === user.id));
      }
      setComments(commentsData || []);
    } catch (e) {
      console.error("Sosyal veriler yüklenemedi", e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) return openModal();
    if (!project || likeLoading) return;

    setLikeLoading(true);
    const prevLiked = hasLiked;
    const prevCount = likesCount;

    setHasLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      if (prevLiked) {
        await unlikeProject(project.id);
      } else {
        await likeProject(project.id);
      }
    } catch (e) {
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openModal();
    if (!commentText.trim() || !project || commentLoading) return;

    setCommentLoading(true);
    try {
      const res = await addProjectComment(project.id, commentText.trim());
      if (res.pending) {
        toast.success("Yorumun inceleniyor.");
      } else {
        setComments((prev) => [...prev, res.comment]);
        toast.success("Yorumunuz eklendi.");
      }
      setCommentText("");
    } catch (e: any) {
      toast.error(e.message || "Yorum eklenirken hata oluştu.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!project) return;
    if (!(await confirmDialog("Onay", "Yorumu silmek istediğinize emin misiniz?"))) return;

    try {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      await deleteProjectComment(project.id, commentId);
      toast.success("Yorum silindi.");
    } catch (e) {
      loadSocialData(project.id);
      toast.error("Yorum silinemedi.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title || "Proje Detayı",
          text: project?.description || "Genç Sosyal'deki bu projeyi incele!",
          url: url,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Bağlantı panoya kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Kopyalama başarısız oldu.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Rocket className="w-7 h-7" />}
          title="Proje Bulunamadı"
          description={error || "Görüntülemek istediğiniz proje mevcut değil veya kaldırılmış."}
          action={{
            label: "Projelere Dön",
            onClick: () => navigate("/projects")
          }}
        />
      </div>
    );
  }

  const isOwner = user?.id === project.userId;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Geri
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            onClick={handleShare}
          >
            {copied ? "Kopyalandı" : "Paylaş"}
          </Button>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => navigate(`/settings?tab=projects&edit=${project.id}`)}
            >
              Düzenle
            </Button>
          )}
        </div>
      </div>

      {/* Main Project Card */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {project.imageUrl && (
          <div className="w-full h-64 sm:h-80 md:h-96 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 overflow-hidden">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 md:p-10 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full">
                {project.category}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                {getStatusText(project.status)}
              </span>
            </div>

            {project.username && (
              <div
                className="flex items-center gap-2.5 cursor-pointer group w-fit"
                onClick={() => navigate(`/profile/${project.username}`)}
              >
                <Avatar name={project.username} size="sm" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:text-slate-100 transition-colors">
                    @{project.username}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">Proje Sahibi</div>
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {project.description}
            </p>
          </div>

          {/* Social Stats & External Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-sm transition-colors ${
                  hasLiked
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm border border-slate-200 dark:border-slate-800/60">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </div>

              <div className="text-xs text-slate-400 font-medium ml-2 hidden sm:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-700 transition-colors shadow-xs"
                >
                  <LinkIcon className="w-4 h-4" /> İncele
                </a>
              )}
            </div>
          </div>

          {/* Detailed Description */}
          {project.detailedDescription && (
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Proje Detayları</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {project.detailedDescription}
              </p>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kullanılan Teknolojiler</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold text-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          Yorumlar ({comments.length})
        </h3>

        {/* Comment Form */}
        <div className="mb-6">
          <form onSubmit={handleAddComment} className="flex flex-col gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Proje hakkında ne düşünüyorsunuz?"
              rows={3}
              onClick={() => {
                if (!isAuthenticated) openModal();
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!commentText.trim() || commentLoading}
                isLoading={commentLoading}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Yorum Gönder
              </Button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {commentsLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs sm:text-sm font-medium">
              Henüz yorum yapılmamış. İlk yorumu siz yazın!
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 relative group">
                <Avatar name={c.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {c.fullName || c.username}
                      </span>
                      <span className="text-slate-400 font-medium">@{c.username}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>
                </div>

                {user && user.id === c.userId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all self-start"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
