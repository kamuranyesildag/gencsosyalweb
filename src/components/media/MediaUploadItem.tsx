import React, { useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileVideo, 
  ImageIcon,
  Loader2 
} from "lucide-react";
import { 
  MediaUploadItem as IMediaUploadItem, 
  formatFileSize, 
  formatDuration 
} from "../../lib/mediaUpload";
import { cn } from "../../lib/utils";

interface MediaUploadItemProps {
  item: IMediaUploadItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

export function MediaUploadItem({
  item,
  onRemove,
  onRetry,
  onCancel
}: MediaUploadItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200 p-3 sm:p-3.5 space-y-2.5">
      
      {/* Top Bar: Icon, File Name, Size & Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            {item.isVideo ? <FileVideo className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {item.file.name}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{formatFileSize(item.file.size)}</span>
              {item.isVideo && item.duration ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{formatDuration(item.duration)}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Remove or Cancel Button */}
        <div>
          {item.phase === "uploading" || item.phase === "processing" ? (
            <button
              type="button"
              onClick={() => onCancel(item.id)}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              İptal Et
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label="Medyayı kaldır"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Preview (Responsive & Contained) */}
      <div className="relative aspect-video sm:aspect-[16/9] max-h-56 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center">
        {item.isVideo ? (
          <>
            <video
              ref={videoRef}
              src={item.result?.url || item.previewUrl}
              muted={isMuted}
              playsInline
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {/* Play/Pause & Mute Overlay for Videos */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 sm:opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
              <div className="flex items-center justify-between text-white">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer"
                  aria-label={isPlaying ? "Videoyu duraklat" : "Videoyu oynat"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer"
                  aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <img
            src={item.result?.url || item.previewUrl}
            alt="Yüklenen görsel"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Progress & State Section */}
      <div className="space-y-1.5" aria-live="polite">
        
        {/* Phase 1: Uploading (Real Byte Progress) */}
        {item.phase === "uploading" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.statusMessage}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                %{item.progress}
              </span>
            </div>
            <div 
              role="progressbar" 
              aria-valuemin={0} 
              aria-valuemax={100} 
              aria-valuenow={item.progress}
              className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden"
            >
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Phase 2: Processing / Compression (Indeterminate) */}
        {item.phase === "processing" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{item.statusMessage}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                İşleniyor
              </span>
            </div>
            <div 
              role="progressbar" 
              aria-label="Video işleniyor"
              className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden relative"
            >
              <div className="absolute inset-y-0 w-1/3 bg-blue-600 rounded-full animate-shimmer" />
            </div>
          </div>
        )}

        {/* Phase 3: Completed */}
        {item.phase === "completed" && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{item.isVideo ? "Video hazır ve optimize edildi" : "Görsel hazır"}</span>
          </div>
        )}

        {/* Phase 4: Error */}
        {item.phase === "error" && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-400">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{item.error || "İşlem sırasında beklenmedik bir hata oluştu."}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 font-bold transition-colors cursor-pointer text-rose-800 dark:text-rose-300"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tekrar Dene</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 5: Cancelled */}
        {item.phase === "cancelled" && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Yükleme iptal edildi.</span>
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Yeniden Başlat
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
