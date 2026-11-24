import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Loader2,
  MessageSquarePlus,
  Users,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { Avatar } from "./ui/Avatar";
import { VerifiedBadge } from "./VerifiedBadge";
import { Skeleton, SkeletonCircle } from "./ui/Skeleton";
import { toast } from "./ui/Toast";

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToGroup?: () => void;
  onConversationStarted?: (conversationId: number) => void;
}

export function NewMessageDialog({
  isOpen,
  onClose,
  onSwitchToGroup,
  onConversationStarted,
}: NewMessageDialogProps) {
  const { user: currentUser } = useAuthStore();
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUserId, setStartingUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setStartingUserId(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchApi("/users/suggestions?limit=10")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.suggestions)
          ? json.data.suggestions
          : [];
        setSuggested(list.filter((u: any) => u && u.id !== currentUser?.id));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUser?.id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchApi(
          `/search?q=${encodeURIComponent(query.trim())}&type=users`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data.filter((u: any) => u && u.id !== currentUser?.id));
        }
      } catch {
        // Ignore transient search error
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, currentUser?.id]);

  const startConversation = async (userId: number) => {
    setStartingUserId(userId);
    try {
      const res = await fetchApi("/messages/conversations", {
        method: "POST",
        data: { targetUserId: userId },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.id) {
        onClose();
        if (onConversationStarted) {
          onConversationStarted(json.data.id);
        } else {
          navigate(`/messages/${json.data.id}`);
        }
      } else {
        toast.error(json?.error?.message || "Sohbet başlatılamadı.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setStartingUserId(null);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const listToDisplay = query.trim().length >= 2 ? results : suggested;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Yeni Sohbet Başlat"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: 32, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 32, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 28, stiffness: 340 }}
          className="relative w-full sm:max-w-md bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[560px] max-h-[90dvh]"
        >
          {/* Mobile Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden shrink-0">
            <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Yeni Sohbet
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.015] space-y-3 shrink-0">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Kullanıcı adı veya isim ara..."
                className="w-full bg-white dark:bg-[#080E1A] rounded-xl pl-10 pr-9 py-2.5 outline-none border border-slate-200 dark:border-white/[0.1] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Aramayı temizle"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onSwitchToGroup && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToGroup();
                }}
                className="w-full flex items-center gap-3 p-3 min-h-[52px] rounded-2xl bg-blue-50/80 hover:bg-blue-100/70 dark:bg-blue-950/35 dark:hover:bg-blue-950/55 border border-blue-200/80 dark:border-blue-500/25 transition-colors text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Yeni Grup Oluştur
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Birden fazla kişiyle ortak sohbet başlat
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {query.trim().length >= 2 ? "Arama Sonuçları" : "Önerilen Kişiler"}
            </div>

            {loading ? (
              <div className="space-y-2 p-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                    <SkeletonCircle size="md" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listToDisplay.length > 0 ? (
              <div className="space-y-1 mt-1">
                {listToDisplay.map((user) => {
                  const isStarting = startingUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => startConversation(user.id)}
                      disabled={startingUserId !== null}
                      className="w-full flex items-center gap-3.5 p-3 min-h-[56px] rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100 dark:active:bg-white/[0.06] transition-all text-left group cursor-pointer"
                    >
                      <Avatar
                        url={user.avatarUrl}
                        name={user.displayName || user.username}
                        size="md"
                        className="ring-1 ring-slate-200 dark:ring-white/[0.1] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {user.displayName || user.username}
                          </span>
                          {user.isVerified && (
                            <VerifiedBadge iconClassName="w-3.5 h-3.5" withModal={false} />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          @{user.username}
                        </p>
                      </div>

                      {isStarting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] group-hover:bg-blue-600 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shrink-0">
                          <MessageSquarePlus className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {query.trim().length >= 2 ? "Kullanıcı Bulunamadı" : "Kişi Arayın"}
                </div>
                <div className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-xs">
                  {query.trim().length >= 2
                    ? "Farklı bir arama terimi deneyin."
                    : "Mesaj göndermek istediğiniz kişinin adını veya kullanıcı adını yazın."}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
