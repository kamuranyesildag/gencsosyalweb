import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore, sanitizeToken } from "../context/useAuth";
import type { ChatMessage, TypingUserEvent } from "../components/messages/types";

export interface MessagesSocketEventHandlers {
  onMessageCreated?: (payload: { conversationId: number; message: ChatMessage }) => void;
  onConversationCreated?: (payload: { conversationId: number; isGroup: boolean; name?: string }) => void;
  onConversationUpdated?: (payload: { conversationId: number }) => void;
  onConversationRemoved?: (payload: { conversationId: number }) => void;
  onConversationRead?: (payload: { conversationId: number; readerId: number; readAt: string }) => void;
  onTypingStart?: (payload: TypingUserEvent) => void;
  onTypingStop?: (payload: TypingUserEvent) => void;
}

export function useMessagesSocket(handlers: MessagesSocketEventHandlers = {}) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCountRef = useRef(0);
  const handlersRef = useRef<MessagesSocketEventHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnected(false);
      setOnlineUserIds(new Set());
      return;
    }

    let unmounted = false;

    const connect = () => {
      if (unmounted) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const token =
        sanitizeToken(useAuthStore.getState().accessToken) ||
        sanitizeToken(localStorage.getItem("gencsosyal_token"));
      const query = token ? `?token=${encodeURIComponent(token)}` : "";
      const wsUrl = `${protocol}//${window.location.host}/ws/messages${query}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) {
            ws.close();
            return;
          }
          retryCountRef.current = 0;
          setConnected(true);

          if (pingTimerRef.current) clearInterval(pingTimerRef.current);
          pingTimerRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: "ping" }));
            }
          }, 25000);
        };

        ws.onmessage = (evt) => {
          try {
            const parsed = JSON.parse(evt.data);
            const { event, data } = parsed || {};

            switch (event) {
              case "presence:snapshot": {
                const ids: number[] = Array.isArray(data?.onlineUserIds) ? data.onlineUserIds : [];
                setOnlineUserIds(new Set(ids));
                break;
              }
              case "presence:online": {
                const uid = Number(data?.userId);
                if (uid > 0) {
                  setOnlineUserIds((prev) => {
                    const next = new Set(prev);
                    next.add(uid);
                    return next;
                  });
                }
                break;
              }
              case "presence:offline": {
                const uid = Number(data?.userId);
                if (uid > 0) {
                  setOnlineUserIds((prev) => {
                    if (!prev.has(uid)) return prev;
                    const next = new Set(prev);
                    next.delete(uid);
                    return next;
                  });
                }
                break;
              }
              case "message:created":
                handlersRef.current.onMessageCreated?.(data);
                break;
              case "conversation:created":
                handlersRef.current.onConversationCreated?.(data);
                break;
              case "conversation:updated":
                handlersRef.current.onConversationUpdated?.(data);
                break;
              case "conversation:removed":
                handlersRef.current.onConversationRemoved?.(data);
                break;
              case "conversation:read":
                handlersRef.current.onConversationRead?.(data);
                break;
              case "typing:start":
                handlersRef.current.onTypingStart?.(data);
                break;
              case "typing:stop":
                handlersRef.current.onTypingStop?.(data);
                break;
              default:
                break;
            }
          } catch {
            // Ignore malformed socket frames
          }
        };

        ws.onclose = (ev) => {
          setConnected(false);
          if (pingTimerRef.current) {
            clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
          }
          if (unmounted || ev.code === 4401 || ev.code === 4403) return;

          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
          retryCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(connect, delay);
        };

        ws.onerror = () => {
          // Close handler manages reconnect backoff
        };
      } catch {
        // Ignore transient WebSocket construction issues
      }
    };

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // ignore
        }
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken]);

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: isTyping ? "typing:start" : "typing:stop",
          payload: { conversationId },
        })
      );
    }
  }, []);

  return {
    connected,
    onlineUserIds,
    sendTyping,
  };
}
