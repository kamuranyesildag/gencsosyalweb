import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "../lib/api";
import { Loader2, ShieldCheck, UserMinus, Crown, Search, Shield } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Link } from "react-router";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "./InfiniteScroll";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";

interface CommunityMembersProps {
  communityId: number;
  isOwner: boolean;
  isModerator: boolean;
  currentUserId: number;
  onMemberCountChanged?: (delta: number) => void;
}

export function CommunityMembers({ 
  communityId, 
  isOwner, 
  isModerator, 
  currentUserId,
  onMemberCountChanged
}: CommunityMembersProps) {
  const { data: members, setData, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination(`/communities/${communityId}/members`);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [roleActionId, setRoleActionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleRemove = async (userId: number, username: string) => {
    if (userId === currentUserId) {
      toast.error("Kendinizi bu alandan çıkaramazsınız. Lütfen 'Ayrıl' seçeneğini kullanın.");
      return;
    }

    if (!(await confirmDialog("Onay", `@${username} adlı üyeyi topluluktan çıkarmak istediğinize emin misiniz?`))) return;
    
    setRemovingId(userId);
    try {
      const res = await fetchApi(`/communities/${communityId}/members/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${username} topluluktan çıkarıldı.`);
        setData(prev => prev.filter(m => m.user.id !== userId));
        if (onMemberCountChanged) onMemberCountChanged(-1);
      } else {
        toast.error(json.error?.message || "Kullanıcı çıkarılamadı.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleRole = async (userId: number, currentRole: string, username: string) => {
    const newRole = currentRole === "MODERATOR" ? "MEMBER" : "MODERATOR";
    const label = newRole === "MODERATOR" ? "yönetici yapmak" : "yöneticiliğini kaldırmak";

    if (!(await confirmDialog("Yetki Değişimi", `@${username} adlı üyeyi ${label} istediğinize emin misiniz?`))) return;

    setRoleActionId(userId);
    try {
      const res = await fetchApi(`/communities/${communityId}/members/${userId}/role`, {
        method: "PUT",
        data: { role: newRole }
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "Rol güncellendi.");
        setData(prev => prev.map(m => m.user.id === userId ? { ...m, role: newRole } : m));
      } else {
        toast.error(json.error?.message || "Yetki güncellenemedi.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setRoleActionId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search.trim() || 
        m.user.username.toLowerCase().includes(search.toLowerCase()) ||
        (m.user.displayName && m.user.displayName.toLowerCase().includes(search.toLowerCase()));

      const isTargetMod = ['admin', 'OWNER', 'MODERATOR'].includes(m.role);
      const matchesRole = !roleFilter || 
        (roleFilter === "MODERATOR" && isTargetMod) ||
        (roleFilter === "MEMBER" && !isTargetMod);

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Üye ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-[#070A10] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#070A10] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          <option value="">Tüm Üyeler</option>
          <option value="MODERATOR">Yöneticiler</option>
          <option value="MEMBER">Normal Üyeler</option>
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">Üye bulunamadı.</div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#070A10]">
          <InfiniteScroll 
            items={filteredMembers}
            hasMore={hasMore && !search && !roleFilter} 
            isLoading={loadingMore} 
            onLoadMore={loadMore}
            renderItem={(member) => {
              const isTargetOwner = member.role === "OWNER";
              const isTargetMod = ['admin', 'OWNER', 'MODERATOR'].includes(member.role);
              const isSelf = currentUserId === member.user.id;

              return (
                <div key={member.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/profile/${member.user.username}`}>
                      <Avatar url={member.user.avatarUrl} name={member.user.displayName || member.user.username} size="md" />
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/profile/${member.user.username}`} className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate hover:underline">
                          {member.user.displayName || member.user.username}
                        </Link>
                        {isTargetOwner ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <Crown className="w-3 h-3" /> Kurucu
                          </span>
                        ) : isTargetMod ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <Shield className="w-3 h-3" /> Yönetici
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-400 truncate">@{member.user.username}</div>
                    </div>
                  </div>
                  
                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Role toggle (Owner only) */}
                    {isOwner && !isTargetOwner && !isSelf && (
                      <button
                        type="button"
                        disabled={roleActionId === member.user.id}
                        onClick={() => handleToggleRole(member.user.id, member.role, member.user.username)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all ${
                          isTargetMod
                            ? "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                        }`}
                      >
                        {roleActionId === member.user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isTargetMod ? (
                          "Yetkiyi Kaldır"
                        ) : (
                          "Yönetici Yap"
                        )}
                      </button>
                    )}

                    {/* Member kick (Owner or Mod) */}
                    {(isOwner || isModerator) && !isTargetOwner && !isSelf && (isOwner || !isTargetMod) && (
                      <button 
                        onClick={() => handleRemove(member.user.id, member.user.username)}
                        disabled={removingId === member.user.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all disabled:opacity-50"
                        title="Üyeyi Çıkar"
                      >
                        {removingId === member.user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
