import React, { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { PostVideoPlayer } from "./PostVideoPlayer";
import { MediaLightboxModal, MediaItem } from "./MediaLightboxModal";

interface PostMediaGalleryProps {
  media: (string | any)[];
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  createdAt?: string;
  className?: string;
}

interface ImageTileProps {
  src: string;
  alt: string;
  className?: string;
  onClick: (e: React.MouseEvent) => void;
  overlayBadge?: string;
  ariaLabel?: string;
  aspectClass?: string;
}

function ImageTile({
  src,
  alt,
  className,
  onClick,
  overlayBadge,
  ariaLabel,
  aspectClass = "w-full h-full object-cover",
}: ImageTileProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || alt}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e as any);
        }
      }}
      className={cn(
        "relative overflow-hidden bg-slate-100 dark:bg-[#101C38] cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
    >
      {/* Loading Skeleton */}
      {!loaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-[#142244] animate-pulse flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400 dark:text-slate-600" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#101C38]">
          <ImageOff className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[11px] font-medium">Görsel yüklenemedi</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true);
            setHasError(true);
          }}
          className={cn(
            aspectClass,
            "transition-transform duration-300 group-hover:scale-[1.02]",
            !loaded && "opacity-0",
            loaded && "opacity-100"
          )}
        />
      )}

      {/* Dynamic +N Overlay Badge for 5+ images */}
      {overlayBadge && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 transition-colors group-hover:bg-black/55">
          <div className="px-4 py-2 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/25 text-white flex items-center gap-1.5 shadow-lg">
            <span className="text-base sm:text-lg font-bold tracking-tight leading-none">
              {overlayBadge}
            </span>
            <span className="text-xs font-semibold text-white/90">
              daha
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PostMediaGallery({
  media,
  user,
  createdAt,
  className,
}: PostMediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || !Array.isArray(media) || media.length === 0) {
    return null;
  }

  // Helper to extract url and determine type
  const parsedMedia = media.map((item) => {
    const url = typeof item === "string" ? item : item?.url || item?.mediaUrl || "";
    const type = typeof item === "string" ? "" : item?.type || item?.mediaType || "";
    const isVideo =
      type.includes("video") ||
      url.match(/\.(mp4|webm|ogg)$/i) ||
      url.includes("video");

    return {
      raw: item,
      url,
      type,
      isVideo,
    };
  });

  const openLightboxAt = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
  };

  // Check if all media are videos, all images, or mixed
  const videoCount = parsedMedia.filter((m) => m.isVideo).length;
  const imageCount = parsedMedia.length - videoCount;

  // Case A: Pure video (or single video)
  if (videoCount > 0 && imageCount === 0) {
    return (
      <div className={cn("mt-2.5 mb-1 flex flex-col gap-2", className)}>
        {parsedMedia.map((vid, idx) => (
          <PostVideoPlayer
            key={vid.url || idx}
            src={vid.url}
            onOpenLightbox={() => setLightboxIndex(idx)}
          />
        ))}

        <MediaLightboxModal
          isOpen={lightboxIndex !== null}
          initialIndex={lightboxIndex || 0}
          onClose={() => setLightboxIndex(null)}
          media={parsedMedia.map((m) => m.url)}
          user={user}
          createdAt={createdAt}
        />
      </div>
    );
  }

  // Case B: Pure images
  if (videoCount === 0) {
    const total = parsedMedia.length;

    return (
      <div className={cn("mt-2.5 mb-1 select-none", className)}>
        {/* 1 PHOTO: Natural aspect ratio, sensible max-height, object-contain if tall */}
        {total === 1 && (
          <div className="w-full rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs bg-slate-100 dark:bg-[#0B1329] max-h-[520px] flex items-center justify-center">
            <ImageTile
              src={parsedMedia[0].url}
              alt="Gönderi görseli"
              aspectClass="w-full h-auto max-h-[520px] object-contain"
              onClick={(e) => openLightboxAt(0, e)}
              className="w-full max-h-[520px]"
            />
          </div>
        )}

        {/* 2 PHOTOS: Clean dual column */}
        {total === 2 && (
          <div className="grid grid-cols-2 gap-1.5 h-[240px] sm:h-[320px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            <ImageTile
              src={parsedMedia[0].url}
              alt="Görsel 1"
              onClick={(e) => openLightboxAt(0, e)}
              className="h-full"
            />
            <ImageTile
              src={parsedMedia[1].url}
              alt="Görsel 2"
              onClick={(e) => openLightboxAt(1, e)}
              className="h-full"
            />
          </div>
        )}

        {/* 3 PHOTOS: Asymmetric balanced layout (1 large on left, 2 stacked on right) */}
        {total === 3 && (
          <div className="grid grid-cols-3 gap-1.5 h-[270px] sm:h-[350px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            <div className="col-span-2 h-full">
              <ImageTile
                src={parsedMedia[0].url}
                alt="Görsel 1"
                onClick={(e) => openLightboxAt(0, e)}
                className="w-full h-full"
              />
            </div>
            <div className="col-span-1 flex flex-col gap-1.5 h-full">
              <ImageTile
                src={parsedMedia[1].url}
                alt="Görsel 2"
                onClick={(e) => openLightboxAt(1, e)}
                className="w-full h-1/2"
              />
              <ImageTile
                src={parsedMedia[2].url}
                alt="Görsel 3"
                onClick={(e) => openLightboxAt(2, e)}
                className="w-full h-1/2"
              />
            </div>
          </div>
        )}

        {/* 4 PHOTOS: 2x2 Balanced Grid */}
        {total === 4 && (
          <div className="grid grid-cols-2 gap-1.5 h-[280px] sm:h-[360px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            {parsedMedia.map((m, idx) => (
              <ImageTile
                key={m.url || idx}
                src={m.url}
                alt={`Görsel ${idx + 1}`}
                onClick={(e) => openLightboxAt(idx, e)}
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* 5+ PHOTOS: First 4 displayed in 2x2 with dynamic +N overlay badge on the 4th */}
        {total >= 5 && (
          <div className="grid grid-cols-2 gap-1.5 h-[280px] sm:h-[360px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            {parsedMedia.slice(0, 3).map((m, idx) => (
              <ImageTile
                key={m.url || idx}
                src={m.url}
                alt={`Görsel ${idx + 1}`}
                onClick={(e) => openLightboxAt(idx, e)}
                className="h-full"
              />
            ))}
            {/* 4th tile with +N badge */}
            <ImageTile
              key={parsedMedia[3].url || 3}
              src={parsedMedia[3].url}
              alt="Görsel 4"
              overlayBadge={`+${total - 4}`}
              ariaLabel={`+${total - 4} fotoğraf daha görüntüle`}
              onClick={(e) => openLightboxAt(3, e)}
              className="h-full"
            />
          </div>
        )}

        {/* Fullscreen Lightbox Modal */}
        <MediaLightboxModal
          isOpen={lightboxIndex !== null}
          initialIndex={lightboxIndex || 0}
          onClose={() => setLightboxIndex(null)}
          media={parsedMedia.map((m) => m.url)}
          user={user}
          createdAt={createdAt}
        />
      </div>
    );
  }

  // Case C: Mixed media (Images & Videos in same post)
  return (
    <div className={cn("mt-2.5 mb-1 flex flex-col gap-2 select-none", className)}>
      {parsedMedia.map((item, idx) => {
        if (item.isVideo) {
          return (
            <PostVideoPlayer
              key={item.url || idx}
              src={item.url}
              onOpenLightbox={() => setLightboxIndex(idx)}
            />
          );
        }

        return (
          <div
            key={item.url || idx}
            className="w-full rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs max-h-[480px] bg-slate-100 dark:bg-[#0B1329] flex items-center justify-center"
          >
            <ImageTile
              src={item.url}
              alt={`Medya ${idx + 1}`}
              aspectClass="w-full h-auto max-h-[480px] object-contain"
              onClick={(e) => openLightboxAt(idx, e)}
              className="w-full"
            />
          </div>
        );
      })}

      <MediaLightboxModal
        isOpen={lightboxIndex !== null}
        initialIndex={lightboxIndex || 0}
        onClose={() => setLightboxIndex(null)}
        media={parsedMedia.map((m) => m.url)}
        user={user}
        createdAt={createdAt}
      />
    </div>
  );
}
