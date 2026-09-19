import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useStoryCreateModalStore } from "../context/useStoryCreateModal";
import { useStoryViewerStore } from "../context/useStoryViewerStore";
import { toast } from "./ui/Toast";

export interface Story {
  id: number;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  expiresAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
}

export interface UserStories {
  userId: number;
  user: Story["user"];
  stories: Story[];
}

interface StoryViewerProps {
  usersWithStories: UserStories[];
  initialUserIndex: number;
  onClose: () => void;
  onStoryDeleted?: () => void;
}

export function StoryViewer({
  usersWithStories,
  initialUserIndex,
  onClose,
  onStoryDeleted,
}: StoryViewerProps) {
  const { user: currentUser } = useAuthStore();
  const { openStoryCreate } = useStoryCreateModalStore();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewers, setViewers] = useState<any[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notify global store that story viewer is active (hides bottom nav)
  useEffect(() => {
    useStoryViewerStore.getState().setIsOpen(true);
    return () => {
      useStoryViewerStore.getState().setIsOpen(false);
    };
  }, []);

  const currentUserStories = usersWithStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  // Body scroll locking
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close on Escape key, arrows navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUserIndex, currentStoryIndex, currentUserStories]);

  useEffect(() => {
    if (!currentStory) return;

    setLoading(true);
    setProgress(0);
    setShowViewers(false);

    // Record view
    fetchApi(`/stories/${currentStory.id}/view`, { method: "POST" }).catch(() => {});

    if (currentUser?.id === currentUserStories?.userId) {
      fetchApi(`/stories/${currentStory.id}/views`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            if (json.success) setViewers(json.data);
          }
        })
        .catch(() => {});
    }
  }, [currentStory?.id, currentUser?.id, currentUserStories?.userId]);

  useEffect(() => {
    if (isPaused || loading || showViewers || !currentStory) return;

    let duration = 5000; // default 5s
    if (currentStory.mediaType === "video") {
      const video = document.getElementById(`video-${currentStory.id}`) as HTMLVideoElement;
      if (video && video.duration && !isNaN(video.duration)) {
        duration = video.duration * 1000;
      }
    }

    const interval = 40;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory, isPaused, loading, showViewers, currentUserIndex, currentStoryIndex]);

  const handleDelete = async () => {
    if (!currentStory) return;
    if (!confirm("Bu hikayeyi silmek istediğinize emin misiniz?")) return;

    setIsDeleting(true);
    try {
      const res = await fetchApi(`/stories/${currentStory.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Hikaye silindi");
        if (currentUserStories.stories.length > 1) {
          // If there are other stories in this group, transition to next/prev
          if (currentStoryIndex < currentUserStories.stories.length - 1) {
            // Keep index or move
            if (onStoryDeleted) onStoryDeleted();
          } else {
            setCurrentStoryIndex((c) => Math.max(0, c - 1));
            if (onStoryDeleted) onStoryDeleted();
          }
        } else {
          if (onStoryDeleted) onStoryDeleted();
          else onClose();
        }
      } else {
        toast.error(json.error?.message || "Silinemedi");
      }
    } catch (e) {
      toast.error("Silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNext = () => {
    if (!currentUserStories) return;
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex((c) => c + 1);
    } else if (currentUserIndex < usersWithStories.length - 1) {
      setCurrentUserIndex((c) => c + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((c) => c - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((c) => c - 1);
      const prevUserStories = usersWithStories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUserStories ? prevUserStories.stories.length - 1 : 0);
    }
  };

  if (!currentStory || !currentUserStories) return null;

  return typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-black/95 flex items-center justify-center select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Hikaye Görüntüleyici"
          >
            {/* Navigation Buttons (Desktop) */}
            <div className="hidden md:flex items-center justify-between absolute inset-x-8 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                disabled={currentUserIndex === 0 && currentStoryIndex === 0}
                aria-label="Önceki Hikaye"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-20 text-white flex items-center justify-center pointer-events-auto transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Sonraki Hikaye"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center pointer-events-auto transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Story Card Container: True full-screen on mobile, elegant frame on desktop */}
            <div
              className="relative w-full h-[100dvh] sm:w-[420px] sm:h-[750px] sm:max-h-[92vh] sm:rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Top Gradient Overlay */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />

              {/* Progress Bars */}
              <div className="absolute top-0 inset-x-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] z-30 flex gap-1.5">
                {currentUserStories.stories.map((story, idx) => (
                  <div
                    key={story.id}
                    className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                      style={{
                        width:
                          idx < currentStoryIndex
                            ? "100%"
                            : idx === currentStoryIndex
                            ? `${progress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-[max(1.75rem,calc(env(safe-area-inset-top)+1rem))] inset-x-0 px-3.5 py-1.5 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    url={currentUserStories.user.avatarUrl}
                    name={currentUserStories.user.displayName || currentUserStories.user.username}
                    size="sm"
                    className="ring-2 ring-white/60"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold text-white text-xs sm:text-sm tracking-tight truncate max-w-[150px]">
                      {currentUserStories.user.displayName || currentUserStories.user.username}
                    </p>
                    <p className="text-white/70 text-[11px]">
                      {new Date(currentStory.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Hikaye Ekle (Add Story) Button for Owner */}
                  {currentUser?.id === currentUserStories?.userId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPaused(true);
                        openStoryCreate();
                      }}
                      title="Yeni Hikaye Ekle"
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="hidden sm:inline">Hikaye Ekle</span>
                    </button>
                  )}

                  {currentUser?.id === currentUserStories?.userId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      aria-label="Sil"
                      className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {currentStory.mediaType === "video" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                      className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Kapat"
                    className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Main Media Content */}
              <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
                    <Loader2 className="w-8 h-8 animate-spin text-white/80" />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStory.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full min-h-0 flex items-center justify-center"
                  >
                    {currentStory.mediaType === "video" ? (
                      <video
                        id={`video-${currentStory.id}`}
                        src={currentStory.mediaUrl}
                        className="max-w-full max-h-full object-contain"
                        autoPlay
                        playsInline
                        muted={isMuted}
                        onEnded={handleNext}
                        onLoadedData={() => setLoading(false)}
                      />
                    ) : (
                      <img
                        src={currentStory.mediaUrl}
                        alt="Hikaye içeriği"
                        className="max-w-full max-h-full object-contain"
                        onLoad={() => setLoading(false)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav Touch/Click Zones */}
              <div
                className="absolute inset-y-20 left-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                role="button"
                aria-label="Önceki"
              />
              <div
                className="absolute inset-y-20 right-0 w-2/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                role="button"
                aria-label="Sonraki"
              />

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 pointer-events-none" />

              {/* Viewers Toggle for Owner (Placed safely above device safe-area) */}
              {currentUser?.id === currentUserStories?.userId && (
                <div className="absolute bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] inset-x-0 z-40 flex justify-center pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowViewers(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white shadow-lg backdrop-blur-md transition-all active:scale-95 pointer-events-auto cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold tracking-wide">
                      {viewers.length} Görüntüleme
                    </span>
                  </button>
                </div>
              )}

              {/* Viewers Bottom Sheet */}
              <AnimatePresence>
                {showViewers && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowViewers(false)}
                      className="absolute inset-0 bg-black/60 z-40"
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 inset-x-0 bg-white dark:bg-[#0D121D] z-50 rounded-t-3xl max-h-[60%] flex flex-col border-t border-slate-200 dark:border-white/10 shadow-2xl"
                    >
                      <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto my-2.5 shrink-0" />
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/10">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>Görüntüleyenler ({viewers.length})</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowViewers(false)}
                          aria-label="Kapat"
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="overflow-y-auto flex-1 p-3">
                        {viewers.length === 0 ? (
                          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                            Henüz görüntüleyen yok.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {viewers.map((viewer) => (
                              <div
                                key={viewer.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <Avatar
                                  url={viewer.avatarUrl}
                                  name={viewer.displayName || viewer.username}
                                  size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {viewer.displayName || viewer.username}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    @{viewer.username}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {new Date(viewer.viewedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;
}
