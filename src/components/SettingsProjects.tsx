import React, { useEffect, useState } from "react";
import { 
  getUserProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  Project 
} from "../lib/projects";
import { useAuthStore } from "../context/useAuth";
import { 
  Loader2, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  XCircle, 
  Link as LinkIcon, 
  Github, 
  Image as ImageIcon, 
  Info, 
  Code, 
  LayoutDashboard,
  ExternalLink,
  FolderGit2
} from "lucide-react";
import { toast } from "./ui/Toast";
import { confirmDialog } from "./ui/ConfirmDialog";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { Badge } from "./ui/Badge";

export function SettingsProjects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | Partial<Project> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [tagInput, setTagInput] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && projects.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      if (editId) {
        const p = projects.find((item) => item.id.toString() === editId);
        if (p) setEditingProject(p);
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=projects");
      }
    }
  }, [loading, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getUserProjects(user!.id);
      setProjects(data);
    } catch (e: any) {
      setMsg({ text: e.message || "Projeler yüklenemedi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog("Projeyi Sil", "Bu projeyi silmek istediğinize emin misiniz?"))) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMsg({ text: "Proje başarıyla silindi.", type: "success" });
    } catch (e: any) {
      toast.error(e.message || "Silme işlemi başarısız.");
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    if (url.startsWith("javascript:") || url.startsWith("data:")) return false;
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    // URL Validations
    if (editingProject.projectUrl && !validateUrl(editingProject.projectUrl)) {
      setMsg({ text: "Proje canlı bağlantısı geçersiz (sadece http/https).", type: "error" });
      return;
    }
    if (editingProject.githubUrl && !validateUrl(editingProject.githubUrl)) {
      setMsg({ text: "GitHub bağlantısı geçersiz (sadece http/https).", type: "error" });
      return;
    }
    if (editingProject.imageUrl && !validateUrl(editingProject.imageUrl)) {
      setMsg({ text: "Görsel bağlantısı geçersiz (sadece http/https).", type: "error" });
      return;
    }

    setSubmitting(true);
    setMsg({ text: "", type: "success" });
    try {
      if (editingProject.id) {
        const updated = await updateProject(editingProject.id, editingProject);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setMsg({ text: "Proje başarıyla güncellendi.", type: "success" });
      } else {
        const created = await createProject(editingProject);
        setProjects([created, ...projects]);
        setMsg({ text: "Yeni proje başarıyla eklendi.", type: "success" });
      }
      setEditingProject(null);
    } catch (e: any) {
      setMsg({ text: e.message || "Kaydetme işlemi başarısız.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && editingProject) {
        const currentTags = editingProject.tags || [];
        if (currentTags.length >= 10) {
          setMsg({ text: "En fazla 10 etiket ekleyebilirsiniz.", type: "error" });
          return;
        }
        if (!currentTags.includes(val)) {
          setEditingProject({ ...editingProject, tags: [...currentTags, val] });
        }
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        tags: (editingProject.tags || []).filter((t) => t !== tagToRemove),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (editingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingProject.id ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
              Genç Sosyal portföyünüz için projenizi detaylandırın.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingProject(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg.text && (
          <div
            className={`p-4 rounded-2xl text-sm font-bold border ${
              msg.type === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Bölüm 1: Temel Bilgiler */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <LayoutDashboard className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-base">Temel Bilgiler</h4>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Proje Adı *
              </label>
              <input
                required
                maxLength={100}
                type="text"
                value={editingProject.title || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, title: e.target.value })
                }
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="Örn: Akıllı Tarım & Sera Otomasyonu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kategori *
                </label>
                <select
                  required
                  value={editingProject.category || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, category: e.target.value })
                  }
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="" disabled>Seçiniz</option>
                  <option value="Yazılım">Yazılım</option>
                  <option value="Mobil Uygulama">Mobil Uygulama</option>
                  <option value="Web">Web</option>
                  <option value="Yapay Zekâ">Yapay Zekâ</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Robotik">Robotik</option>
                  <option value="Eğitim">Eğitim</option>
                  <option value="Tasarım">Tasarım</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Proje Durumu *
                </label>
                <select
                  required
                  value={editingProject.status || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, status: e.target.value })
                  }
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="" disabled>Seçiniz</option>
                  <option value="Fikir aşamasında">Fikir aşamasında</option>
                  <option value="Geliştiriliyor">Geliştiriliyor</option>
                  <option value="Yayında">Yayında</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Durduruldu">Durduruldu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bölüm 2: Proje Detayları */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Info className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-base">Açıklama & Detaylar</h4>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Kısa Açıklama *
              </label>
              <textarea
                required
                maxLength={2000}
                rows={2}
                value={editingProject.description || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
                placeholder="Projenin amacını ve öne çıkan özelliklerini kısaca açıklayın..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Detaylı Açıklama (Opsiyonel)
              </label>
              <textarea
                maxLength={10000}
                rows={4}
                value={editingProject.detailedDescription || ""}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    detailedDescription: e.target.value,
                  })
                }
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-y placeholder:text-slate-400"
                placeholder="Mimari, hedefler ve kullanılan yöntemler hakkında detay verin..."
              />
            </div>
          </div>

          {/* Bölüm 3: Teknolojiler */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Code className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-base">Teknolojiler & Etiketler</h4>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Kullanılan Teknolojiler
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="React, TypeScript, Python yazıp Enter'a basın..."
              />
              <p className="text-xs text-slate-400 font-medium">
                En fazla 10 teknoloji ekleyebilirsiniz. Eklemek için <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Enter</kbd> veya virgül kullanın.
              </p>

              {editingProject.tags && editingProject.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {editingProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bölüm 4: Bağlantılar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <LinkIcon className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-base">Medya & Bağlantılar</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  Proje Görsel URL (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={editingProject.imageUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, imageUrl: e.target.value })
                  }
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://example.com/banner.png"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    GitHub URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, githubUrl: e.target.value })
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="https://github.com/kullanici/repo"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    Canlı Site URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={editingProject.projectUrl || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, projectUrl: e.target.value })
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="https://proje-adresi.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditingProject(null)}
              className="rounded-2xl font-bold"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              leftIcon={<Check className="w-4 h-4" />}
              className="rounded-2xl font-bold shadow-xs"
            >
              {editingProject.id ? "Değişiklikleri Kaydet" : "Projeyi Yayınla"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Üretim ve Projelerim
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Genç Sosyal vitrininizde yer alan projeleri ve portföyünüzü yönetin.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingProject({
              title: "",
              description: "",
              detailedDescription: "",
              category: "",
              status: "Geliştiriliyor",
              tags: [],
              imageUrl: "",
              githubUrl: "",
              projectUrl: "",
            });
            setMsg({ text: "", type: "success" });
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-full font-bold shadow-xs shrink-0"
        >
          Yeni Proje
        </Button>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold border ${
            msg.type === "error"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center">
          <EmptyState
            icon={<FolderGit2 className="w-8 h-8 text-slate-400" />}
            title="Henüz Proje Eklenmedi"
            description="Üzerinde çalıştığınız veya tamamladığınız projeleri vitrininize ekleyin."
            action={{
              label: "İlk Projeyi Ekle",
              onClick: () =>
                setEditingProject({
                  title: "",
                  description: "",
                  detailedDescription: "",
                  category: "",
                  status: "Geliştiriliyor",
                  tags: [],
                  imageUrl: "",
                  githubUrl: "",
                  projectUrl: "",
                }),
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                    {project.title}
                  </h4>
                  <Badge variant="secondary" size="sm" isPill>
                    {project.category}
                  </Badge>
                  <Badge variant="default" size="sm" isPill>
                    {project.status}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {project.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[11px] font-semibold text-slate-400 px-1 py-0.5">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingProject(project);
                    setMsg({ text: "", type: "success" });
                  }}
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-600" />}
                  className="rounded-xl font-bold text-xs"
                >
                  Düzenle
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                  className="rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50"
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
