import { useState, useCallback, useRef, useEffect } from "react";
import { 
  MediaUploadItem, 
  uploadMediaFile, 
  inspectVideoMetadata 
} from "../lib/mediaUpload";
import { toast } from "../components/ui/Toast";

export function useMediaUploadPipeline(maxFiles = 4) {
  const [items, setItems] = useState<MediaUploadItem[]>([]);
  const cancelFnsRef = useRef<Map<string, () => void>>(new Map());

  // Cleanup object URLs and abort pending requests on unmount
  useEffect(() => {
    return () => {
      cancelFnsRef.current.forEach((cancel) => {
        try { cancel(); } catch (e) {}
      });
      cancelFnsRef.current.clear();
      items.forEach((item) => {
        try { URL.revokeObjectURL(item.previewUrl); } catch (e) {}
      });
    };
  }, []);

  const handleUpdateItem = useCallback((updated: MediaUploadItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const startUpload = useCallback((item: MediaUploadItem) => {
    const cancelFn = uploadMediaFile(item, handleUpdateItem);
    cancelFnsRef.current.set(item.id, cancelFn);
  }, [handleUpdateItem]);

  const addFiles = useCallback(async (files: File[]) => {
    const currentCount = items.length;
    const remainingSlots = maxFiles - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`En fazla ${maxFiles} medya dosyası ekleyebilirsiniz.`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv|3gp|avi)$/i) !== null;
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Initial item
      let duration = 0;
      let width = 1280;
      let height = 720;

      if (isVideo) {
        try {
          const meta = await inspectVideoMetadata(file);
          duration = meta.duration;
          width = meta.width;
          height = meta.height;

          if (duration > 600) {
            URL.revokeObjectURL(previewUrl);
            toast.error("Video süresi 10 dakikadan uzun olamaz.");
            continue;
          }
        } catch (e) {}
      }

      const newItem: MediaUploadItem = {
        id,
        file,
        previewUrl,
        isVideo,
        phase: "idle",
        progress: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        statusMessage: "Hazırlanıyor...",
        duration,
        width,
        height,
      };

      setItems((prev) => [...prev, newItem]);
      startUpload(newItem);
    }
  }, [items.length, maxFiles, startUpload]);

  const cancelItem = useCallback((id: string) => {
    const cancelFn = cancelFnsRef.current.get(id);
    if (cancelFn) {
      cancelFn();
      cancelFnsRef.current.delete(id);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    cancelItem(id);
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        try { URL.revokeObjectURL(target.previewUrl); } catch (e) {}
      }
      return prev.filter((item) => item.id !== id);
    });
  }, [cancelItem]);

  const retryItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;

      const resetItem: MediaUploadItem = {
        ...target,
        phase: "idle",
        progress: 0,
        loadedBytes: 0,
        statusMessage: "Yeniden başlatılıyor...",
        error: undefined,
      };

      setTimeout(() => startUpload(resetItem), 50);

      return prev.map((item) => (item.id === id ? resetItem : item));
    });
  }, [startUpload]);

  const clearAll = useCallback(() => {
    cancelFnsRef.current.forEach((cancel) => {
      try { cancel(); } catch (e) {}
    });
    cancelFnsRef.current.clear();
    items.forEach((item) => {
      try { URL.revokeObjectURL(item.previewUrl); } catch (e) {}
    });
    setItems([]);
  }, [items]);

  // Derived state
  const isUploading = items.some(
    (item) => item.phase === "uploading" || item.phase === "processing" || item.phase === "validating"
  );

  const hasErrors = items.some((item) => item.phase === "error");

  const completedMedia = items
    .filter((item) => item.phase === "completed" && item.result?.url)
    .map((item) => ({
      url: item.result!.url,
      type: item.result!.type,
      width: item.width || item.result!.width,
      height: item.height || item.result!.height,
      duration: item.duration || item.result!.duration,
      thumbnailUrl: item.result!.thumbnailUrl,
    }));

  return {
    items,
    addFiles,
    cancelItem,
    removeItem,
    retryItem,
    clearAll,
    isUploading,
    hasErrors,
    completedMedia,
  };
}
