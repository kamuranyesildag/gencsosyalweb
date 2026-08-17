import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore, children }: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

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
    <>
      {children}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center p-6 w-full">
          {isLoading && <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}
        </div>
      )}
    </>
  );
}
