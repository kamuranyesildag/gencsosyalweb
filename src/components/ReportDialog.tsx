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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Şikayet Et
              </h3>
              <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Rapor Alındı</h4>
                  <p className="text-gray-500">Bildiriminiz incelenmek üzere ekibimize iletilmiştir. Teşekkür ederiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Şikayet Nedeni</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCategory(c); setError(""); }}
                          className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left ${category === c ? "bg-red-50 border-red-200 text-red-700" : "bg-white dark:bg-slate-950 border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                    <textarea
                      placeholder="Lütfen durumu detaylıca açıklayın..."
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setError(""); }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm min-h-[100px] resize-none"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !category || description.trim().length < 10}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Raporu Gönder"}
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
