import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../context/useAuth';
import { fetchApi } from '../../lib/api';
import { AnnouncementModalContent, AnnouncementItem } from './AnnouncementModalContent';
import { standardTransition, standardExitTransition } from '../../lib/motion';

const LOCAL_STORAGE_SEEN_KEY = 'gencsosyal_seen_announcements';

const popupBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: standardTransition },
  exit: { opacity: 0, transition: standardExitTransition },
};

const popupModalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: standardTransition },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: standardExitTransition },
};

export function AnnouncementPopup() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [queue, setQueue] = useState<AnnouncementItem[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  // Helper to read dismissed IDs from localStorage
  const getLocalDismissedIds = useCallback((): number[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SEEN_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  // Helper to store dismissed ID locally
  const storeLocalDismissedId = useCallback((id: number) => {
    try {
      const existing = getLocalDismissedIds();
      if (!existing.includes(id)) {
        existing.push(id);
        localStorage.setItem(LOCAL_STORAGE_SEEN_KEY, JSON.stringify(existing));
      }
    } catch {
      // Ignore storage errors
    }
  }, [getLocalDismissedIds]);

  // Fetch active announcements
  const fetchActiveAnnouncements = useCallback(async () => {
    try {
      const res = await fetchApi('/announcements/active');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const localDismissed = getLocalDismissedIds();
        // Exclude locally dismissed items as an extra guard
        const unreadItems = json.data.filter(
          (item: AnnouncementItem) => item.id && !localDismissed.includes(item.id)
        );

        if (unreadItems.length > 0) {
          setQueue(unreadItems);
          setCurrentAnnouncement(unreadItems[0]);
          setIsOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load active announcements:', err);
    }
  }, [getLocalDismissedIds]);

  // Fetch once after initial auth load
  useEffect(() => {
    if (authLoading) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Small delay to ensure smooth initial page mount
    const timer = setTimeout(() => {
      fetchActiveAnnouncements();
    }, 600);

    return () => clearTimeout(timer);
  }, [authLoading, fetchActiveAnnouncements]);

  // Refetch if user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      hasFetchedRef.current = false;
      fetchActiveAnnouncements();
    }
  }, [isAuthenticated, user?.id, fetchActiveAnnouncements]);

  // Handle dismiss
  const handleDismiss = useCallback(
    (clickedCta: boolean = false) => {
      if (!currentAnnouncement?.id) {
        setIsOpen(false);
        setCurrentAnnouncement(null);
        return;
      }

      const dismissedId = currentAnnouncement.id;

      // 1. Optimistic local storage update
      storeLocalDismissedId(dismissedId);

      // 2. Notify backend in background
      fetchApi(`/announcements/${dismissedId}/seen`, {
        method: 'POST',
        data: { clickedCta },
      }).catch((err) => {
        console.error('Failed to mark announcement as seen on server:', err);
      });

      // 3. Advance queue
      setQueue((prevQueue) => {
        const remaining = prevQueue.slice(1);
        if (remaining.length > 0) {
          // Show next announcement after brief animation pause
          setTimeout(() => {
            setCurrentAnnouncement(remaining[0]);
            setIsOpen(true);
          }, 200);
        } else {
          setCurrentAnnouncement(null);
        }
        return remaining;
      });

      setIsOpen(false);
    },
    [currentAnnouncement, storeLocalDismissedId]
  );

  // Keyboard navigation (ESC key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleDismiss]);

  if (!currentAnnouncement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={popupBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => handleDismiss(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            variants={popupModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            className="relative z-10 w-full max-w-md my-auto"
          >
            <AnnouncementModalContent
              announcement={currentAnnouncement}
              onClose={() => handleDismiss(false)}
              onCtaClick={() => handleDismiss(true)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
