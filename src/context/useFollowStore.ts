import { create } from "zustand";

interface FollowState {
  followingIds: Set<number>;
  setFollowing: (userId: number, isFollowing: boolean) => void;
  syncFromUser: (userId: number, isFollowing: boolean) => void;
  isFollowing: (userId: number | undefined | null) => boolean;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  followingIds: new Set<number>(),
  setFollowing: (userId: number, isFollowing: boolean) => {
    const id = Number(userId);
    if (isNaN(id) || id <= 0) return;
    set((state) => {
      const next = new Set(state.followingIds);
      if (isFollowing) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return { followingIds: next };
    });
  },
  syncFromUser: (userId: number, isFollowing: boolean) => {
    const id = Number(userId);
    if (isNaN(id) || id <= 0 || !isFollowing) return;
    set((state) => {
      if (state.followingIds.has(id)) return state;
      const next = new Set(state.followingIds);
      next.add(id);
      return { followingIds: next };
    });
  },
  isFollowing: (userId: number | undefined | null) => {
    if (!userId) return false;
    const id = Number(userId);
    if (isNaN(id) || id <= 0) return false;
    return get().followingIds.has(id);
  },
}));
