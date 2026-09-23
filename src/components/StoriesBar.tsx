import React, { useEffect, useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Plus, Sparkles } from "lucide-react";
import { fetchApi } from "../lib/api";
import { StoryViewer } from "./StoryViewer";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useStoryCreateModalStore } from "../context/useStoryCreateModal";

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

export function StoriesBar() {
  const [usersWithStories, setUsersWithStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { openStoryCreate } = useStoryCreateModalStore();

  const loadStories = async () => {
    try {
      const res = await fetchApi("/stories");
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

        const storiesArray = Object.values(grouped) as UserStories[];

        // Sort stories within each user chronologically (oldest to newest)
        storiesArray.forEach((u) => {
          u.stories.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        // Ensure current user is first if they have stories
        storiesArray.sort((a, b) => {
          if (a.userId === currentUser?.id) return -1;
          if (b.userId === currentUser?.id) return 1;
          return 0;
        });

        setUsersWithStories(storiesArray);
      }
    } catch (e) {
      console.error("Stories load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();

    // Listen for story updates (e.g. from StoryCreateModal)
    const handleStoriesUpdated = () => {
      loadStories();
    };
    window.addEventListener("stories_updated", handleStoriesUpdated);
    return () => {
      window.removeEventListener("stories_updated", handleStoriesUpdated);
    };
  }, [currentUser?.id]);

  const currentUserHasStory = usersWithStories.some((u) => u.userId === currentUser?.id);

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-3 px-4 shadow-xs overflow-hidden">
        <div className="flex gap-4 items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
              <div className="w-13 h-13 rounded-full bg-slate-100 dark:bg-slate-800/60" />
              <div className="w-12 h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <section
        className="w-full bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs py-3 px-3.5 overflow-hidden select-none"
        aria-label="Hikayeler"
      >
        <div className="flex gap-3.5 items-center overflow-x-auto scrollbar-none py-0.5 px-0.5 overscroll-x-contain touch-pan-x">
          {/* 1. Current User Story Item */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              {/* Profile Avatar button */}
              <button
                type="button"
                onClick={() => {
                  if (currentUserHasStory) {
                    const idx = usersWithStories.findIndex((u) => u.userId === currentUser?.id);
                    setViewerIndex(idx);
                  } else {
                    if (!isAuthenticated) return openModal();
                    openStoryCreate();
                  }
                }}
                aria-label={currentUserHasStory ? "Hikayeni görüntüle" : "Modern hikaye oluştur"}
                className={`relative rounded-full p-[2px] transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  currentUserHasStory
                    ? "ring-2 ring-gradient ring-blue-500 ring-offset-2 dark:ring-offset-[#0D121D] hover:scale-105"
                    : "hover:opacity-90 active:scale-95"
                }`}
              >
                <div className="rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Avatar
                    url={currentUser?.avatarUrl}
                    name={currentUser?.displayName || currentUser?.username || "Sen"}
                    size="md"
                    className="w-13 h-13"
                  />
                </div>
              </button>

              {/* Hikaye Ekle (+) Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) return openModal();
                  openStoryCreate();
                }}
                aria-label="Hikayeye Yeni Ekle"
                title={currentUserHasStory ? "Başka Hikaye Ekle" : "Hikaye Oluştur"}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0D121D] shadow-xs active:scale-95 transition-all cursor-pointer z-10"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-14 text-center">
              {currentUserHasStory ? "Hikayen" : "Sen"}
            </span>
          </div>

          {/* 2. Other Users' Stories */}
          {usersWithStories
            .filter((u) => u.userId !== currentUser?.id)
            .map((u) => {
              const viewerIdx = usersWithStories.findIndex((us) => us.userId === u.userId);
              return (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => setViewerIndex(viewerIdx)}
                  aria-label={`${u.user.displayName || u.user.username} kullanıcısının hikayesi`}
                  className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                >
                  <div className="rounded-full p-[2px] ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#0D121D] transition-transform group-hover:scale-105 active:scale-95">
                    <div className="rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <Avatar
                        url={u.user.avatarUrl}
                        name={u.user.displayName || u.user.username}
                        size="md"
                        className="w-13 h-13"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate w-14 text-center tracking-tight transition-colors">
                    {u.user.displayName || u.user.username}
                  </span>
                </button>
              );
            })}

          {/* Empty hint */}
          {usersWithStories.length === 0 && (
            <div className="flex items-center gap-2 px-2 py-1 text-slate-400 dark:text-slate-500 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Günün ilk hikayesini sen paylaş!</span>
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
          onStoryDeleted={() => {
            loadStories();
          }}
        />
      )}
    </>
  );
}
