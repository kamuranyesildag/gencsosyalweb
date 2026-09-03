import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Loader2 } from "lucide-react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  estimateSize?: number;
}

export function InfiniteScroll<T>({ 
  items, 
  renderItem, 
  hasMore, 
  isLoading, 
  onLoadMore,
  estimateSize = 200
}: InfiniteScrollProps<T>) {
  const observerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          if (!isAuthenticated) openModal();
          else onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, isAuthenticated, openModal]);

  return (
    <div ref={parentRef}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={observerRef} className="flex justify-center p-6 w-full">
          {isLoading && <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />}
        </div>
      )}
    </div>
  );
}
