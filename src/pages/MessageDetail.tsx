import React from "react";
import { useParams } from "react-router";
import { useSEO } from "../hooks/useSEO";
import { MessagingWorkspace } from "../components/messages/MessagingWorkspace";

export function MessageDetail() {
  useSEO({
    allowIndexing: false,
    title: "Mesajlaşma | Genç Sosyal",
    canonicalPath: "/messages",
  });

  const { id } = useParams();
  const parsedId = id ? parseInt(id, 10) : NaN;
  const activeConversationId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  return <MessagingWorkspace activeConversationId={activeConversationId} />;
}
