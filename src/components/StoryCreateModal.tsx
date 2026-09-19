import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  Type,
  Palette,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  HelpCircle
} from "lucide-react";
import { useAuthStore } from "../context/useAuth";
import { useStoryCreateModalStore } from "../context/useStoryCreateModal";
import { fetchApi } from "../lib/api";
import { toast } from "./ui/Toast";
import { Avatar } from "./ui/Avatar";

// Curated Background Gradients
const GRADIENTS = [
  {
    id: "sunset",
    name: "Gün Batımı",
    css: "from-rose-500 via-pink-600 to-amber-500",
    canvas: ["#f43f5e", "#db2777", "#f59e0b"],
  },
  {
    id: "cosmic",
    name: "Kozmik Gece",
    css: "from-indigo-600 via-purple-600 to-pink-500",
    canvas: ["#4f46e5", "#9333ea", "#ec4899"],
  },
  {
    id: "ocean",
    name: "Okyanus",
    css: "from-blue-600 via-cyan-600 to-teal-500",
    canvas: ["#2563eb", "#0891b2", "#14b8a6"],
  },
  {
    id: "emerald",
    name: "Zümrüt",
    css: "from-emerald-600 via-teal-700 to-slate-900",
    canvas: ["#059669", "#0f766e", "#0f172a"],
  },
  {
    id: "neon",
    name: "Neon Ateş",
    css: "from-amber-500 via-orange-600 to-rose-600",
    canvas: ["#f59e0b", "#ea580c", "#e11d48"],
  },
  {
    id: "midnight",
    name: "Gece Yarısı",
    css: "from-slate-900 via-slate-800 to-black",
    canvas: ["#0f172a", "#1e293b", "#000000"],
  },
];

// Curated Text Filters/Styles
const FONT_STYLES = [
  { id: "sans", label: "Modern", fontClass: "font-sans font-bold", canvasFont: "bold 58px system-ui, -apple-system, sans-serif" },
  { id: "serif", label: "Klasik", fontClass: "font-serif font-semibold italic", canvasFont: "italic 58px Georgia, serif" },
  { id: "mono", label: "Daktilo", fontClass: "font-mono font-medium", canvasFont: "52px monospace" },
];

