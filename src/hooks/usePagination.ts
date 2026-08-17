import { useState, useCallback, useRef } from "react";
import { fetchApi } from "../lib/api";

export function usePagination(endpoint: string, limit: number = 20) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const cursorRef = useRef<string | null>(null);

  const fetchPage = useCallback(async (pageNum: number, isInitial = false) => {
    if (!isInitial) setLoadingMore(true);
    setError(null);
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("page", pageNum.toString());
      url.searchParams.set("limit", limit.toString());
      
      if (!isInitial && cursorRef.current) {
        url.searchParams.set("cursor", cursorRef.current);
      }

      const res = await fetchApi(url.pathname + url.search);
      const json = await res.json();
      
      if (json.success) {
        if (json.meta) {
          setMeta(json.meta);
          if (json.meta.nextCursor) {
            cursorRef.current = json.meta.nextCursor;
          } else {
            // No next cursor means end of list if we rely on cursors
            if (!isInitial && cursorRef.current) cursorRef.current = null;
          }
        }
        
        if (json.data.length < limit) {
          setHasMore(false);
        }
        
        setData(prev => {
          if (isInitial) return json.data;
          
          // Prevent duplicates by checking ID
          const existingIds = new Set(prev.map((item: any) => item.id));
          const newItems = json.data.filter((item: any) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        
        setPage(pageNum);
      } else {
        setError(json.error?.message || "Bir hata oluştu");
      }
    } catch (e: any) {
      setError(e.message || "Bağlantı hatası");
    } finally {
      if (isInitial) setLoading(false);
      setLoadingMore(false);
    }
  }, [endpoint, limit]);

  const loadInitial = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setLoading(true);
    cursorRef.current = null;
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchPage(page + 1);
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  const addItem = useCallback((item: any) => {
    setData(prev => [item, ...prev]);
  }, []);

  const addItemAtEnd = useCallback((item: any) => {
    setData(prev => [...prev, item]);
  }, []);

  return {
    meta,
    data,
    setData,
    loading,
    loadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    addItem,
    addItemAtEnd
  };
}
