import { fetchApi, type ApiResponse } from "./api";

export async function teamsFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetchApi(endpoint, options);
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    error: { message: "Sunucudan geçersiz yanıt alındı." },
  }));
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "İşlem gerçekleştirilemedi.");
  }
  return json;
}

export interface TeamOwner {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface TeamItem {
  id: number;
  name: string;
  slug: string;
  tag: string | null;
  description: string;
  category: string;
  visibility: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  joinPolicy: "OPEN" | "APPROVAL" | "INVITE_ONLY";
  maxMembers: number;
  memberCount: number;
  avatarUrl: string | null;
  bannerColor: string;
  rules: string | null;
  skillsNeeded: string[];
  allowMemberInvites: boolean;
  requireVerifiedEmailToJoin: boolean;
  isRecruiting: boolean;
  isLocked: boolean;
  inviteCodeEnabled: boolean;
  inviteCode?: string | null;
  inviteCodeExpiresAt?: string | null;
  ownerId: number;
  owner?: TeamOwner | null;
  myRole: "CAPTAIN" | "CO_CAPTAIN" | "MEMBER" | null;
  isMember: boolean;
  hasPendingRequest: boolean;
  isBanned?: boolean;
  restricted?: boolean;
  pendingRequestsCount?: number;
  members?: TeamMemberItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberItem {
  userId: number;
  role: "CAPTAIN" | "CO_CAPTAIN" | "MEMBER";
  position: string | null;
  joinedAt: string;
  username: string;
  isVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface TeamJoinRequestItem {
  id: number;
  userId: number;
  note: string | null;
  status: string;
  createdAt: string;
  username: string;
  emailVerified: boolean;
  isVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface TeamInvitationItem {
  id: number;
  status?: string;
  message: string | null;
  expiresAt: string;
  createdAt: string;
  teamId?: number;
  teamName?: string;
  teamSlug?: string;
  teamTag?: string | null;
  teamCategory?: string;
  teamBannerColor?: string;
  teamMemberCount?: number;
  teamMaxMembers?: number;
  inviterUsername?: string;
  inviterDisplayName?: string | null;
  inviterAvatarUrl?: string | null;
  inviteeId?: number;
  username?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface TeamBanItem {
  id: number;
  userId: number;
  reason: string | null;
  createdAt: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface TeamAuditLogItem {
  id: number;
  action: string;
  details: string | null;
  createdAt: string;
  actor: { username: string; displayName: string | null } | null;
  target: { username: string; displayName: string | null } | null;
}

export const TEAM_CATEGORY_OPTIONS = [
  { value: "YAZILIM", label: "Yazılım & Mühendislik" },
  { value: "TEKNOFEST", label: "TEKNOFEST Yarışması" },
  { value: "ROBOTIK", label: "Robotik & İHA" },
  { value: "YAPAY_ZEKA", label: "Yapay Zeka & Veri" },
  { value: "TASARIM", label: "Tasarım & Medya" },
  { value: "OYUN", label: "Oyun Geliştirme" },
  { value: "GENC_QUIZ", label: "Genç Quiz Ekibi" },
  { value: "GIRISIMCILIK", label: "Girişimcilik" },
  { value: "GENEL", label: "Genel Proje" },
] as const;

export const TEAM_BANNER_COLORS = [
  { hex: "#2563EB", label: "Genç Mavi" },
  { hex: "#0F2557", label: "Lacivert" },
  { hex: "#4F46E5", label: "İndigo" },
  { hex: "#0EA5E9", label: "Gökyüzü" },
  { hex: "#059669", label: "Zümrüt" },
  { hex: "#D97706", label: "Kehribar" },
  { hex: "#DC2626", label: "Kızıl" },
  { hex: "#7C3AED", label: "Mor" },
  { hex: "#0F172A", label: "Gece" },
] as const;

export const getCategoryLabel = (val: string): string =>
  TEAM_CATEGORY_OPTIONS.find((c) => c.value === val)?.label || "Genel Proje";

export const getVisibilityLabel = (val: string): string => {
  switch (val) {
    case "PUBLIC":
      return "Herkese Açık";
    case "PRIVATE":
      return "Gizli (Başvuru ile)";
    case "INVITE_ONLY":
      return "Sadece Davetle";
    default:
      return val;
  }
};

export const getJoinPolicyLabel = (val: string): string => {
  switch (val) {
    case "OPEN":
      return "Doğrudan Katılım";
    case "APPROVAL":
      return "Kaptan Onayı Gerekli";
    case "INVITE_ONLY":
      return "Yalnızca Davet / Kod";
    default:
      return val;
  }
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case "CAPTAIN":
      return "Takım Kaptanı";
    case "CO_CAPTAIN":
      return "Yardımcı Kaptan";
    default:
      return "Üye";
  }
};

export const getAuditActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    TEAM_CREATED: "Takım oluşturuldu",
    SETTINGS_UPDATED: "Takım ayarları güncellendi",
    INVITE_CODE_ROTATED: "Davet kodu yenilendi",
    INVITE_CODE_TOGGLED: "Davet kodu durumu değişti",
    MEMBER_JOINED: "Yeni üye katıldı",
    MEMBER_LEFT: "Üye takımdan ayrıldı",
    MEMBER_ROLE_CHANGED: "Üye yetkisi değiştirildi",
    MEMBER_KICKED: "Üye takımdan çıkarıldı",
    MEMBER_BANNED: "Kullanıcı takımdan engellendi",
    MEMBER_UNBANNED: "Kullanıcı engeli kaldırıldı",
    REQUEST_APPROVED: "Başvuru onaylandı",
    REQUEST_REJECTED: "Başvuru reddedildi",
    INVITATION_SENT: "Takım daveti gönderildi",
    INVITATION_REVOKED: "Davet geri çekildi",
    CAPTAINCY_TRANSFERRED: "Kaptanlık devredildi",
    TEAM_LOCKED: "Takım güvenlik kilidine alındı",
    TEAM_UNLOCKED: "Takım güvenlik kilidi açıldı",
    TEAM_DELETED: "Takım kapatıldı",
  };
  return map[action] || action;
};
