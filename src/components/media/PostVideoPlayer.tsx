import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { videoPlaybackManager } from "./videoPlaybackManager";

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onOpenLightbox?: () => void;
  id?: string;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function PostVideoPlayer({
  src,
  poster,
  className,
  onOpenLightbox,
  id,
}: PostVideoPlayerProps) {
  const videoId = useRef(id || `vid-${Math.random().toString(36).substring(2, 9)}`).current;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Register with global video playback manager to pause when another video plays
  useEffect(() => {
    const unregister = videoPlaybackManager.register((activeId) => {
      if (activeId !== videoId && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    });

    return () => {
      unregister();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoId]);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const triggerControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isHovering) {
        setControlsVisible(false);
      }
    }, 2500);
  }, [isPlaying, isHovering]);

  const togglePlay = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!videoRef.current) return;

      if (videoRef.current.paused) {
        videoPlaybackManager.setActiveVideo(videoId);
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasError(false);
            triggerControlsTemporarily();
          })
          .catch((err) => {
            console.error("Video play error:", err);
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setControlsVisible(true);
      }
    },
    [videoId, triggerControlsTemporarily]
  );

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeeking) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setHasError(false);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = parseFloat(e.target.value);
    setCurrentTime(nextTime);
    if (videoRef.current) {
      videoRef.current.currentTime = nextTime;
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const toggleFullscreen = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen request error, falling back to lightbox:", err);
      if (onOpenLightbox) onOpenLightbox();
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasError(false);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setIsHovering(true);
        setControlsVisible(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (isPlaying) setControlsVisible(false);
      }}
      onClick={togglePlay}
      className={cn(
        "group relative w-full rounded-3xl overflow-hidden bg-slate-950 dark:bg-black/95 select-none border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-center cursor-pointer",
        className
      )}
      style={{ maxHeight: "540px" }}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={isMuted}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsBuffering(false);
          setHasError(true);
        }}
        className="w-full max-h-[520px] object-contain transition-transform duration-200 pointer-events-none"
      />

      {/* Buffering Indicator */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 bg-slate-900/90 text-white z-20"
        >
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-xs sm:text-sm text-slate-300 font-medium text-center">
            Video yüklenemedi veya desteklenmeyen format.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tekrar Dene</span>
          </button>
        </div>
      )}

      {/* Center Big Play Button (when stopped) */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/20 transition-all group-hover:scale-105 active:scale-95">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Modern Soft Floating Video Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-200 z-20 flex flex-col gap-1.5",
          controlsVisible || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Timeline Scrubber */}
        <div className="w-full flex items-center gap-2 group/scrubber">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            aria-label="Video ilerleme çubuğu"
            className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons Row with Round Buttons */}
        <div className="flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play/Pause Circular Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Durdur" : "Oynat"}
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors active:scale-95 text-white cursor-pointer flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Mute/Unmute Circular Button */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors active:scale-95 text-white cursor-pointer flex items-center justify-center"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Time Indicator Pill */}
            <span className="font-mono text-[11px] sm:text-xs text-slate-200 tabular-nums px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Fullscreen Circular Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Tam ekran"
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors active:scale-95 text-white cursor-pointer flex items-center justify-center"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
