import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { MentionAutocomplete } from "./MentionAutocomplete";
import { fetchApi } from "../lib/api";
import { toast } from "./ui/Toast";
import { 
  Image as ImageIcon, 
  Loader2, 
  X, 
  ListOrdered, 
  ShieldAlert, 
  FileText, 
  Plus, 
  Trash2,
  BadgeCheck,
  Sparkles,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type PostType = "NORMAL" | "POLL" | "SENSITIVE";

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  communityId?: number;
}

export function CreatePost({ onPostCreated, communityId }: CreatePostProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<PostType>("NORMAL");
  const [contentWarning, setContentWarning] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (pollOptions.length >= 8) {
      toast.error("En fazla 8 anket seçeneği ekleyebilirsiniz.");
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

  const handleSubmit = async () => {
    if (!isAuthenticated) return openModal();

    // Validation
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

  const isFormValid = () => {
    if (loading) return false;
    if (postType === "NORMAL") return content.trim().length > 0 || mediaFiles.length > 0;
    if (postType === "SENSITIVE") return contentWarning.trim().length > 0 && (content.trim().length > 0 || mediaFiles.length > 0);
    if (postType === "POLL") return content.trim().length > 0 && pollOptions.filter((o) => o.trim()).length >= 2;
    return false;
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden mb-6 transition-all duration-300 hover:shadow-md hover:border-slate-300/60">
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
        {/* Avatar Area */}
        <div className="shrink-0 pt-1">
          <Avatar
            url={user?.avatarUrl}
            name={user?.displayName || user?.username || "?"}
            size="md"
            className="ring-2 ring-white shadow-xs"
          />
        </div>

        {/* Input Area */}
        <div className="flex-1 min-w-0">
          {/* User Info (Only visible when focused or standalone) */}
          {isAuthenticated && user && (isFocused || content.length > 0 || mediaFiles.length > 0) && (
            <div className="flex items-center gap-1.5 mb-2 -mt-1">
              <span className="font-bold text-slate-900 text-[15px]">{user.displayName || user.username}</span>
              {user.isVerified && <BadgeCheck className="w-4 h-4 text-slate-500" />}
              <span className="text-slate-500 text-[14px]">@{user.username}</span>
            </div>
          )}
          {/* Post Type Selector - Modernized Segmented Control */}
          <div className="flex items-center gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openModal();
                setPostType("NORMAL");
              }}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 ${
                postType === "NORMAL"
                  ? "text-slate-800 bg-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Standart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openModal();
                setPostType("POLL");
              }}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 ${
                postType === "POLL"
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Anket</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openModal();
                setPostType("SENSITIVE");
              }}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 ${
                postType === "SENSITIVE"
                  ? "text-red-700 bg-red-50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Hassas</span>
            </button>
          </div>

          {/* Sensitive Warning Input Area */}
          <AnimatePresence>
            {postType === "SENSITIVE" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-3 overflow-hidden"
              >
                <div className="bg-rose-50/50 border border-rose-100 rounded-[16px] p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="İçerik uyarısı (Örn: Spoiler, Yetişkin)..."
                      className="w-full bg-transparent border-none outline-none text-[14px] font-bold text-rose-950 placeholder:text-rose-400"
                      value={contentWarning}
                      onChange={(e) => setContentWarning(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Textarea & Mention Autocomplete */}
          <div className="relative w-full mb-2">
            <textarea
              ref={inputRef}
              rows={isFocused || content ? 3 : 2}
              onFocus={() => {
                if (!isAuthenticated) {
                  inputRef.current?.blur();
                  openModal();
                } else {
                  setIsFocused(true);
                }
              }}
              placeholder={
                postType === "POLL"
                  ? "Topluluğa bir soru sor..."
                  : postType === "SENSITIVE"
                  ? "Gizlenecek içeriği buraya yaz..."
                  : "Neler oluyor? Paylaş..."
              }
              className="w-full bg-transparent resize-none outline-none text-[15px] sm:text-[17px] min-h-[56px] text-slate-800 placeholder:text-slate-400 py-1 transition-all leading-relaxed"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.max(56, e.target.scrollHeight)}px`;
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
                transition={{ duration: 0.2 }}
                className="mb-4 flex flex-col gap-2 bg-slate-50 p-4 rounded-[20px] border border-slate-100 overflow-hidden"
              >
                <div className="flex flex-col gap-2.5">
                  {pollOptions.map((opt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder={`${idx + 1}. Seçenek`}
                        value={opt}
                        onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[14px] text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all shadow-xs"
                        maxLength={100}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[12px] transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {pollOptions.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="flex items-center justify-center gap-2 text-[13px] font-bold text-slate-900 hover:text-slate-700 hover:bg-slate-100/50 py-2.5 px-3 rounded-[12px] transition-colors mt-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Seçenek Ekle</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Previews */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2.5 mb-4 overflow-x-auto pb-2 snap-x no-scrollbar">
              {mediaFiles.map((f, i) => (
                <div
                  key={i}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[16px] overflow-hidden shrink-0 bg-slate-100 border border-slate-200 snap-center shadow-sm group"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt="Seçilen Medya"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(i)}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1.5 backdrop-blur-md transition-transform active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar: Action Icons & Submit Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 ml-[-8px]">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else fileInputRef.current?.click();
                }}
                disabled={mediaFiles.length >= 4}
                aria-label="Medya Ekle"
                className="flex items-center justify-center w-9 h-9 rounded-full text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
              >
                <ImageIcon className="w-[18px] h-[18px] stroke-[2]" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </div>
            
            <Button
              variant="primary"
              size="sm"
              disabled={!isFormValid()}
              isLoading={loading}
              onClick={handleSubmit}
              className="px-5 py-2 font-bold rounded-full text-[15px] bg-blue-500 hover:bg-blue-600 border-0"
            >
              Paylaş
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
