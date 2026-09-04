import React, { useState, useRef, useEffect } from "react";
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
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export type PostType = "NORMAL" | "POLL" | "SENSITIVE";
export type PostVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  communityId?: number;
  standalone?: boolean;
  autoFocus?: boolean;
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
    desc: "Platformdaki herkes görebilir ve etkileşime girebilir",
    icon: Globe,
  },
  {
    id: "FOLLOWERS",
    label: "Takipçilerim",
    desc: "Sadece seni takip eden kullanıcılar görebilir",
    icon: Users,
  },
  {
    id: "PRIVATE",
    label: "Yalnızca Ben",
    desc: "Gönderi gizlenir, sadece sen görebilirsin",
    icon: Lock,
  },
];

export function CreatePost({
  onPostCreated,
  communityId,
  standalone = false,
  autoFocus = false,
}: CreatePostProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<PostType>("NORMAL");
  const [contentWarning, setContentWarning] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isFocused, setIsFocused] = useState(false);
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visibilityContainerRef = useRef<HTMLDivElement>(null);
  const visibilityBtnRef = useRef<HTMLButtonElement>(null);

  // Close visibility dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        visibilityContainerRef.current &&
        !visibilityContainerRef.current.contains(e.target as Node)
      ) {
        setShowVisibilityMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showVisibilityMenu) {
        setShowVisibilityMenu(false);
        visibilityBtnRef.current?.focus();
      }
    };

    if (showVisibilityMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showVisibilityMenu]);

  // Autofocus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const totalAllowed = 4 - mediaFiles.length;
      if (totalAllowed <= 0) {
        toast.error("En fazla 4 medya dosyası ekleyebilirsiniz.");
        return;
      }
      setMediaFiles((prev) => [...prev, ...selected.slice(0, totalAllowed)]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length >= 6) {
      toast.error("En fazla 6 anket seçeneği ekleyebilirsiniz.");
      return;
    }
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      toast.error("Anket en az 2 seçenek içermelidir.");
      return;
    }
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (index: number, value: string) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const isFormValid = () => {
    if (loading) return false;
    if (content.length > 2000) return false;
    if (postType === "NORMAL") return content.trim().length > 0 || mediaFiles.length > 0;
    if (postType === "SENSITIVE")
      return (
        contentWarning.trim().length > 0 && (content.trim().length > 0 || mediaFiles.length > 0)
      );
    if (postType === "POLL")
      return content.trim().length > 0 && pollOptions.filter((o) => o.trim()).length >= 2;
    return false;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return openModal();

    // Validation
    if (content.length > 2000) {
      toast.error("Gönderiniz en fazla 2000 karakter olabilir.");
      return;
    }

    if (postType === "NORMAL" && !content.trim() && mediaFiles.length === 0) {
      toast.error("Lütfen bir şeyler yazın veya medya ekleyin.");
      return;
    }

    if (postType === "SENSITIVE") {
      if (!contentWarning.trim()) {
        toast.error("Lütfen içerik uyarısı başlığı ekleyin.");
        return;
      }
      if (!content.trim() && mediaFiles.length === 0) {
        toast.error("Lütfen hassas içerik metni veya medya ekleyin.");
        return;
      }
    }

    if (postType === "POLL") {
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error("Lütfen en az 2 geçerli anket seçeneği girin.");
        return;
      }
      if (!content.trim()) {
        toast.error("Lütfen anket sorunuzu yazın.");
        return;
      }
    }

    setLoading(true);

    try {
      const mediaUrls: { url: string; type: string }[] = [];
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetchApi("/media/upload", { method: "POST", data: formData });
        const json = await res.json();
        if (json.success) {
          mediaUrls.push({ url: json.data.url, type: json.data.type });
        }
      }

      const filteredOptions = pollOptions.filter((o) => o.trim());
      const res = await fetchApi("/posts", {
        method: "POST",
        data: {
          content,
          visibility,
          media: mediaUrls,
          communityId,
          postType,
          contentWarning: postType === "SENSITIVE" ? contentWarning : undefined,
          pollOptions: postType === "POLL" ? filteredOptions : undefined,
        },
      });
      const json = await res.json();

      if (json.success) {
        setContent("");
        setMediaFiles([]);
        setPostType("NORMAL");
        setContentWarning("");
        setPollOptions(["", ""]);
        setIsFocused(false);
        setVisibility("PUBLIC");
        toast.success("Gönderiniz paylaşıldı!");
        if (onPostCreated) onPostCreated(json.data);
      } else {
        toast.error(json.error?.message || "Gönderi paylaşılamadı");
      }
    } catch (e: any) {
      toast.error(e.message || "Bağlantı hatası");
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
      className={cn(
        "w-full transition-all duration-200",
        !standalone &&
          "bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs p-4 sm:p-5 mb-3 mx-2 sm:mx-4"
      )}
    >
      <div className="flex gap-3.5 sm:gap-4">
        {/* User Avatar */}
        <div className="shrink-0 pt-0.5">
          <Avatar
            url={user?.avatarUrl}
            name={user?.displayName || user?.username || "?"}
            size={standalone ? "md" : "md"}
          />
        </div>

        {/* Input Area */}
        <div className="flex-1 min-w-0">
          {/* User Info & Visibility Selector */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                {user?.displayName || user?.username || "Giriş yapın"}
              </span>
              {user?.isVerified && (
                <VerifiedBadge iconClassName="w-3.5 h-3.5 text-blue-500" withModal={false} />
              )}
            </div>

            {/* Visibility Selector */}
            <div ref={visibilityContainerRef} className="relative">
              <button
                ref={visibilityBtnRef}
                type="button"
                id="post-visibility-button"
                aria-haspopup="listbox"
                aria-expanded={showVisibilityMenu}
                aria-controls="post-visibility-menu"
                aria-label={`Görünürlük: ${activeVisibility.label}`}
                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              >
                <ActiveIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{activeVisibility.label}</span>
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
                    id="post-visibility-menu"
                    role="listbox"
                    aria-label="Gönderi görünürlük seçenekleri"
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-[#161E2E] rounded-xl shadow-xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden z-40 p-1.5"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Gönderiyi Kimler Görebilir?
                    </div>
                    {VISIBILITY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = visibility === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setVisibility(opt.id);
                            setShowVisibilityMenu(false);
                            visibilityBtnRef.current?.focus();
                          }}
                          className={cn(
                            "w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer group",
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                          )}
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                              isSelected
                                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400"
                                : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
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
          </div>

          {/* Sensitive Warning Input Area */}
          <AnimatePresence>
            {postType === "SENSITIVE" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mb-3 overflow-hidden"
              >
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-2.5 flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="İçerik uyarısı başlığı (Örn: Spoiler, Hassas)..."
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-amber-900 dark:text-amber-200 placeholder:text-amber-500/70 focus:ring-0"
                    value={contentWarning}
                    onChange={(e) => setContentWarning(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Textarea & Mention Autocomplete */}
          <div className="relative w-full mb-3">
            <textarea
              ref={inputRef}
              rows={standalone ? 5 : isFocused || content ? 3 : 2}
              onFocus={() => {
                if (!isAuthenticated) {
                  inputRef.current?.blur();
                  openModal();
                } else {
                  setIsFocused(true);
                }
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (isFormValid()) {
                    handleSubmit();
                  }
                }
              }}
              placeholder={
                postType === "POLL"
                  ? "Topluluğa bir soru sor..."
                  : postType === "SENSITIVE"
                  ? "Gizlenecek içeriği buraya yaz..."
                  : standalone
                  ? "Neler düşünüyorsun? Düşüncelerini, projelerini veya sorularını toplulukla paylaş..."
                  : "Neler oluyor? Paylaş..."
              }
              className={cn(
                "w-full bg-transparent resize-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-1 transition-all leading-relaxed font-normal",
                standalone
                  ? "min-h-[140px] text-base"
                  : "min-h-[56px] text-[15px]"
              )}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (!standalone) {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.max(56, e.target.scrollHeight)}px`;
                }
              }}
            />
            <MentionAutocomplete text={content} onSelect={setContent} inputRef={inputRef as any} />
          </div>

          {/* Poll Options Editor */}
          <AnimatePresence>
            {postType === "POLL" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mb-3 flex flex-col gap-2 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06] overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`${idx + 1}. Seçenek`}
                        value={opt}
                        onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        maxLength={80}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          aria-label={`${idx + 1}. seçeneği sil`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 py-1.5 px-2.5 rounded-lg transition-colors mt-1 self-start cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Seçenek Ekle</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Previews */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {mediaFiles.map((f, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] group"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt="Seçilen Medya"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(i)}
                    aria-label="Medyayı kaldır"
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar: Action Icons, Character Counter & Submit Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1 -ml-1">
              {/* Media Upload */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else fileInputRef.current?.click();
                }}
                disabled={mediaFiles.length >= 4}
                title="Görsel veya Video Ekle (En fazla 4 dosya)"
                aria-label="Medya Ekle (Görsel veya Video)"
                className="flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4.5 h-4.5 stroke-[1.75]" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />

              {/* Poll Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return openModal();
                  setPostType(postType === "POLL" ? "NORMAL" : "POLL");
                }}
                title="Anket Ekle"
                aria-label="Anket Ekle"
                className={cn(
                  "flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl transition-colors cursor-pointer",
                  postType === "POLL"
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                )}
              >
                <ListOrdered className="w-4.5 h-4.5 stroke-[1.75]" />
              </button>

              {/* Sensitive Warning Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return openModal();
                  setPostType(postType === "SENSITIVE" ? "NORMAL" : "SENSITIVE");
                }}
                title="Hassas İçerik Uyarısı Ekle"
                aria-label="Hassas İçerik Uyarısı Ekle"
                className={cn(
                  "flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl transition-colors cursor-pointer",
                  postType === "SENSITIVE"
                    ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                    : "text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                )}
              >
                <ShieldAlert className="w-4.5 h-4.5 stroke-[1.75]" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Character Counter */}
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

              {/* Submit Button */}
              <Button
                variant="primary"
                size="sm"
                disabled={!isFormValid()}
                isLoading={loading}
                onClick={handleSubmit}
                className="px-5 py-2 font-semibold rounded-xl text-xs shadow-xs"
              >
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
