import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchApi } from "../lib/api";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { formatTimeAgo } from "../lib/utils";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { toast } from "../components/ui/Toast";
import { useAuthStore } from "../context/useAuth";

export function SupportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetchApi(`/support/${id}`);
        const json = await res.json();
        if (json.success) {
          setTicket(json.data);
        } else {
          toast.error("Talep yüklenemedi.");
          navigate("/settings");
        }
      } catch (e) {
        toast.error("Bağlantı hatası.");
        navigate("/settings");
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetchApi(`/support/${id}/messages`, {
        method: "POST",
        data: { message: message.trim() }
      });
      const json = await res.json();
      if (json.success) {
        setTicket((prev: any) => ({
          ...prev,
          messages: [...prev.messages, { ...json.data, user: { ...user, displayName: user?.displayName, avatarUrl: user?.avatarUrl } }]
        }));
        setMessage("");
      } else {
        toast.error(json.error?.message || "Mesaj gönderilemedi.");
      }
    } catch (e) {
      toast.error("Bağlantı hatası.");
    } finally {
      setSending(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'IN_PROGRESS': return 'İnceleniyor';
      case 'RESOLVED': return 'Çözüldü';
      case 'CLOSED': return 'Kapatıldı';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen bg-transparent p-4">
        <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-24 rounded-xl mb-4" />
        <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-64 rounded-xl" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto min-h-screen border-x border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070A10]">
      {/* Header */}
      <header className="sticky top-16 z-20 bg-white/80 dark:bg-[#070A10]/80  border-b border-slate-200/80 dark:border-white/[0.08] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Talep #{ticket.id}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
              {getStatusLabel(ticket.status)}
            </span>
            <span className="text-xs text-slate-500">{formatTimeAgo(ticket.createdAt)}</span>
          </div>
        </div>
      </header>

      {/* Ticket Original Request */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-slate-900/30">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ticket.subject}</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 pb-24">
        {ticket.messages.map((msg: any) => {
          const isMe = msg.user.id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar url={msg.user.avatarUrl} name={msg.user.displayName || msg.user.username} size="sm" />
              <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {msg.isAdmin ? "Genç Sosyal Destek" : msg.user.displayName || msg.user.username}
                  </span>
                  {msg.isAdmin && <CheckCircle className="w-3 h-3 text-blue-500" />}
                  <span className="text-xs text-slate-400">{formatTimeAgo(msg.createdAt)}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  isMe 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      {ticket.status !== 'CLOSED' && (
        <div className="sticky bottom-0 bg-white/80 dark:bg-[#070A10]/80  border-t border-slate-200/80 dark:border-white/[0.08] p-4 pb-safe">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Bir mesaj yazın..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-transparent rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!message.trim() || sending}
              isLoading={sending}
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
