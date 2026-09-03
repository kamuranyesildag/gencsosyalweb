import React, { useEffect, useState, useRef } from 'react';
import { Avatar } from './ui/Avatar';
import { Plus, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { StoryViewer } from './StoryViewer';
import { useAuthStore } from '../context/useAuth';
import { useAuthModalStore } from '../context/useAuthModal';
import { toast } from './ui/Toast';
import { motion } from 'motion/react';

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

export function StoriesBar() {
  const [usersWithStories, setUsersWithStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const loadStories = async () => {
    try {
      const res = await fetchApi('/stories');
      const json = await res.json();
      if (json.success) {
        // Group by user
        const grouped = json.data.reduce((acc: Record<number, UserStories>, story: Story) => {
          if (!acc[story.user.id]) {
            acc[story.user.id] = { userId: story.user.id, user: story.user, stories: [] };
          }
          acc[story.user.id].stories.push(story);
          return acc;
        }, {});

        // Ensure current user is first if they have stories, otherwise just values
        const storiesArray = Object.values(grouped) as UserStories[];
        storiesArray.sort((a, b) => {
          if (a.userId === currentUser?.id) return -1;
          if (b.userId === currentUser?.id) return 1;
          return 0;
        });

        setUsersWithStories(storiesArray);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB for video/image)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Dosya boyutu en fazla 25MB olabilir');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload media
      const mediaRes = await fetchApi('/media/upload', {
        method: 'POST',
        data: formData,
        headers: {} // Let browser set multipart boundary
      });
      const mediaJson = await mediaRes.json();

      if (!mediaRes.ok || !mediaJson.success) {
        throw new Error(mediaJson?.error?.message || 'Yükleme başarısız');
      }

      const { url, type } = mediaJson.data;

      // 2. Create story
      await fetchApi('/stories', {
        method: 'POST',
        data: { mediaUrl: url, mediaType: type }
      });

      toast.success('Hikayen başarıyla paylaşıldı!');
      // Refresh stories
      await loadStories();
    } catch (err: any) {
      toast.error(err.message || 'Hikaye paylaşılırken bir hata oluştu');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentUserHasStory = usersWithStories.some(u => u.userId === currentUser?.id);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/90 py-3.5 px-4 overflow-hidden select-none">
        <div className="flex gap-4 items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
              <div className="w-[66px] h-[66px] rounded-full bg-slate-100 dark:bg-slate-900 ring-2 ring-slate-200/60 p-0.5" />
              <div className="w-12 h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <section 
        className="w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] mx-2 sm:mx-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-[24px] shadow-sm py-4 px-3 sm:px-4 mt-4 mb-2 overflow-hidden relative select-none"
        aria-label="Hikayeler"
      >
        <div className="flex gap-3 sm:gap-4 items-center overflow-x-auto no-scrollbar scroll-smooth py-1 px-1">
          {/* 1. Current User Story / Add Story Card */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <motion.div 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative rounded-full p-[2.5px] cursor-pointer transition-all duration-200 ${
                currentUserHasStory 
                  ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-slate-600 shadow-xs' 
                  : 'bg-transparent'
              }`}
              onClick={() => {
                if (currentUserHasStory) {
                  const idx = usersWithStories.findIndex(u => u.userId === currentUser?.id);
                  setViewerIndex(idx);
                } else {
                  if (!isAuthenticated) return openModal();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={currentUserHasStory ? 'Hikayeni görüntüle' : 'Yeni hikaye ekle'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (currentUserHasStory) {
                    const idx = usersWithStories.findIndex(u => u.userId === currentUser?.id);
                    setViewerIndex(idx);
                  } else {
                    if (!isAuthenticated) return openModal();
                    fileInputRef.current?.click();
                  }
                }
              }}
            >
              <div className="p-0.5 bg-white dark:bg-slate-950 rounded-full">
                <Avatar 
                  url={currentUser?.avatarUrl} 
                  name={currentUser?.displayName || currentUser?.username || 'Sen'} 
                  size="lg" 
                  className="w-[52px] h-[52px] md:w-14 md:h-14 sm:w-15 sm:h-15"
                />
              </div>

              {!currentUserHasStory && (
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-slate-600 to-violet-600 text-white flex items-center justify-center ring-2 ring-white shadow-md hover:scale-110 active:scale-95 transition-transform"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isAuthenticated) return openModal(); 
                    fileInputRef.current?.click(); 
                  }}
                  disabled={isUploading}
                  aria-label="Hikaye Yükle"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </button>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/mp4" 
                onChange={handleUpload}
              />
            </motion.div>
            <span className="text-xs font-semibold text-slate-700 truncate w-16 text-center">
              {currentUserHasStory ? 'Hikayen' : 'Ekle'}
            </span>
          </div>

          {/* 2. Other Users' Stories */}
          {usersWithStories.filter(u => u.userId !== currentUser?.id).map((u) => {
            const viewerIdx = usersWithStories.findIndex(us => us.userId === u.userId);
            return (
              <div 
                key={u.userId} 
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group hover:scale-105 active:scale-95 transition-transform duration-150"
                onClick={() => setViewerIndex(viewerIdx)}
                role="button"
                tabIndex={0}
                aria-label={`${u.user.displayName || u.user.username} adlı kullanıcının hikayesi`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setViewerIndex(viewerIdx);
                  }
                }}
              >
                <div className="rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-slate-600 group-hover:shadow-md group-hover:shadow-slate-500/10 transition-all duration-200">
                  <div className="p-0.5 bg-white dark:bg-slate-950 rounded-full">
                    <Avatar 
                      url={u.user.avatarUrl} 
                      name={u.user.displayName || u.user.username} 
                      size="lg" 
                      className="w-[52px] h-[52px] md:w-14 md:h-14 sm:w-15 sm:h-15"
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-100 truncate w-16 text-center tracking-tight">
                  {u.user.displayName || u.user.username}
                </span>
              </div>
            );
          })}

          {/* Empty state hint if only 0 stories */}
          {usersWithStories.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-slate-400 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>İlk hikayeni paylaşarak gününü başlat!</span>
            </div>
          )}
        </div>
      </section>

      {/* Story Viewer Modal */}
      {viewerIndex !== null && (
        <StoryViewer 
          usersWithStories={usersWithStories} 
          initialUserIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
    </>
  );
}
