import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

export function useLiveSearch(query: string, type: 'users' | 'tags' = 'users') {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(query.trim())}&type=${type}&limit=5`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (error) {
        console.error('Live search error:', error);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, type]);

  return { results, loading };
}
