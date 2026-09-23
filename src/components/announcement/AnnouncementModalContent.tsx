import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AnnouncementItem {
  id?: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
}

interface AnnouncementModalContentProps {
  announcement: AnnouncementItem;
  onClose: () => void;
  onCtaClick?: () => void;
  isPreview?: boolean;
}

export function AnnouncementModalContent({
  announcement,
  onClose,
  onCtaClick,
  isPreview = false,
}: AnnouncementModalContentProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    }

    if (!announcement.buttonUrl) {
      onClose();
      return;
    }

    const url = announcement.buttonUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Internal route SPA navigation
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      navigate(cleanUrl);
    }

    onClose();
  };

  const hasImage = Boolean(announcement.imageUrl && !imageError);
  const isExternalUrl =
    Boolean(announcement.buttonUrl && (announcement.buttonUrl.startsWith('http://') || announcement.buttonUrl.startsWith('https://')));

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-[#070A10] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col mx-auto select-none">
      {/* Top Banner / Image Area */}
      {hasImage ? (
        <div className="relative w-full aspect-video sm:h-52 bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
          <img
            src={announcement.imageUrl!}
            alt={announcement.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/20 pointer-events-none" />

          {/* Close button with blur over image */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-950/50 hover:bg-slate-950/80 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ) : (
        /* Header when no image */
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Genç Sosyal Duyurusu</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 flex flex-col space-y-3.5 text-left">
        {/* Preview watermark if in admin preview */}
        {isPreview && (
          <div className="inline-block self-start px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Önizleme Modu
          </div>
        )}

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
          {announcement.title}
        </h3>

        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-line max-h-52 overflow-y-auto pr-1 select-text scrollbar-thin">
          {announcement.content}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          {announcement.buttonText ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleCtaClick}
              className="w-full justify-center font-semibold shadow-md active:scale-[0.98] transition-transform"
              rightIcon={
                isExternalUrl ? (
                  <ExternalLink className="w-4 h-4 shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 shrink-0" />
                )
              }
            >
              {announcement.buttonText}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              className="w-full justify-center font-semibold"
            >
              Anladım
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
