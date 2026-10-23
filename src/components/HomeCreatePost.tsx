import React, { useState, useRef } from "react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Avatar } from "./ui/Avatar";
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
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useMediaUploadPipeline } from "../hooks/useMediaUploadPipeline";
import { MediaUploadItem } from "./media/MediaUploadItem";

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

  const {
    items: mediaItems,
    addFiles: addMediaFiles,
    removeItem: removeMediaItem,
    cancelItem: cancelMediaItem,
    retryItem: retryMediaItem,
    clearAll: clearAllMedia,
    isUploading: isMediaUploading,
    completedMedia,
  } = useMediaUploadPipeline(4);

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

    addMediaFiles(files);
    setIsExpanded(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    clearAllMedia();
    setPostType("NORMAL");
    setContentWarning("");
    setPollOptions(["", ""]);
    setVisibility("PUBLIC");
    setShowVisibilityMenu(false);
    setIsExpanded(false);
  };

  const isFormValid = () => {
    if (loading || isMediaUploading) return false;
    if (content.length > 2000) return false;
    if (mediaItems.length > 0 && completedMedia.length !== mediaItems.length) return false;
    if (postType === "POLL") {
      const validOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (validOpts.length < 2) return false;
      return content.trim().length > 0;
    }
    if (postType === "SENSITIVE" && !contentWarning.trim()) return false;
    return content.trim().length > 0 || completedMedia.length > 0;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return openModal();
    if (isMediaUploading) {
      toast.error("Lütfen medyanın yüklenmesini ve işlenmesini bekleyin.");
      return;
    }
    if (mediaItems.length > 0 && completedMedia.length !== mediaItems.length) {
      toast.error("Bazı medya dosyaları henüz yüklenemedi veya hata verdi.");
      return;
    }
    if (!isFormValid()) return;

    setLoading(true);

    try {
      const filteredOptions =
        postType === "POLL" ? pollOptions.map((o) => o.trim()).filter(Boolean) : undefined;

      const res = await fetchApi("/posts", {
        method: "POST",
        data: {
          content,
          visibility,
          media: completedMedia,
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
        "w-full bg-white/95 dark:bg-[#0B1329]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden",
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
        /* Collapsed Modern Trigger State with Round / Pill Buttons */
        <div className="p-3 sm:p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username || "Kullanıcı"}
                size="md"
                className="w-10 h-10 rounded-full ring-2 ring-blue-500/20 dark:ring-blue-400/20"
              />
            </div>

            <button
              type="button"
              onClick={() => handleOpenComposer("NORMAL")}
              aria-label="Gönderi yazmaya başla"
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium border border-slate-200/70 dark:border-white/[0.06] transition-all cursor-pointer select-none truncate"
            >
              {user?.displayName
                ? `Ne düşünüyorsun, ${user.displayName.split(" ")[0]}?`
                : "Toplulukla yeni bir proje veya fikir paylaş..."}
            </button>
          </div>

          {/* Quick Round Pill Action Buttons Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Media Pill Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Fotoğraf / Video</span>
              </button>

              {/* Poll Pill Button */}
              <button
                type="button"
                onClick={() => handleOpenComposer("POLL")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Anket</span>
              </button>

              {/* Sensitive Pill Button */}
              <button
                type="button"
                onClick={() => handleOpenComposer("SENSITIVE")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hassas İçerik</span>
                <span className="sm:hidden">Uyarı</span>
              </button>
            </div>

            {/* Quick Share Round Button */}
            <button
              type="button"
              onClick={() => handleOpenComposer("NORMAL")}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Gönderi Yaz"
            >
              <Send className="w-3.5 h-3.5 -translate-x-0.2" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Rich Composer State with Round Buttons */
        <div className="p-4 sm:p-5">
          {/* Top Bar: User info, verified badge, visibility pill dropdown, round close button */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username || "?"}
                size="sm"
                className="w-8 h-8 rounded-full ring-2 ring-blue-500/20"
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
              {/* Visibility Pill Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                  aria-label={`Görünürlük: ${activeVisibility.label}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/[0.06] transition-all cursor-pointer select-none active:scale-95"
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
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-52 bg-white/95 dark:bg-[#0B1329]/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-white/[0.10] shadow-xl py-1 z-30 overflow-hidden"
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
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
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

              {/* Circular Close Button */}
              <button
                type="button"
                onClick={resetForm}
                aria-label="Vazgeç"
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sensitive warning input */}
          {postType === "SENSITIVE" && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Hassas İçerik Uyarısı</span>
              </div>
              <input
                type="text"
                placeholder="İçerik uyarısı başlığı (ör. Tetikleyici öğe, spoiler)..."
                value={contentWarning}
                onChange={(e) => setContentWarning(e.target.value)}
                className="w-full bg-white dark:bg-[#0D121D] border border-amber-200 dark:border-amber-900/60 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

          {/* Poll Options with Round Add Button */}
          {postType === "POLL" && (
            <div className="mb-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101C38] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
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
                    className="flex-1 bg-white dark:bg-[#0B1329] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      aria-label="Seçeneği kaldır"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Seçenek Ekle</span>
                </button>
              )}
            </div>
          )}

          {/* Selected Media Previews */}
          {mediaItems.length > 0 && (
            <div className="space-y-3 mb-3.5">
              {mediaItems.map((item) => (
                <MediaUploadItem
                  key={item.id}
                  item={item}
                  onRemove={removeMediaItem}
                  onRetry={retryMediaItem}
                  onCancel={cancelMediaItem}
                />
              ))}
            </div>
          )}

          {/* Bottom Bar: Action buttons & Rounded Pill Submit */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
            {/* Attachment toggles with round buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaItems.length >= 4 || isMediaUploading}
                title="Görsel veya Video Ekle"
                aria-label="Medya ekle"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 stroke-[1.75]" />
              </button>

              <button
                type="button"
                onClick={() => setPostType(postType === "POLL" ? "NORMAL" : "POLL")}
                title="Anket"
                aria-label="Anket ekle"
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer",
                  postType === "POLL"
                    ? "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60"
                    : "text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
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
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer",
                  postType === "SENSITIVE"
                    ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60"
                    : "text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                )}
              >
                <ShieldAlert className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {/* Character counter & Rounded-full submit button */}
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

              <button
                type="button"
                disabled={!isFormValid()}
                onClick={handleSubmit}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer",
                  isFormValid()
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                    : "bg-slate-200 dark:bg-white/[0.08] text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                )}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isMediaUploading ? "İşleniyor..." : "Paylaş"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
