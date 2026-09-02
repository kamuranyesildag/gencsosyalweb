import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  Check, 
  CheckCheck, 
  MessageSquare,
  Loader2
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { Avatar } from "../components/ui/Avatar";
import { IconButton } from "../components/ui/IconButton";
import { EmptyState } from "../components/ui/EmptyState";
import { usePagination } from "../hooks/usePagination";

export function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { 
    data: messagesData, 
    setData, 
    loading, 
    loadingMore, 
    hasMore, 
    loadInitial, 
    loadMore, 
    addItem 
  } = usePagination(`/messages/conversations/${id}/messages`);
  
  const messages = [...messagesData].reverse();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isScrolledToBottomRef = useRef(true);

  useEffect(() => {
    loadInitial();
  }, [id, loadInitial]);

  // Mark as read when messages load or change
  useEffect(() => {
    if (messages.length > 0) {
      const hasUnreadFromOther = messages.some((m) => !m.isRead && m.sender?.id !== user?.id);
      if (hasUnreadFromOther) {
        fetchApi(`/messages/conversations/${id}/read`, { method: "PATCH" })
          .then(() => {
            setData((prev: any) =>
              prev.map((m: any) =>
                !m.isRead && m.sender?.id !== user?.id ? { ...m, isRead: true } : m
              )
            );
          })
          .catch((e) => console.error("Failed to mark as read", e));
      }
    }
  }, [messages, id, user?.id, setData]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    if (scrollTop < 50 && hasMore && !loadingMore && !loading) {
      previousScrollHeightRef.current = scrollHeight - scrollTop;
      loadMore();
    }
    
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    if (previousScrollHeightRef.current === 0) {
      isScrolledToBottomRef.current = isAtBottom;
    }
  };

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;

    if (previousScrollHeightRef.current > 0) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = 0;
    } else if (isScrolledToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading]);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    const textToSend = content.trim();
    setIsSending(true);

    try {
      const res = await fetchApi(`/messages/conversations/${id}/messages`, {
        method: "POST",
        data: { content: textToSend },
      });
      const json = await res.json();
      if (json.success) {
        addItem(json.data);
        setContent("");
        isScrolledToBottomRef.current = true;
      }
    } catch (e) {
      console.error("Mesaj gönderilemedi:", e);
    } finally {
      setIsSending(false);
    }
  };

  const otherUser = messages.find((m) => m.sender?.id !== user?.id)?.sender;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen w-full max-w-2xl mx-auto border-x border-slate-100 bg-slate-50/50 select-none">
      {/* STICKY CHAT HEADER */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <IconButton
            aria-label="Geri Dön"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full -ml-1 text-slate-700 hover:text-slate-900 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>

          {otherUser ? (
            <Link
              to={`/profile/${otherUser.username}`}
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <Avatar
                url={otherUser.avatarUrl}
                name={otherUser.displayName || otherUser.username}
                size="sm"
                className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors text-sm sm:text-base truncate">
                    {otherUser.displayName || otherUser.username}
                  </span>
                  {otherUser.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 fill-slate-100 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium truncate">
                  @{otherUser.username}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar size="sm" />
              <h1 className="text-base font-bold text-slate-900">Sohbet</h1>
            </div>
          )}
        </div>
      </header>

      {/* CHAT MESSAGES SCROLL AREA */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3"
      >
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-7 h-7 animate-spin text-slate-900" />
          </div>
        ) : messages.length > 0 ? (
          <>
            {loadingMore && (
              <div className="flex justify-center p-2">
                <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              </div>
            )}

            {messages.map((msg, i) => {
              const isMe = msg.sender?.id === user?.id;

              return (
                <div
                  key={msg.id || i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm sm:text-[15px] shadow-xs leading-relaxed ${
                      isMe
                        ? "bg-slate-900 text-white rounded-br-xs"
                        : "bg-white border border-slate-200/80 text-slate-900 rounded-bl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                    <div
                      className={`flex items-center justify-end gap-1 text-[11px] font-medium mt-1 select-none ${
                        isMe ? "text-slate-200" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-200" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="m-auto text-center px-4 py-8">
            <EmptyState
              icon={<MessageSquare className="w-7 h-7 text-slate-400" />}
              title="Henüz Mesaj Yok"
              description="Sohbeti başlatmak için aşağıdan ilk mesajınızı gönderin."
            />
          </div>
        )}
      </div>

      {/* STICKY INPUT BAR */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 items-center bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white rounded-2xl p-1.5 pl-4 border border-slate-200 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-transparent py-2 outline-none text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 font-medium"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            disabled={!content.trim() || isSending}
            onClick={handleSend}
            aria-label="Mesaj Gönder"
            className="w-9 h-9 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition-colors shadow-xs shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 -mr-0.5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
