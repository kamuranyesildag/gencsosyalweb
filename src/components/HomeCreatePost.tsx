import React, { useState, useRef } from "react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { MentionAutocomplete } from "./MentionAutocomplete";
import { VerifiedBadge } from "./VerifiedBadge";
import { fetchApi } from "../lib/api";
import { toast } from "./ui/Toast";
import {
  Image as ImageIcon,
  X,
  ListOrdered,
  ShieldAlert,
  Plus,
  Trash2,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export type PostType = "NORMAL" | "POLL" | "SENSITIVE";
export type PostVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

interface HomeCreatePostProps {
  onPostCreated?: (post: any) => void;
  className?: string;
}

const VISIBILITY_OPTIONS: {
  id: PostVisibility;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "PUBLIC",
    label: "Herkese Açık",
    desc: "Platformdaki herkes görebilir",
    icon: Globe,
  },
  {
    id: "FOLLOWERS",
    label: "Takipçilerim",
    desc: "Sadece seni takip edenler görebilir",
    icon: Users,
  },
  {
    id: "PRIVATE",
    label: "Yalnızca Ben",
    desc: "Sadece sen görebilirsin",
    icon: Lock,
  },
];

export function HomeCreatePost({ onPostCreated, className }: HomeCreatePostProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<PostType>("NORMAL");
  const [contentWarning, setContentWarning] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenComposer = (initialPostType: PostType = "NORMAL") => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setPostType(initialPostType);
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (mediaFiles.length + files.length > 4) {
      toast.error("En fazla 4 medya dosyası ekleyebilirsiniz.");
      return;
    }

    const validFiles = files.filter((f) => {
      if (f.size > 25 * 1024 * 1024) {
        toast.error(`${f.name} çok büyük (maks. 25MB)`);
        return false;
      }
      return true;
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setIsExpanded(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  const resetForm = () => {
    setContent("");
    setMediaFiles([]);
    setPostType("NORMAL");
    setContentWarning("");
    setPollOptions(["", ""]);
    setVisibility("PUBLIC");
    setShowVisibilityMenu(false);
    setIsExpanded(false);
  };

  const isFormValid = () => {
    if (loading) return false;
    if (content.length > 2000) return false;
    if (postType === "POLL") {
      const validOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (validOpts.length < 2) return false;
      return content.trim().length > 0;
    }
    if (postType === "SENSITIVE" && !contentWarning.trim()) return false;
    return content.trim().length > 0 || mediaFiles.length > 0;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return openModal();
    if (!isFormValid()) return;

    setLoading(true);

    try {
      // 1. Upload media if any
      const mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetchApi("/media/upload", {
            method: "POST",
            body: formData,
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.data?.url) {
            mediaUrls.push(uploadJson.data.url);
          } else {
            throw new Error(uploadJson.error?.message || "Medya yüklenemedi.");
          }
        }
      }

      // 2. Filter poll options
      const filteredOptions =
        postType === "POLL" ? pollOptions.map((o) => o.trim()).filter(Boolean) : undefined;

      // 3. Create post
      const res = await fetchApi("/posts", {
        method: "POST",
        data: {
          content,
          visibility,
          media: mediaUrls,
          postType,
          contentWarning: postType === "SENSITIVE" ? contentWarning : undefined,
          pollOptions: filteredOptions,
        },
      });

      const json = await res.json();

      if (json.success && json.data) {
        toast.success("Gönderiniz başarıyla paylaşıldı!");
        resetForm();
        if (onPostCreated) {
          onPostCreated(json.data);
        }
      } else {
        toast.error(json.error?.message || "Gönderi paylaşılamadı.");
      }
    } catch (err: any) {
      console.error("Home post creation error:", err);
      toast.error(err.message || "Gönderi oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const activeVisibility =
    VISIBILITY_OPTIONS.find((v) => v.id === visibility) || VISIBILITY_OPTIONS[0];
  const ActiveIcon = activeVisibility.icon;
  const charactersRemaining = 2000 - content.length;

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs transition-all duration-200",
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        hidden
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      {!isExpanded ? (
        /* Collapsed Trigger State */
        <div className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="shrink-0">
            <Avatar
              url={user?.avatarUrl}
              name={user?.displayName || user?.username || "Kullanıcı"}
              size="md"
              className="w-10 h-10 ring-1 ring-slate-200/60 dark:ring-white/[0.08]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenComposer("NORMAL")}
            aria-label="Gönderi yazmaya başla"
            className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#131927] hover:bg-slate-100/80 dark:hover:bg-[#161e2e] text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal border border-slate-200/60 dark:border-white/[0.06] transition-colors cursor-pointer select-none truncate"
          >
            {user?.displayName
              ? `Ne düşünüyorsun, ${user.displayName.split(" ")[0]}?`
              : "Toplulukla yeni bir fikir veya proje paylaş..."}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) openModal();
                else fileInputRef.current?.click();
              }}
              title="Görsel / Video Ekle"
              aria-label="Medya yükle"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <ImageIcon className="w-4.5 h-4.5 stroke-[1.75]" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenComposer("POLL")}
              title="Anket Oluştur"
              aria-label="Anket oluştur"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <ListOrdered className="w-4.5 h-4.5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Rich Composer State */
        <div className="p-4 sm:p-5">
          {/* Top Bar: User info, verified badge, visibility dropdown, close button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username || "?"}
                size="sm"
                className="w-8 h-8"
              />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                  {user?.displayName || user?.username}
                </span>
                {user?.isVerified && (
                  <VerifiedBadge iconClassName="w-3.5 h-3.5 text-blue-500" withModal={false} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Visibility Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                  aria-label={`Görünürlük: ${activeVisibility.label}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/[0.06] transition-all cursor-pointer select-none"
                >
                  <ActiveIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="hidden sm:inline">{activeVisibility.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-slate-400 transition-transform duration-150",
                      showVisibilityMenu && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {showVisibilityMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#131927] rounded-xl border border-slate-200/80 dark:border-white/[0.1] shadow-lg py-1 z-30 overflow-hidden"
                    >
                      {VISIBILITY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = opt.id === visibility;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setVisibility(opt.id);
                              setShowVisibilityMenu(false);
                            }}
                            className={cn(
                              "w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer",
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={resetForm}
                aria-label="Vazgeç"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sensitive warning input */}
          {postType === "SENSITIVE" && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
              <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Hassas İçerik Uyarısı</span>
              </div>
              <input
                type="text"
                placeholder="İçerik uyarısı başlığı (ör. Tetikleyici öğe, spoiler)..."
                value={contentWarning}
                onChange={(e) => setContentWarning(e.target.value)}
                className="w-full bg-white dark:bg-[#0D121D] border border-amber-200 dark:border-amber-900/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Main Textarea with Mention Autocomplete */}
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Yeni bir proje, düşünce veya soru paylaş..."
              className="w-full bg-transparent border-0 p-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-[15px] focus:ring-0 focus:outline-none resize-none leading-relaxed min-h-[72px]"
            />
            <MentionAutocomplete
              text={content}
              inputRef={textareaRef}
              onSelect={(inserted) => setContent(inserted)}
            />
          </div>

          {/* Poll Options */}
          {postType === "POLL" && (
            <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Anket Seçenekleri
              </p>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Seçenek ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                    maxLength={50}
                    className="flex-1 bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      aria-label="Seçeneği kaldır"
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Seçenek Ekle</span>
                </button>
              )}
            </div>
          )}

          {/* Selected Media Previews */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {mediaFiles.map((file, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Seçilen Medya"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(i)}
                    aria-label="Medyayı kaldır"
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-transform active:scale-90 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar: Action buttons & Submit */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
            {/* Attachment toggles */}
            <div className="flex items-center gap-1 -ml-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 4}
                title="Görsel veya Video Ekle"
                aria-label="Medya ekle"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 stroke-[1.75]" />
              </button>

              <button
                type="button"
                onClick={() => setPostType(postType === "POLL" ? "NORMAL" : "POLL")}
                title="Anket"
                aria-label="Anket ekle"
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer",
                  postType === "POLL"
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                )}
              >
                <ListOrdered className="w-4 h-4 stroke-[1.75]" />
              </button>

              <button
                type="button"
                onClick={() => setPostType(postType === "SENSITIVE" ? "NORMAL" : "SENSITIVE")}
                title="Hassas İçerik"
                aria-label="Hassas içerik uyarısı ekle"
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer",
                  postType === "SENSITIVE"
                    ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                    : "text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                )}
              >
                <ShieldAlert className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {/* Character counter & submit button */}
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span
                  className={cn(
                    "text-xs font-mono tabular-nums select-none",
                    charactersRemaining < 0
                      ? "text-rose-500 font-bold"
                      : charactersRemaining < 100
                      ? "text-amber-500 font-semibold"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                  title={`${charactersRemaining} karakter kaldı`}
                >
                  {charactersRemaining}
                </span>
              )}

              <Button
                variant="primary"
                size="sm"
                disabled={!isFormValid()}
                isLoading={loading}
                onClick={handleSubmit}
                className="px-4 py-1.5 font-semibold rounded-xl text-xs shadow-xs"
              >
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
