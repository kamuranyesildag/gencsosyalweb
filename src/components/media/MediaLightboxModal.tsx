import React, { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../VerifiedBadge";
import { formatTimeAgo } from "../../lib/utils";

export interface MediaItem {
  url: string;
  type?: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: (string | MediaItem)[];
  initialIndex?: number;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  createdAt?: string;
}

export function MediaLightboxModal({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  user,
  createdAt,
}: MediaLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll while open and restore cleanly
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
    },
    [media.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    },
    [media.length]
  );

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  if (!isOpen || typeof document === "undefined" || media.length === 0) {
    return null;
  }

  const currentItem = media[currentIndex] || media[0];
  const itemUrl =
    typeof currentItem === "string"
      ? currentItem
      : currentItem.url || (currentItem as any).mediaUrl || "";
  const itemType =
    typeof currentItem === "string"
      ? ""
      : currentItem.type || (currentItem as any).mediaType || "";

  const isVideo =
    itemType.includes("video") ||
    itemUrl.match(/\.(mp4|webm|ogg)$/i) ||
    itemUrl.includes("video");

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Tam ekran medya görüntüleyici"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl select-none"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-30 flex items-center justify-between p-3.5 sm:p-5 w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        >
          {/* User info */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Avatar
                  url={user.avatarUrl}
                  name={user.displayName || user.username}
                  size="md"
                  className="w-10 h-10 ring-1 ring-white/20"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-sm sm:text-base drop-shadow-xs">
                      {user.displayName || user.username}
                    </span>
                    {user.isVerified && (
                      <VerifiedBadge
                        iconClassName="w-4 h-4 text-blue-400"
                        targetUser={{
                          username: user.username,
                          isVerified: !!user.isVerified,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>@{user.username}</span>
                    {createdAt && <span>• {formatTimeAgo(createdAt)}</span>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls: Counter and Close */}
          <div className="flex items-center gap-3">
            {media.length > 1 && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold tabular-nums">
                {currentIndex + 1} / {media.length}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat (Esc)"
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Canvas Stage */}
        <div
          className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden w-full h-full"
          onClick={onClose}
        >
          {/* Left Navigation Arrow */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Önceki medya (Sol ok)"
              className="absolute left-2 sm:left-6 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Sonraki medya (Sağ ok)"
              className="absolute right-2 sm:right-6 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Active Media Renderer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-full max-h-full flex items-center justify-center z-20"
          >
            {isVideo ? (
              <video
                key={itemUrl}
                src={itemUrl}
                controls
                autoPlay
                playsInline
                className="max-w-[95vw] max-h-[82vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <img
                key={itemUrl}
                src={itemUrl}
                alt={`Medya ${currentIndex + 1}`}
                className="max-w-[95vw] max-h-[82vh] object-contain rounded-xl shadow-2xl transition-transform duration-200"
              />
            )}
          </div>
        </div>

        {/* Bottom indicator dots if multiple media */}
        {media.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-30 flex items-center justify-center gap-1.5 pb-4 pt-2"
          >
            {media.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Görsel ${idx + 1}`}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-6 h-1.5 bg-blue-500"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