export function StoryCreateModal() {
  const { isOpen, closeStoryCreate } = useStoryCreateModalStore();
  const { user } = useAuthStore();

  // Mode: 'media' (photo/video upload) vs 'text' (custom text story)
  const [mode, setMode] = useState<"media" | "text">("media");

  // Media state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaCaption, setMediaCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text Story state
  const [textContent, setTextContent] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");

  // Loading & Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Clean up object url
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaCaption("");
      setTextContent("");
      setIsSubmitting(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, selectedFile, textContent]);

  const handleClose = () => {
    if (isSubmitting) return;
    if (selectedFile || textContent.trim()) {
      if (!confirm("Oluşturduğunuz hikaye kaybolacak. Çıkmak istediğinize emin misiniz?")) {
        return;
      }
    }
    closeStoryCreate();
  };

  // File selection handler
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Dosya boyutu en fazla 25MB olabilir");
      return;
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Yalnızca görsel (JPG, PNG, WebP) veya video (MP4) yükleyebilirsiniz");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setMediaType(isVideo ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Render text story onto canvas and export as high-res PNG
  const generateTextStoryBlob = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context oluşturulamadı"));
        return;
      }

      // 1. Draw smooth linear gradient background
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      const colors = selectedGradient.canvas;
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.5, colors[1]);
      grad.addColorStop(1, colors[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle decorative radial glow in center
      const radial = ctx.createRadialGradient(540, 960, 50, 540, 960, 700);
      radial.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      radial.addColorStop(1, "rgba(0, 0, 0, 0.2)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Draw Top User Brand Header
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(user?.displayName || user?.username || "Genç Sosyal", 120, 180);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "28px system-ui, -apple-system, sans-serif";
      ctx.fillText(`@${user?.username || "kullanici"}`, 120, 225);

      // Platform Watermark at bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Genç Sosyal", 540, 1820);

      // 3. Draw Wrapped Story Text
      ctx.fillStyle = "#ffffff";
      ctx.font = selectedFont.canvasFont;
      ctx.textAlign = textAlign;

      // Text shadow for high legibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      const maxWidth = 900;
      const lineHeight = 80;
      const words = textContent.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      // Word wrapping logic
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Center vertically
      const totalTextHeight = lines.length * lineHeight;
      const startY = 960 - totalTextHeight / 2;

      const xPos = textAlign === "center" ? 540 : textAlign === "left" ? 90 : 990;

      lines.forEach((line, index) => {
        ctx.fillText(line, xPos, startY + index * lineHeight);
      });

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Görsel dönüştürülemedi"));
        },
        "image/png",
        0.95
      );
    });
  };

  // Publish Story
  const handlePublish = async () => {
    if (isSubmitting) return;

    if (mode === "media" && !selectedFile) {
      toast.error("Lütfen bir fotoğraf veya video seçin");
      return;
    }

    if (mode === "text" && !textContent.trim()) {
      toast.error("Lütfen bir hikaye metni yazın");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFile: File | Blob;
      let finalType: "image" | "video" = "image";

      if (mode === "media" && selectedFile) {
        finalFile = selectedFile;
        finalType = mediaType;
      } else {
        // Generate high-res text story image
        finalFile = await generateTextStoryBlob();
        finalType = "image";
      }

      // 1. Upload media
      const formData = new FormData();
      formData.append("file", finalFile, mode === "text" ? "story-text.png" : (selectedFile?.name || "story.jpg"));

      const uploadRes = await fetchApi("/media/upload", {
        method: "POST",
        data: formData,
        headers: {},
      });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || !uploadJson.success) {
        throw new Error(uploadJson?.error?.message || "Medya yüklenirken hata oluştu");
      }

      const { url } = uploadJson.data;

      // 2. Insert into stories table
      const storyRes = await fetchApi("/stories", {
        method: "POST",
        data: {
          mediaUrl: url,
          mediaType: finalType,
        },
      });
      const storyJson = await storyRes.json();

      if (!storyRes.ok || !storyJson.success) {
        throw new Error(storyJson?.error?.message || "Hikaye kaydedilemedi");
      }

      toast.success("Hikayen başarıyla paylaşıldı!");
      
      // Notify components (StoriesBar) to refresh
      window.dispatchEvent(new CustomEvent("stories_updated"));

      closeStoryCreate();
    } catch (err: any) {
      console.error("Story publish error:", err);
      toast.error(err.message || "Hikaye paylaşılırken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center select-none bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Yeni Hikaye Oluştur"
              className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white dark:bg-[#0D121D] sm:rounded-3xl border-0 sm:border border-slate-200/80 dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      Hikaye Oluştur
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      24 saat sonra kaybolacak anını paylaş
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Switcher Tabs */}
                  <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setMode("media")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mode === "media"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Medya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("text")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mode === "text"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Metin</span>
                    </button>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    aria-label="Kapat"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* PREVIEW CONTAINER (9:16 Story Phone Frame) */}
                <div className="relative w-[260px] sm:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 shrink-0 flex flex-col bg-slate-950">
                  {/* Mode 1: Media Preview */}
                  {mode === "media" && (
                    <>
                      {previewUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                          {mediaType === "video" ? (
                            <video
                              src={previewUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={previewUrl}
                              alt="Hikaye önizleme"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Subtle Top User Info */}
                          <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10">
                            <Avatar
                              url={user?.avatarUrl}
                              name={user?.displayName || user?.username || "Sen"}
                              size="xs"
                              className="ring-1 ring-white/60"
                            />
                            <span className="text-white text-[11px] font-semibold tracking-tight truncate drop-shadow-md">
                              {user?.displayName || user?.username}
                            </span>
                          </div>

                          {/* Optional Caption Overlay */}
                          {mediaCaption && (
                            <div className="absolute bottom-4 inset-x-3 text-center z-10">
                              <span className="inline-block px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium max-w-full break-words shadow-md">
                                {mediaCaption}
                              </span>
                            </div>
                          )}

                          {/* Reset/Change Media Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            aria-label="Medyayı Değiştir"
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-20"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
                            isDragging
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-xs">
                            <Upload className="w-6 h-6 stroke-[2]" />
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Fotoğraf veya Video Seç
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                            Sürükleyip bırakın veya cihazınızdan yükleyin (Max 25MB)
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Mode 2: Text Story Preview */}
                  {mode === "text" && (
                    <div
                      className={`relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br ${selectedGradient.css} transition-all duration-300`}
                    >
                      {/* Top User Header */}
                      <div className="flex items-center gap-2">
                        <Avatar
                          url={user?.avatarUrl}
                          name={user?.displayName || user?.username || "Sen"}
                          size="xs"
                          className="ring-1 ring-white/60"
                        />
                        <div className="flex flex-col">
                          <span className="text-white text-[11px] font-semibold tracking-tight leading-none drop-shadow-sm">
                            {user?.displayName || user?.username}
                          </span>
                          <span className="text-white/70 text-[9px] drop-shadow-sm">
                            @{user?.username}
                          </span>
                        </div>
                      </div>

                      {/* Story Content Live Area */}
                      <div
                        className={`my-auto text-white drop-shadow-md break-words ${
                          selectedFont.fontClass
                        } ${
                          textAlign === "center"
                            ? "text-center"
                            : textAlign === "left"
                            ? "text-left"
                            : "text-right"
                        } ${
                          textContent.length > 150
                            ? "text-sm leading-snug"
                            : textContent.length > 80
                            ? "text-base leading-snug"
                            : "text-lg leading-relaxed"
                        }`}
                      >
                        {textContent || (
                          <span className="opacity-50 italic font-normal">
                            Hikayeni buraya yaz...
                          </span>
                        )}
                      </div>

                      {/* Bottom Brand Watermark */}
                      <div className="text-center opacity-40 text-[10px] font-semibold tracking-widest uppercase text-white">
                        Genç Sosyal
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/mp4,video/quicktime,video/webm"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* CONTROLS & CUSTOMIZATION PANEL */}
                <div className="flex-1 w-full max-w-sm flex flex-col gap-4">
                  {mode === "media" ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Açıklama / Başlık (İsteğe Bağlı)
                        </label>
                        <input
                          type="text"
                          value={mediaCaption}
                          onChange={(e) => setMediaCaption(e.target.value)}
                          placeholder="Hikayene bir yazı ekle..."
                          maxLength={120}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                          <span>Görselin altında gösterilir</span>
                          <span>{mediaCaption.length}/120</span>
                        </div>
                      </div>

                      {!selectedFile && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800/40"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Dosya Seç</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Text Mode Controls */
                    <div className="flex flex-col gap-3.5">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Hikaye Metni
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {textContent.length}/280
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder="Düşünceni, gününü veya duyurunu yaz..."
                          maxLength={280}
                          autoFocus
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        />
                      </div>

                      {/* Gradient Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Arka Plan Teması
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {GRADIENTS.map((grad) => (
                            <button
                              key={grad.id}
                              type="button"
                              onClick={() => setSelectedGradient(grad)}
                              aria-label={grad.name}
                              title={grad.name}
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad.css} relative transition-transform cursor-pointer shadow-xs ${
                                selectedGradient.id === grad.id
                                  ? "scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#0D121D]"
                                  : "hover:scale-105 opacity-80 hover:opacity-100"
                              }`}
                            >
                              {selectedGradient.id === grad.id && (
                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md stroke-[3]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Style & Alignment Selector */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        {/* Font Style */}
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                            Yazı Tipi
                          </label>
                          <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl">
                            {FONT_STYLES.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSelectedFont(f)}
                                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  selectedFont.id === f.id
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Alignment */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                            Hizalama
                          </label>
                          <div className="flex gap-0.5 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setTextAlign("left")}
                              aria-label="Sola Hizala"
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                textAlign === "left"
                                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                  : "text-slate-500"
                              }`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextAlign("center")}
                              aria-label="Ortala"
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                textAlign === "center"
                                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                  : "text-slate-500"
                              }`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextAlign("right")}
                              aria-label="Sağa Hizala"
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                textAlign === "right"
                                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                  : "text-slate-500"
                              }`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expiration Note */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    <span>Paylaştığınız hikayeler 24 saat sonra otomatik olarak kaybolur.</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0A0E17]/50 shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || (mode === "media" ? !selectedFile : !textContent.trim())}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Paylaşılıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Hikayede Paylaş</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )
    : null;
}
