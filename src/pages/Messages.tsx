import React from "react";
import { useSEO } from "../hooks/useSEO";
import { MessagingWorkspace } from "../components/messages/MessagingWorkspace";

export function Messages() {
  useSEO({ allowIndexing: false, title: "Mesajlar | Genç Sosyal" });
  return <MessagingWorkspace activeConversationId={null} />;
}
