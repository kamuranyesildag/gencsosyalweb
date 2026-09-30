import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { 
  Users, 
  Settings, 
  ShieldCheck, 
  ShieldAlert, 
  UserMinus, 
  UserCheck, 
  AlertTriangle, 
  Trash2, 
  History, 
  Lock, 
  Globe, 
  FileText, 
  Check, 
  X, 
  Search, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Crown
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { toast } from "./ui/Toast";
import { confirmDialog } from "./ui/ConfirmDialog";
import { Button } from "./ui/Button";
import { Link, useNavigate } from "react-router";

interface CommunityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
  onCommunityUpdated: (updated: any) => void;
  onCommunityDeleted?: () => void;
  currentUserId: number;
}

type TabType = "overview" | "members" | "requests" | "moderation" | "settings" | "audit" | "danger";

const CATEGORIES = [
  "Genel",
  "Yazılım",
  "Tasarım",
  "Girişimcilik",
  "Yapay Zeka",
  "Oyun",
  "Sanat",
  "Bilim",
  "Kariyer"
];

export function CommunityManagementModal({
  isOpen,
  onClose,
  community,
  onCommunityUpdated,
  onCommunityDeleted,
  currentUserId,
}: CommunityManagementModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Stats
  const [stats, setStats] = useState<{
    totalMembers: number;
    pendingRequests: number;
    totalPosts: number;
    moderatorCount: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Members
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("");
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  // Join Requests
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionRequestId, setActionRequestId] = useState<number | null>(null);

  // Moderation Posts
  const [moderationPosts, setModerationPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [actionPostId, setActionPostId] = useState<number | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Settings Form State
  const [name, setName] = useState(community?.name || "");
  const [description, setDescription] = useState(community?.description || "");
  const [category, setCategory] = useState(community?.category || "Genel");
  const [isPrivate, setIsPrivate] = useState(Boolean(community?.isPrivate));
  const [rules, setRules] = useState(community?.rules || "");
  const [avatarUrl, setAvatarUrl] = useState(community?.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(community?.coverUrl || "");
  const [savingSettings, setSavingSettings] = useState(false);

  // Danger Zone - Transfer Ownership
  const [selectedNewOwner, setSelectedNewOwner] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === community?.ownerId;

  // Load Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/stats`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Members
  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const params = new URLSearchParams();
      if (memberSearch.trim()) params.append("search", memberSearch.trim());
      if (memberRoleFilter) params.append("role", memberRoleFilter);
      params.append("limit", "100");

      const res = await fetchApi(`/communities/${community.id}/members?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load Requests
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/requests`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load Moderation Posts
  const loadModerationPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/posts?limit=50`);
      const json = await res.json();
      if (json.success) {
        setModerationPosts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/audit-logs`);
      const json = await res.json();
      if (json.success) {
        setAuditLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !community) return;
    loadStats();
    if (activeTab === "members") loadMembers();
    else if (activeTab === "requests") loadRequests();
    else if (activeTab === "moderation") loadModerationPosts();
    else if (activeTab === "audit") loadAuditLogs();
  }, [isOpen, community?.id, activeTab]);

  useEffect(() => {
    if (community) {
      setName(community.name || "");
      setDescription(community.description || "");
      setCategory(community.category || "Genel");
      setIsPrivate(Boolean(community.isPrivate));
      setRules(community.rules || "");
      setAvatarUrl(community.avatarUrl || "");
      setCoverUrl(community.coverUrl || "");
    }
  }, [community]);

  if (!isOpen || !community) return null;

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Topluluk adı boş bırakılamaz.");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await fetchApi(`/communities/${community.id}`, {
        method: "PUT",
        data: {
          name: name.trim(),
          description: description.trim(),
          category,
          isPrivate,
          rules: rules.trim(),
          avatarUrl: avatarUrl.trim() || null,
          coverUrl: coverUrl.trim() || null,
        }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Topluluk ayarları kaydedildi.");
        onCommunityUpdated(json.data);
      } else {
        toast.error(json.error?.message || "Ayarlar kaydedilemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında hata oluştu.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Member Role Change (Owner only)
  const handleRoleChange = async (userId: number, currentRole: string, username: string) => {
    const newRole = currentRole === "MODERATOR" ? "MEMBER" : "MODERATOR";
    const actionLabel = newRole === "MODERATOR" ? "yönetici yapmak" : "yöneticilik yetkisini kaldırmak";

    if (!(await confirmDialog("Onay", `@${username} adlı üyeyi ${actionLabel} istediğinize emin misiniz?`))) {
      return;
    }

    setActionUserId(userId);
    try {
      const res = await fetchApi(`/communities/${community.id}/members/${userId}/role`, {
        method: "PUT",
        data: { role: newRole }
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "Rol güncellendi.");
        setMembers(prev => prev.map(m => m.user.id === userId ? { ...m, role: newRole } : m));
        loadStats();
      } else {
        toast.error(json.error?.message || "Rol güncellenemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionUserId(null);
    }
  };

  // Handle Member Removal
  const handleRemoveMember = async (userId: number, username: string) => {
    if (!(await confirmDialog("Onay", `@${username} adlı üyeyi topluluktan çıkarmak istediğinize emin misiniz?`))) {
      return;
    }

    setActionUserId(userId);
    try {
      const res = await fetchApi(`/communities/${community.id}/members/${userId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${username} topluluktan çıkarıldı.`);
        setMembers(prev => prev.filter(m => m.user.id !== userId));
        loadStats();
      } else {
        toast.error(json.error?.message || "Üye çıkarılamadı.");
      }
    } catch (e) {
      toast.error("İşlem sırasında hata oluştu.");
    } finally {
      setActionUserId(null);
    }
  };

  // Handle Request Accept
  const handleAcceptRequest = async (requestId: number, username: string) => {
    setActionRequestId(requestId);
    try {
      const res = await fetchApi(`/communities/${community.id}/requests/${requestId}/accept`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${username} topluluğa eklendi.`);
        setRequests(prev => prev.filter(r => r.id !== requestId));
        loadStats();
      } else {
        toast.error(json.error?.message || "İstek onaylanamadı.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionRequestId(null);
    }
  };

  // Handle Request Reject
  const handleRejectRequest = async (requestId: number) => {
    setActionRequestId(requestId);
    try {
      const res = await fetchApi(`/communities/${community.id}/requests/${requestId}/reject`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Katılım isteği reddedildi.");
        setRequests(prev => prev.filter(r => r.id !== requestId));
        loadStats();
      } else {
        toast.error(json.error?.message || "İstek reddedilemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionRequestId(null);
    }
  };

  // Handle Delete Moderation Post
  const handleRemovePost = async (postId: number) => {
    if (!(await confirmDialog("Onay", "Bu gönderiyi topluluktan kaldırmak istediğinize emin misiniz?"))) {
      return;
    }
    setActionPostId(postId);
    try {
      const res = await fetchApi(`/communities/${community.id}/posts/${postId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Gönderi topluluktan kaldırıldı.");
        setModerationPosts(prev => prev.filter(p => p.id !== postId));
        loadStats();
      } else {
        toast.error(json.error?.message || "Gönderi kaldırılamadı.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionPostId(null);
    }
  };

  // Handle Transfer Ownership (Owner only)
  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast.error("Lütfen yeni topluluk kurucusunu seçin.");
      return;
    }

    const target = members.find(m => m.user.id === selectedNewOwner);
    const targetName = target ? `@${target.user.username}` : "seçilen üyeye";

    if (!(await confirmDialog(
      "Kritik Sahiplik Devri Onayı",
      `Topluluk kuruculuk yetkilerini ${targetName} devretmek üzeresiniz. Bu işlem sonrasında topluluk üzerindeki kurucu yetkileriniz sonlanacak ve normal üye olacaksınız. Bu işlemi onaylıyor musunuz?`
    ))) {
      return;
    }

    setIsTransferring(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/transfer-ownership`, {
        method: "POST",
        data: { newOwnerId: selectedNewOwner }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Topluluk sahipliği başarıyla devredildi.");
        onCommunityUpdated({
          ...community,
          ownerId: selectedNewOwner,
          isOwner: false,
          role: "MEMBER"
        });
        onClose();
      } else {
        toast.error(json.error?.message || "Sahiplik devredilemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle Delete Community (Owner only)
  const handleDeleteCommunity = async () => {
    if (!(await confirmDialog(
      "Topluluğu Sil",
      "Topluluğu silmek üzeresiniz. Bu işlem toplulukla ilişkili içerikleri ve üyelik ilişkilerini etkileyebilir. Silinen topluluk aramalardan, keşfetten ve topluluk listesinden kaldırılacaktır. Onaylıyor musunuz?"
    ))) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetchApi(`/communities/${community.id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Topluluk silindi.");
        onClose();
        if (onCommunityDeleted) onCommunityDeleted();
        navigate("/communities");
      } else {
        toast.error(json.error?.message || "Topluluk silinemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "ADMIN_ADDED": return "Yönetici atandı";
      case "ADMIN_REMOVED": return "Yöneticilik kaldırıldı";
      case "MEMBER_REMOVED": return "Üye çıkarıldı";
      case "OWNERSHIP_TRANSFERRED": return "Sahiplik devredildi";
      case "SETTINGS_UPDATED": return "Ayarlar güncellendi";
      case "COMMUNITY_CREATED": return "Topluluk kuruldu";
      case "COMMUNITY_DELETED": return "Topluluk silindi";
      case "REQUEST_ACCEPTED": return "Katılım onaylandı";
      case "REQUEST_REJECTED": return "Katılım reddedildi";
      case "POST_REMOVED": return "Gönderi kaldırıldı";
      default: return action;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0D121D] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Topluluk Yönetim Merkezi
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {isOwner ? "Kurucu" : "Yönetici"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {community.name} · c/{community.slug}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container with Sidebar Navigation */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <nav className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/[0.08] p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto bg-slate-50/40 dark:bg-[#070A10]/40">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Genel Özet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                activeTab === "members"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>Üyeler</span>
              </div>
              {stats && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                  activeTab === "members" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-slate-300"
                }`}>
                  {stats.totalMembers}
                </span>
              )}
            </button>

            {community.isPrivate && (
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserPlusIcon className="w-4 h-4 shrink-0" />
                  <span>Katılım İstekleri</span>
                </div>
                {stats && stats.pendingRequests > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                    {stats.pendingRequests}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("moderation")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                activeTab === "moderation"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Moderasyon</span>
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Ayarlar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                activeTab === "audit"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Denetim Kaydı</span>
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setActiveTab("danger")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 text-left cursor-pointer ${
                  activeTab === "danger"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Tehlikeli Alan</span>
              </button>
            )}
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Topluluk Genel Durumu
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Topluluğunuza ait güncel metrikler ve yetki kontrolleri.
                  </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Toplam Üye</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                      {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : stats?.totalMembers || 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Bekleyen İstek</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                      {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-amber-600" /> : stats?.pendingRequests || 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Toplam Gönderi</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                      {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : stats?.totalPosts || 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Yönetici Sayısı</div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                      {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : stats?.moderatorCount || 1}
                    </div>
                  </div>
                </div>

                {/* Quick Info Banner */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070A10] space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-3">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Görünürlük / Gizlilik</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      community.isPrivate 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}>
                      {community.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      {community.isPrivate ? "Özel Topluluk (Katılım Onaylı)" : "Herkese Açık Topluluk"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-3">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Kategori</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {community.category || "Genel"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Yetkiniz</span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      {isOwner ? <Crown className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4" />}
                      {isOwner ? "Topluluk Kurucusu (Tam Yetkili)" : "Topluluk Yöneticisi"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MEMBERS */}
            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      Üye Yönetimi
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Topluluk üyelerini inceleyin, yönetici atayın veya topluluktan çıkarın.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Üye ara..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadMembers()}
                        className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <select
                      value={memberRoleFilter}
                      onChange={(e) => {
                        setMemberRoleFilter(e.target.value);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="">Tüm Roller</option>
                      <option value="MODERATOR">Yöneticiler</option>
                      <option value="MEMBER">Üyeler</option>
                    </select>

                    <Button variant="secondary" size="sm" onClick={loadMembers}>
                      Filtrele
                    </Button>
                  </div>
                </div>

                {loadingMembers ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">Eşleşen üye bulunamadı.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#070A10]">
                    {members.map((m) => {
                      const isTargetOwner = community.ownerId === m.user.id || m.role === "OWNER";
                      const isTargetMod = ['admin', 'OWNER', 'MODERATOR'].includes(m.role);
                      const isSelf = currentUserId === m.user.id;

                      return (
                        <div key={m.user.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar url={m.user.avatarUrl} name={m.user.displayName || m.user.username} size="md" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                  {m.user.displayName || m.user.username}
                                </span>
                                {isTargetOwner ? (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                    <Crown className="w-3 h-3" /> Kurucu
                                  </span>
                                ) : isTargetMod ? (
                                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                    Yönetici
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                                    Üye
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate">@{m.user.username}</div>
                            </div>
                          </div>

                          {/* Member Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Role Toggle: Only Owner can promote/demote, cannot change self or owner */}
                            {isOwner && !isTargetOwner && !isSelf && (
                              <button
                                type="button"
                                disabled={actionUserId === m.user.id}
                                onClick={() => handleRoleChange(m.user.id, m.role, m.user.username)}
                                className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold transition-all ${
                                  isTargetMod
                                    ? "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                                }`}
                              >
                                {actionUserId === m.user.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isTargetMod ? (
                                  "Yöneticiliği Kaldır"
                                ) : (
                                  "Yönetici Yap"
                                )}
                              </button>
                            )}

                            {/* Kick Member: Owner or Mod (Mod cannot kick Mod or Owner, neither can kick self) */}
                            {!isTargetOwner && !isSelf && (isOwner || !isTargetMod) && (
                              <button
                                type="button"
                                disabled={actionUserId === m.user.id}
                                onClick={() => handleRemoveMember(m.user.id, m.user.username)}
                                title="Topluluktan Çıkar"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                              >
                                {actionUserId === m.user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserMinus className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: JOIN REQUESTS */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Katılım İstekleri
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Özel topluluğunuza katılmak isteyen kullanıcıların talepleri.
                  </p>
                </div>

                {loadingRequests ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    Bekleyen katılım isteği bulunmamaktadır.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#070A10]">
                    {requests.map((r) => (
                      <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar url={r.user.avatarUrl} name={r.user.displayName || r.user.username} size="md" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {r.user.displayName || r.user.username}
                            </div>
                            <div className="text-xs text-slate-400">@{r.user.username}</div>
                            {r.note && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                                "{r.note}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            disabled={actionRequestId === r.id}
                            onClick={() => handleAcceptRequest(r.id, r.user.username)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                          >
                            {actionRequestId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Kabul Et</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionRequestId === r.id}
                            onClick={() => handleRejectRequest(r.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 active:scale-95 transition-all"
                          >
                            {actionRequestId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            <span>Reddet</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MODERATION */}
            {activeTab === "moderation" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    İçerik Moderasyonu
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topluluk içinde paylaşılan gönderileri denetleyin ve uygunsuz olanları kaldırın.
                  </p>
                </div>

                {loadingPosts ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : moderationPosts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    Bu toplulukta henüz gönderi yok.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#070A10]">
                    {moderationPosts.map((post) => (
                      <div key={post.id} className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar url={post.user?.avatarUrl} name={post.user?.username} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {post.user?.displayName || post.user?.username}
                              </span>
                              <span>·</span>
                              <span>#{post.id}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-1 line-clamp-3">
                              {post.content}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={actionPostId === post.id}
                          onClick={() => handleRemovePost(post.id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shrink-0 transition-colors"
                        >
                          {actionPostId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Gönderiyi Kaldır"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SETTINGS (Owner Only) */}
            {activeTab === "settings" && isOwner && (
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Topluluk Bilgileri ve Ayarları
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topluluk adı, açıklaması, kategorisi ve kurallarını güncelleyin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topluluk Adı *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Topluluğunuzun amacını ve kapsamını anlatın..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gizlilik Modu
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="privacy"
                          checked={!isPrivate}
                          onChange={() => setIsPrivate(false)}
                          className="text-blue-600"
                        />
                        <span>Herkese Açık</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="privacy"
                          checked={isPrivate}
                          onChange={() => setIsPrivate(true)}
                          className="text-blue-600"
                        />
                        <span>Özel Topluluk</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Avatar Görsel URL'si
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topluluk Kuralları
                  </label>
                  <textarea
                    rows={3}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="1. Saygılı ve yapıcı iletişim kurun..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" isLoading={savingSettings}>
                    Ayarları Kaydet
                  </Button>
                </div>
              </form>
            )}

            {/* TAB: AUDIT LOG */}
            {activeTab === "audit" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Denetim Kayıtları
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topluluk içinde gerçekleştirilen kritik yönetim hareketleri.
                  </p>
                </div>

                {loadingLogs ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    Henüz kayıtlı bir denetim geçmişi bulunmamaktadır.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <Avatar url={log.actor?.avatarUrl} name={log.actor?.username} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              @{log.actor?.username}
                            </span>
                            <span className="mx-1 text-slate-400">→</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {getActionLabel(log.action)}
                            </span>
                            {log.details && (
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">
                                {log.details}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(log.createdAt).toLocaleDateString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DANGER ZONE (Owner Only) */}
            {activeTab === "danger" && isOwner && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-rose-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Tehlikeli Bölge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topluluk sahipliğini devredin veya topluluğu güvenli bir şekilde kapatın.
                  </p>
                </div>

                {/* Ownership Transfer */}
                <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    Topluluk Sahipliğini Devret
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Sahipliği başka bir topluluk üyesine aktarabilirsiniz. Devir tamamlandığında kurucu yetkileriniz sonlanacak ve rolünüz üye olacaktır.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <select
                      value={selectedNewOwner || ""}
                      onChange={(e) => setSelectedNewOwner(Number(e.target.value) || null)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#070A10] border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="">Yeni Sahibi Seçin...</option>
                      {members
                        .filter(m => m.user.id !== currentUserId)
                        .map(m => (
                          <option key={m.user.id} value={m.user.id}>
                            @{m.user.username} ({m.user.displayName || m.user.username})
                          </option>
                        ))}
                    </select>

                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isTransferring}
                      disabled={!selectedNewOwner}
                      onClick={handleTransferOwnership}
                      className="font-bold border-amber-300 text-amber-900 dark:text-amber-200"
                    >
                      Sahipliği Devret
                    </Button>
                  </div>
                </div>

                {/* Delete Community */}
                <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Topluluğu Sil
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                    Topluluk silindiğinde arama sonuçlarından, keşfetten ve kullanıcı profillerinden kaldırılır. Bu işlem geri alınamaz.
                  </p>

                  <div className="pt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isDeleting}
                      onClick={handleDeleteCommunity}
                      className="font-bold"
                    >
                      Topluluğu Kalıcı Olarak Sil
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
