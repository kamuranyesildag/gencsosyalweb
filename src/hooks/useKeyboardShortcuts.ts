import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  postsLength: number;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  onLikeCurrent: () => void;
  onRepostCurrent: () => void;
  onFocusCompose: () => void;
  onToggleHelpModal: () => void;
  onRefreshFeed: () => void;
}

export function useKeyboardShortcuts({
  postsLength,
  focusedIndex,
  setFocusedIndex,
  onLikeCurrent,
  onRepostCurrent,
  onFocusCompose,
  onToggleHelpModal,
  onRefreshFeed,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, contentEditable, or modal
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[role='dialog']") ||
          target.closest(".monaco-editor"))
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < postsLength - 1 ? prev + 1 : prev;
          scrollToPost(next);
          return next;
        });
      } else if (key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0;
          scrollToPost(next);
          return next;
        });
      } else if (key === "l") {
        e.preventDefault();
        onLikeCurrent();
      } else if (key === "r") {
        e.preventDefault();
        onRepostCurrent();
      } else if (key === "c") {
        e.preventDefault();
        onFocusCompose();
      } else if (key === "?" || key === "h") {
        e.preventDefault();
        onToggleHelpModal();
      } else if (key === ".") {
        e.preventDefault();
        onRefreshFeed();
      }
    };

    const scrollToPost = (index: number) => {
      if (index < 0) return;
      setTimeout(() => {
        const postElement = document.getElementById(`post-index-${index}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    postsLength,
    focusedIndex,
    setFocusedIndex,
    onLikeCurrent,
    onRepostCurrent,
    onFocusCompose,
    onToggleHelpModal,
    onRefreshFeed,
  ]);
}
