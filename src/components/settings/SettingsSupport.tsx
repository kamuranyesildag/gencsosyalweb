import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { toast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { HelpCircle, MessageSquare, List } from "lucide-react";
import { formatTimeAgo } from "../../lib/utils";

export function SettingsSupport() {
  const [activeTab, setActiveTab] = useState<"support" | "feedback" | "history">("support");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Destek & Geri Bildirim</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bir sorun mu yaşadın veya bir fikrin mi var? Bize ulaş.
          </p>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "support"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Destek Talebi</span>
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "feedback"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Geri Bildirim</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <List className="w-4 h-4" />
            <span>Taleplerim</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "support" && <SupportForm onSuccess={() => setActiveTab("history")} />}
          {activeTab === "feedback" && <FeedbackForm onSuccess={() => setActiveTab("history")} />}
          {activeTab === "history" && <SupportHistory />}
        </div>
      </div>
    </div>
  );
}

function SupportForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "technical",
    subject: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject.trim().length < 5) return toast.error("Konu en az 5 karakter olmalıdır.");
    if (formData.description.trim().length < 10) return toast.error("Açıklama en az 10 karakter olmalıdır.");
    
    setLoading(true);
    try {
      const res = await fetchApi("/support", {
        method: "POST",
        data: formData
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Destek talebiniz başarıyla oluşturuldu.");
        onSuccess();
      } else {
        toast.error(json.error?.message || "Talep oluşturulamadı.");
      }
    } catch (e) {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Kategori
        </label>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
        >
          <option value="technical">Teknik Sorun</option>
          <option value="account">Hesap / Giriş Problemi</option>
          <option value="post">Gönderi / İçerik Problemi</option>
          <option value="message">Mesajlaşma Problemi</option>
          <option value="security">Güvenlik Problemi</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Konu
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Sorununuzu kısaca özetleyin..."
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Sorunu ayrıntılı olarak açıklayın..."
          rows={5}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none dark:text-white"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={!formData.subject.trim() || !formData.description.trim()}
          className="w-full font-bold h-11 rounded-xl"
        >
          Destek Talebi Gönder
        </Button>
      </div>
    </form>
  );
}

function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "feature",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim().length < 5) return toast.error("Başlık en az 5 karakter olmalıdır.");
    if (formData.description.trim().length < 10) return toast.error("Açıklama en az 10 karakter olmalıdır.");
    
    setLoading(true);
    try {
      const res = await fetchApi("/feedbacks", {
        method: "POST",
        data: formData
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Geri bildiriminiz başarıyla gönderildi.");
        onSuccess();
      } else {
        toast.error(json.error?.message || "Gönderilemedi.");
      }
    } catch (e) {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Geri Bildirim Türü
        </label>
        <select
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
        >
          <option value="feature">Özellik Önerisi</option>
          <option value="ui_ux">Tasarım / Kullanım Kolaylığı</option>
          <option value="bug">Hata Bildirimi (Bug)</option>
          <option value="performance">Performans / Hız</option>
          <option value="general">Genel Geri Bildirim</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Başlık
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Fikrinizi kısaca özetleyin..."
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Fikrinizi veya önerinizi detaylıca anlatın..."
          rows={5}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none dark:text-white"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={!formData.title.trim() || !formData.description.trim()}
          className="w-full font-bold h-11 rounded-xl"
        >
          Geri Bildirim Gönder
        </Button>
      </div>
    </form>
  );
}

function SupportHistory() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketsRes, feedbacksRes] = await Promise.all([
          fetchApi("/support"),
          fetchApi("/feedbacks")
        ]);
        const [ticketsJson, feedbacksJson] = await Promise.all([
          ticketsRes.json(),
          feedbacksRes.json()
        ]);
        
        if (ticketsJson.success) setTickets(ticketsJson.data);
        if (feedbacksJson.success) setFeedbacks(feedbacksJson.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'NEW':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'IN_PROGRESS':
      case 'REVIEWED':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'CLOSED':
      case 'REJECTED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'NEW': return 'Yeni';
      case 'IN_PROGRESS': return 'İnceleniyor';
      case 'REVIEWED': return 'İncelendi';
      case 'RESOLVED': return 'Çözüldü';
      case 'CLOSED': return 'Kapatıldı';
      case 'REJECTED': return 'Reddedildi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const allItems = [
    ...tickets.map(t => ({ ...t, _type: 'ticket' })),
    ...feedbacks.map(f => ({ ...f, _type: 'feedback' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allItems.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <List className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Henüz Talebiniz Yok</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
          Oluşturduğunuz destek talepleri ve geri bildirimler burada listelenir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allItems.map((item) => (
        <div 
          key={`${item._type}-${item.id}`}
          className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
          onClick={() => {
            if (item._type === 'ticket') {
              window.location.href = `/support/${item.id}`;
            }
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {item._type === 'ticket' ? `Talep #${item.id}` : `Geri Bildirim #${item.id}`}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {item.subject || item.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {item.description}
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {formatTimeAgo(item.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
