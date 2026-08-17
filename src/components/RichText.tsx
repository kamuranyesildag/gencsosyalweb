import React from 'react';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';

export function RichText({ text }: { text: string }) {
  if (!text) return null;

  // Regex matches URLs, hashtags and mentions.
  // URL: http:// or https://
  // Hashtag: # followed by unicode letters/numbers/marks/underscores
  // Mention: @ followed by 3-30 letters/numbers/underscores, not preceded or followed by word chars
  const regex = /(https?:\/\/[^\s]+|#[\p{L}\p{N}\p{M}_]+|(?<![a-zA-Z0-9_])@[a-zA-Z0-9_]{3,30}(?![a-zA-Z0-9_]))/gu;
  
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        
        if (part.startsWith('http://') || part.startsWith('https://')) {
          let displayUrl = part;
          try {
            const urlObj = new URL(part);
            displayUrl = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname.slice(0, 16) + (urlObj.pathname.length > 16 ? '...' : '') : '');
          } catch {
            displayUrl = part;
          }

          return (
            <a 
              key={i} 
              href={part}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-0.5 text-indigo-600 font-medium hover:underline underline-offset-2 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{displayUrl}</span>
              <ExternalLink className="w-3 h-3 self-center shrink-0 opacity-70" />
            </a>
          );
        }

        if (part.startsWith('#')) {
          const tagContent = part.slice(1);
          return (
            <Link 
              key={i} 
              to={`/hashtags/${encodeURIComponent(tagContent)}`}
              className="text-indigo-600 font-semibold hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Link 
              key={i} 
              to={`/profile/${encodeURIComponent(username)}`}
              className="text-indigo-600 font-semibold hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      })}
    </>
  );
}
