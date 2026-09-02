import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Loader2, CheckCircle2, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Skeleton, SkeletonCircle } from "./ui/Skeleton";
import { toast } from "./ui/Toast";

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMessageDialog({ isOpen, onClose }: NewMessageDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUserId, setStartingUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setStartingUserId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(query.trim())}&type=users`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const startConversation = async (userId: number) => {
    setStartingUserId(userId);
    try {
      const res = await fetchApi("/messages/conversations", {
        method: "POST",
        data: { targetUserId: userId },
      });
      const json = await res.json();
      if (json.success) {
        onClose();
        navigate(`/messages/${json.data.id}`);
      } else {
        toast.error("Sohbet başlatılamadı.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setStartingUserId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Yeni Mesaj Başlat"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal / BottomSheet Content */}
        <motion.div
          initial={{ y: "100%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-md bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[520px] max-h-[90vh]"
        >
          {/* Mobile Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Yeni Mesaj
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative group">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Kullanıcı adı veya isim ara..."
                className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-2 p-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <SkeletonCircle size="md" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((user) => {
                  const isStarting = startingUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => startConversation(user.id)}
                      disabled={startingUserId !== null}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100/50 transition-all text-left group border border-transparent hover:border-slate-200/70"
                    >
                      <Avatar
                        url={user.avatarUrl}
                        name={user.displayName || user.username}
                        size="md"
                        className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-slate-900 transition-colors truncate">
                            {user.displayName || user.username}
                          </span>
                          {user.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 fill-slate-100 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          @{user.username}
                        </p>
                      </div>

                      {isStarting ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-slate-900 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-100 group-hover:text-slate-900 text-slate-400 flex items-center justify-center transition-colors shrink-0">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="w-8 h-8 text-slate-300 mb-2" />
                <div className="font-bold text-slate-700 text-sm">Kullanıcı Bulunamadı</div>
                <div className="text-slate-400 text-xs mt-1">Farklı bir arama terimi deneyin.</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <div className="font-semibold text-slate-600 text-sm">Sohbet Başlat</div>
                <div className="text-slate-400 text-xs mt-1 max-w-xs">
                  Mesaj göndermek istediğiniz kişinin adını veya kullanıcı adını yazın.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
