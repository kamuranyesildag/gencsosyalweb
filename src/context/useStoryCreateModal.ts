import { create } from 'zustand';

interface StoryCreateModalState {
  isOpen: boolean;
  openStoryCreate: () => void;
  closeStoryCreate: () => void;
}

export const useStoryCreateModalStore = create<StoryCreateModalState>((set) => ({
  isOpen: false,
  openStoryCreate: () => set({ isOpen: true }),
  closeStoryCreate: () => set({ isOpen: false }),
}));
