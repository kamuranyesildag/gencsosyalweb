import { useAuthStore } from "../context/useAuth";

export type UploadPhase = 
  | "idle" 
  | "validating" 
  | "uploading" 
  | "processing" 
  | "completed" 
  | "error" 
  | "cancelled";

export interface MediaUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  phase: UploadPhase;
  progress: number; // 0 to 100 during uploading
  loadedBytes: number;
  totalBytes: number;
  statusMessage: string;
  error?: string;
  duration?: number; // in seconds for video
  width?: number;
  height?: number;
  result?: {
    url: string;
    thumbnailUrl?: string;
    type: "image" | "video";
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  };
  xhr?: XMLHttpRequest;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export async function inspectVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration || 0);
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      cleanup();
      resolve({ duration, width, height });
    };

    video.onerror = () => {
      cleanup();
      // Non-fatal fallback for containers that HTML5 video tag can't parse directly on client
      resolve({ duration: 0, width: 1280, height: 720 });
    };

    // Safety timeout in case browser gets stuck on metadata
    setTimeout(() => {
      cleanup();
      resolve({ duration: 0, width: 1280, height: 720 });
    }, 4000);
  });
}

export function uploadMediaFile(
  item: MediaUploadItem,
  onUpdate: (updated: MediaUploadItem) => void
): () => void {
  const isVideo = item.file.type.startsWith("video/") || item.file.name.match(/\.(mp4|mov|webm|mkv|3gp|avi)$/i) !== null;
  const maxVideoSize = 100 * 1024 * 1024; // 100MB
  const maxImageSize = 10 * 1024 * 1024;  // 10MB

  // Client validation
  if (isVideo && item.file.size > maxVideoSize) {
    onUpdate({
      ...item,
      phase: "error",
      statusMessage: "Dosya boyutu çok büyük.",
      error: "Videolar en fazla 100MB olabilir.",
    });
    return () => {};
  }

  if (!isVideo && item.file.size > maxImageSize) {
    onUpdate({
      ...item,
      phase: "error",
      statusMessage: "Dosya boyutu çok büyük.",
      error: "Görseller en fazla 10MB olabilir.",
    });
    return () => {};
  }

  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append("file", item.file);

  const accessToken = useAuthStore.getState().accessToken;

  // Real upload progress handler (bytes transferred over the wire)
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
      const loadedStr = formatFileSize(e.loaded);
      const totalStr = formatFileSize(e.total);

      if (e.loaded >= e.total) {
        // Upload finished, now server is compressing / processing
        onUpdate({
          ...item,
          xhr,
          phase: "processing",
          progress: 100,
          loadedBytes: e.loaded,
          totalBytes: e.total,
          statusMessage: isVideo 
            ? "Yükleme tamamlandı. Video işleniyor ve optimize ediliyor..." 
            : "Görsel işleniyor...",
        });
      } else {
        onUpdate({
          ...item,
          xhr,
          phase: "uploading",
          progress: percent,
          loadedBytes: e.loaded,
          totalBytes: e.total,
          statusMessage: `${isVideo ? "Video" : "Görsel"} yükleniyor... %${percent} (${loadedStr} / ${totalStr})`,
        });
      }
    }
  };

  // Response arrived from server
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const json = JSON.parse(xhr.responseText);
        if (json.success && json.data) {
          onUpdate({
            ...item,
            xhr: undefined,
            phase: "completed",
            progress: 100,
            statusMessage: "Tamamlandı",
            result: json.data,
            duration: json.data.duration || item.duration,
            width: json.data.width || item.width,
            height: json.data.height || item.height,
          });
          return;
        } else {
          onUpdate({
            ...item,
            xhr: undefined,
            phase: "error",
            statusMessage: "İşlem başarısız",
            error: json.error?.message || "Dosya sunucuda işlenemedi.",
          });
        }
      } catch (parseErr) {
        onUpdate({
          ...item,
          xhr: undefined,
          phase: "error",
          statusMessage: "Yanıt okunamadı",
          error: "Sunucudan geçersiz yanıt alındı.",
        });
      }
    } else {
      let errorMsg = "Yükleme sırasında hata oluştu.";
      try {
        const errJson = JSON.parse(xhr.responseText);
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {}

      onUpdate({
        ...item,
        xhr: undefined,
        phase: "error",
        statusMessage: "Hata",
        error: errorMsg,
      });
    }
  };

  // Network error
  xhr.onerror = () => {
    onUpdate({
      ...item,
      xhr: undefined,
      phase: "error",
      statusMessage: "Bağlantı hatası",
      error: "Ağ bağlantısı kesildi. Lütfen tekrar deneyin.",
    });
  };

  // Abort handler
  xhr.onabort = () => {
    onUpdate({
      ...item,
      xhr: undefined,
      phase: "cancelled",
      statusMessage: "İptal edildi",
      error: "Yükleme kullanıcı tarafından iptal edildi.",
    });
  };

  xhr.open("POST", "/api/v1/media/upload", true);
  if (accessToken) {
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
  }

  // Update phase to uploading
  onUpdate({
    ...item,
    xhr,
    phase: "uploading",
    progress: 0,
    statusMessage: "Yükleme başlatılıyor...",
  });

  xhr.send(formData);

  // Return cancel function
  return () => {
    try {
      xhr.abort();
    } catch (e) {}
  };
}
