import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserProjects, Project, deleteProject } from "../lib/projects";
import { Plus, Github, Link as LinkIcon, Trash2, Edit3, Rocket, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../context/useAuth";
import { toast } from "./ui/Toast";
import { confirmDialog } from "./ui/ConfirmDialog";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { SkeletonCard } from "./ui/Skeleton";

interface ProfileProjectsProps {
  userId: number;
}

const getStatusText = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("fikir") || s === "idea") return "Fikir Aşamasında";
  if (s.includes("geliştiriliyor") || s === "in_progress") return "Geliştiriliyor";
  if (s.includes("tamamlandı") || s === "completed") return "Tamamlandı";
  if (s.includes("yayında") || s === "published") return "Yayında";
  if (s.includes("durduruldu") || s === "paused") return "Durduruldu";
  if (s.includes("prototip") || s === "prototype") return "Prototip";
  if (s.includes("arşivlendi") || s === "archived") return "Arşivlendi";
  return status;
};

export function ProfileProjects({ userId }: ProfileProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const isOwner = user?.id === userId;
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getUserProjects(userId);
      setProjects(data);
    } catch (e: any) {
      setError(e.message || "Projeler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!(await confirmDialog("Projeyi Sil", "Bu projeyi portföyünüzden silmek istediğinize emin misiniz?"))) return;
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success("Proje silindi.");
    } catch (e: any) {
      toast.error(e.message || "Silinemedi.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Üretimler & Projeler</h3>
          <p className="text-xs text-slate-500 font-medium">Kullanıcının geliştirdiği ve katkıda bulunduğu projeler</p>
        </div>
        {isOwner && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4 text-slate-900" />}
            onClick={() => navigate("/settings?tab=projects")}
            className="rounded-xl font-bold text-slate-900 hover:text-slate-700 bg-slate-100/70 hover:bg-slate-100/70 border-slate-100/60"
          >
            Proje Ekle
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="py-6 max-w-md mx-auto">
          <EmptyState
            icon={<Rocket className="w-7 h-7" />}
            title="Henüz Proje Eklenmemiş"
            description={
              isOwner
                ? "Projelerini sergilemeye başlamak için ilk üretimini veya açık kaynak projenizi ekleyin."
                : "Bu kullanıcı henüz portföyüne bir üretim veya proje eklemedi."
            }
            action={
              isOwner
                ? {
                    label: "İlk Projeni Ekle",
                    onClick: () => navigate("/settings?tab=projects"),
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white border border-slate-200/80 shadow-xs rounded-2xl hover:shadow-md hover:border-slate-200 transition-all flex flex-col group relative overflow-hidden cursor-pointer"
            >
              {/* Image Header */}
              {project.imageUrl ? (
                <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden flex-shrink-0 relative border-b border-slate-100">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-slate-50 flex items-center justify-center flex-shrink-0 border-b border-slate-100">
                  <Rocket className="w-8 h-8 text-slate-300" />
                </div>
              )}

              {/* Content Area */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-slate-900 transition-colors">
                    {project.title}
                  </h4>
                  {isOwner && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Projeyi Düzenle"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/settings?tab=projects&edit=${project.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Projeyi Sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span className="text-[11px] font-bold tracking-wide text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {project.category}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {getStatusText(project.status)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {(!project.tags || project.tags.length === 0) && <div className="mt-auto" />}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
