import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { fetchApi } from '../lib/api';

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
  user: Story['user'];
  stories: Story[];
}

interface StoryViewerProps {
  usersWithStories: UserStories[];
  initialUserIndex: number;
  onClose: () => void;
}

export function StoryViewer({ usersWithStories, initialUserIndex, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const currentUserStories = usersWithStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUserIndex, currentStoryIndex, currentUserStories]);

  useEffect(() => {
    if (!currentStory) return;
    
    setLoading(true);
    setProgress(0);

    // Record view
    fetchApi(`/stories/${currentStory.id}/view`, { method: 'POST' }).catch(() => {});
  }, [currentStory?.id]);

  useEffect(() => {
    if (isPaused || loading || !currentStory) return;

    let duration = 5000; // default 5s
    if (currentStory.mediaType === 'video') {
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
  }, [currentStory, isPaused, loading, currentUserIndex, currentStoryIndex]);

  const handleNext = () => {
    if (!currentUserStories) return;
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(c => c + 1);
    } else if (currentUserIndex < usersWithStories.length - 1) {
      setCurrentUserIndex(c => c + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(c => c - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(c => c - 1);
      const prevUserStories = usersWithStories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUserStories ? prevUserStories.stories.length - 1 : 0);
    }
  };

  if (!currentStory || !currentUserStories) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-md flex items-center justify-center select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Hikaye Görüntüleyici"
      >
        {/* Navigation Buttons (Desktop) */}
        <div className="hidden md:flex items-center justify-between absolute inset-x-8 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={currentUserIndex === 0 && currentStoryIndex === 0}
            aria-label="Önceki Hikaye"
            className="w-12 h-12 rounded-full bg-white dark:bg-slate-950/10 hover:bg-white dark:bg-slate-950/20 active:scale-95 disabled:opacity-20 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            aria-label="Sonraki Hikaye"
            className="w-12 h-12 rounded-full bg-white dark:bg-slate-950/10 hover:bg-white dark:bg-slate-950/20 active:scale-95 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Story Card Container */}
        <div 
          className="relative w-full h-full sm:w-[420px] sm:h-[840px] sm:max-h-[92vh] sm:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Gradient Overlay */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-20 pointer-events-none" />

          {/* Progress Bars */}
          <div className="absolute top-0 inset-x-0 px-3.5 pt-3.5 z-30 flex gap-1.5">
            {currentUserStories.stories.map((story, idx) => (
              <div key={story.id} className="h-1 flex-1 bg-white dark:bg-slate-950/25 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white dark:bg-slate-950 transition-all duration-75 ease-linear rounded-full"
                  style={{ 
                    width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 inset-x-0 px-4 py-2 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar 
                url={currentUserStories.user.avatarUrl} 
                name={currentUserStories.user.displayName || currentUserStories.user.username} 
                size="sm" 
                className="ring-2 ring-white/40" 
              />
              <div className="flex flex-col">
                <p className="font-bold text-white text-sm tracking-tight drop-shadow-sm truncate max-w-[170px]">
                  {currentUserStories.user.displayName || currentUserStories.user.username}
                </p>
                <p className="text-white/70 text-xs font-medium drop-shadow-xs">
                  {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {currentStory.mediaType === 'video' && (
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                  className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-md transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
              )}
              <button 
                type="button"
                onClick={onClose} 
                aria-label="Kapat"
                className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Media Content */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
                <Loader2 className="w-9 h-9 animate-spin text-white/80" />
              </div>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                {currentStory.mediaType === 'video' ? (
                  <video
                    id={`video-${currentStory.id}`}
                    src={currentStory.mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={isMuted}
                    onEnded={handleNext}
                    onLoadedData={() => setLoading(false)}
                  />
                ) : (
                  <img 
                    src={currentStory.mediaUrl} 
                    alt="Story" 
                    className="w-full h-full object-cover"
                    onLoad={() => setLoading(false)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav Touch/Click Zones */}
          <div 
            className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            role="button"
            aria-label="Önceki"
          />
          <div 
            className="absolute inset-y-16 right-0 w-2/3 z-20 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            role="button"
            aria-label="Sonraki"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
