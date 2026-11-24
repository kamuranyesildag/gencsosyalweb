export interface MessageUserBrief {
  id: number;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface ConversationMember extends MessageUserBrief {
  role: "ADMIN" | "MEMBER" | string;
  joinedAt?: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  content?: string | null;
  mediaUrl?: string | null;
  messageType?: "TEXT" | "SYSTEM" | string;
  isRead: boolean;
  createdAt: string;
  sender: MessageUserBrief;
}

export interface ConversationSummary {
  id: number;
  isGroup: boolean;
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  myRole: "ADMIN" | "MEMBER" | string;
  memberCount: number;
  onlineCount: number;
  membersPreview: ConversationMember[];
  otherUser?: MessageUserBrief | null;
  unreadCount: number;
  lastMessage?: {
    id: number;
    conversationId: number;
    senderId: number;
    content?: string | null;
    mediaUrl?: string | null;
    messageType?: "TEXT" | "SYSTEM" | string;
    isRead: boolean;
    createdAt: string;
    sender?: {
      id: number;
      username: string;
      displayName?: string | null;
    };
  } | null;
}

export interface ConversationDetail {
  id: number;
  isGroup: boolean;
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  myRole: "ADMIN" | "MEMBER" | string;
  memberCount: number;
  onlineCount: number;
  members: ConversationMember[];
  otherUser?: MessageUserBrief | null;
}

export interface TypingUserEvent {
  conversationId: number;
  userId: number;
  username: string;
  displayName: string;
}
