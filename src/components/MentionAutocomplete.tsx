import React, { useEffect, useState, useRef } from 'react';
import { fetchApi } from '../lib/api';
import { Avatar } from './ui/Avatar';

interface Props {
  text: string;
  onSelect: (newText: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}

export function MentionAutocomplete({ text, onSelect, inputRef }: Props) {
  const [query, setQuery] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  // Check if cursor is immediately after a @username or @
  useEffect(() => {
    const handleKeyUp = () => {
      if (!inputRef.current) return;
      const pos = inputRef.current.selectionStart || 0;
      setCursorPos(pos);
      
      const textBeforeCursor = text.slice(0, pos);
      // Match "@" followed by 0-30 word characters at the end of the string
      const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]{0,30})$/);
      if (match) {
        setQuery(match[1]);
      } else {
        setQuery(null);
      }
    };

    const el = inputRef.current;
    if (el) {
      el.addEventListener('keyup', handleKeyUp);
      el.addEventListener('click', handleKeyUp);
      return () => {
        el.removeEventListener('keyup', handleKeyUp);
        el.removeEventListener('click', handleKeyUp);
      };
    }
  }, [text, inputRef]);

  // Fetch users when query changes
  useEffect(() => {
    if (query === null) {
      setUsers([]);
      return;
    }
    
    // if query is empty (just typed @), we could fetch recent friends or top users, but let's just search
    if (query.length < 2) {
       // just an @ was typed, maybe wait for 1 char
       setUsers([]);
       return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(query)}&limit=5`);
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (query === null || users.length === 0) return null;

  const handleSelect = (username: string) => {
    if (!inputRef.current) return;
    const textBeforeCursor = text.slice(0, cursorPos);
    const match = textBeforeCursor.match(/(^|\s)@([a-zA-Z0-9_]{0,30})$/);
    if (!match) return;

    const startPos = textBeforeCursor.lastIndexOf('@');
    const newText = text.slice(0, startPos) + `@${username} ` + text.slice(cursorPos);
    onSelect(newText);
    setQuery(null);
    setUsers([]);
    
    // Restore focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = startPos + username.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="absolute z-50 bg-white border border-gray-100 shadow-xl rounded-xl w-64 max-h-64 overflow-y-auto mt-1 divide-y divide-gray-50">
      {users.map(user => (
        <button
          key={user.id}
          onClick={(e) => {
            e.preventDefault();
            handleSelect(user.username);
          }}
          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <Avatar url={user.avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">{user.displayName || user.username}</div>
            <div className="text-xs text-gray-500 truncate">@{user.username}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
