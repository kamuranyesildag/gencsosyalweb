import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { fetchApi } from "../lib/api";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "user" | "post" | "comment" | "community";
  targetId: number;
}

export function ReportDialog({ isOpen, onClose, targetType, targetId }: ReportDialogProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    "Spam",
    "Taciz",
    "Uygunsuz içerik",
    "Sahte hesap",
    "Dolandırıcılık",
    "Diğer"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError("Lütfen bir kategori seçin.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Lütfen en az 10 karakterlik bir açıklama girin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reason = `[${category}] ${description}`;
      const res = await fetchApi("/reports", {
        method: "POST",
        data: { targetType, targetId, reason }
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCategory("");
          setDescription("");
          onClose();
        }, 2000);
      } else {
        setError(data?.error?.message || "Rapor gönderilemedi.");
      }
    } catch (err: any) {
      setError("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
            className="relative w-full sm:max-w-md bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-white backdrop-blur-2xl rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/90 overflow-hidden flex flex-col z-10 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="pt-1 pb-3 flex justify-center items-center sm:hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-1 py-1 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Şikayet Et
              </h3>
              <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="pt-4">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Rapor Alındı</h4>
                  <p className="text-slate-300 text-sm">Bildiriminiz incelenmek üzere ekibimize iletilmiştir. Teşekkür ederiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Şikayet Nedeni</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCategory(c); setError(""); }}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${category === c ? "bg-rose-500/20 border-rose-500 text-rose-300" : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Açıklama</label>
                    <textarea
                      placeholder="Lütfen durumu detaylıca açıklayın..."
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setError(""); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-xs text-white placeholder:text-slate-500 min-h-[90px] resize-none"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-medium border border-rose-500/30">
                      {error}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !category || description.trim().length < 10}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Raporu Gönder"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;
}
