import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  name?: string | null;
  size?: AvatarSize;
  status?: AvatarStatus;
  isBordered?: boolean;
  className?: string;
  key?: React.Key;
}

const sizeStyles: Record<AvatarSize, { container: string; icon: string; text: string; status: string }> = {
  xs: {
    container: 'w-6 h-6',
    icon: 'w-3 h-3',
    text: 'text-[10px]',
    status: 'w-1.5 h-1.5 ring-1',
  },
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-xs',
    status: 'w-2 h-2 ring-1.5',
  },
  md: {
    container: 'w-11 h-11',
    icon: 'w-5 h-5',
    text: 'text-sm',
    status: 'w-2.5 h-2.5 ring-2',
  },
  lg: {
    container: 'w-14 h-14',
    icon: 'w-6 h-6',
    text: 'text-base',
    status: 'w-3.5 h-3.5 ring-2',
  },
  xl: {
    container: 'w-20 h-20 sm:w-24 sm:h-24',
    icon: 'w-10 h-10',
    text: 'text-xl',
    status: 'w-4 h-4 ring-2',
  },
  '2xl': {
    container: 'w-28 h-28 sm:w-32 sm:h-32',
    icon: 'w-12 h-12',
    text: 'text-2xl',
    status: 'w-5 h-5 ring-3',
  },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500 ring-white',
  offline: 'bg-slate-400 ring-white',
  busy: 'bg-rose-500 ring-white',
  away: 'bg-amber-500 ring-white',
};

function getInitials(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  url,
  name,
  className,
  size = 'md',
  status,
  isBordered = true,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const currentSize = sizeStyles[size] || sizeStyles.md;
  const initials = getInitials(name);

  // Reset img error if url changes
  React.useEffect(() => {
    setImgError(false);
  }, [url]);

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-xs select-none',
          isBordered && 'border-2 border-white ring-1 ring-slate-100',
          currentSize.container,
          className
        )}
        {...props}
      >
        {url && !imgError ? (
          <img
            src={url}
            alt={name || 'Avatar'}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span className={cn('font-bold text-slate-600 tracking-wider', currentSize.text)}>
            {initials}
          </span>
        ) : (
          <User className={cn('text-slate-400', currentSize.icon)} aria-hidden="true" />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            currentSize.status,
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  children,
  limit = 4,
  className,
}: {
  children: React.ReactNode;
  limit?: number;
  className?: string;
}) {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, limit);
  const excess = avatars.length - limit;

  return (
    <div className={cn('flex items-center -space-x-2.5 overflow-hidden', className)}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {excess > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
          +{excess}
        </div>
      )}
    </div>
  );
}
