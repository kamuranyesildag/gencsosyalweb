import { create } from 'zustand';

interface StoryViewerState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useStoryViewerStore = create<StoryViewerState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
