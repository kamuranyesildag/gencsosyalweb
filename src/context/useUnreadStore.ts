import { create } from 'zustand';
import { fetchApi } from '../lib/api';
import { useAuthStore } from './useAuth';

interface UnreadState {
  unreadNotifications: number;
  unreadMessages: number;
  fetchUnread: () => Promise<void>;
  markNotificationsRead: () => void;
  markMessagesRead: () => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadNotifications: 0,
  unreadMessages: 0,

  fetchUnread: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ unreadNotifications: 0, unreadMessages: 0 });
      return;
    }

    try {
      // 1. Fetch unread notifications
      const notifRes = await fetchApi('/notifications?limit=20');
      let notifCount = 0;
      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        if (notifJson.success && Array.isArray(notifJson.data)) {
          notifCount = notifJson.data.filter((n: any) => !n.isRead).length;
        }
      }

      // 2. Fetch unread messages
      const msgRes = await fetchApi('/messages/conversations');
      let msgCount = 0;
      if (msgRes.ok) {
        const msgJson = await msgRes.json();
        if (msgJson.success && Array.isArray(msgJson.data)) {
          msgCount = msgJson.data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        }
      }

      set({
        unreadNotifications: notifCount,
        unreadMessages: msgCount,
      });
    } catch {
      // Graceful fallback on network glitch
    }
  },

  markNotificationsRead: () => set({ unreadNotifications: 0 }),
  markMessagesRead: () => set({ unreadMessages: 0 }),
}));
