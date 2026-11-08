import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "../lib/api";
import { Loader2, UserMinus, Crown, Search, Shield, X } from "lucide-react";
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
  onMemberCountChanged,
}: CommunityMembersProps) {
  const {
    data: members,
    setData,
    loading,
    loadingMore,
    hasMore,
    loadInitial,
    loadMore,
  } = usePagination(`/communities/${communityId}/members`);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [roleActionId, setRoleActionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleRemove = async (userId: number, username: string) => {
    if (userId === currentUserId) {
      toast.error(
        "Kendinizi bu alandan çıkaramazsınız. Lütfen 'Ayrıl' seçeneğini kullanın."
      );
      return;
    }

    if (
      !(await confirmDialog(
        "Onay",
        `@${username} adlı üyeyi topluluktan çıkarmak istediğinize emin misiniz?`
      ))
    )
      return;

    setRemovingId(userId);
    try {
      const res = await fetchApi(`/communities/${communityId}/members/${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`@${username} topluluktan çıkarıldı.`);
        setData((prev) => prev.filter((m) => m.user.id !== userId));
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

  const handleToggleRole = async (
    userId: number,
    currentRole: string,
    username: string
  ) => {
    const newRole = currentRole === "MODERATOR" ? "MEMBER" : "MODERATOR";
    const label =
      newRole === "MODERATOR" ? "yönetici yapmak" : "yöneticiliğini kaldırmak";

    if (
      !(await confirmDialog(
        "Yetki Değişimi",
        `@${username} adlı üyeyi ${label} istediğinize emin misiniz?`
      ))
    )
      return;

    setRoleActionId(userId);
    try {
      const res = await fetchApi(
        `/communities/${communityId}/members/${userId}/role`,
        {
          method: "PUT",
          data: { role: newRole },
        }
      );
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "Rol güncellendi.");
        setData((prev) =>
          prev.map((m) =>
            m.user.id === userId ? { ...m, role: newRole } : m
          )
        );
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
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.user.username.toLowerCase().includes(q) ||
        (m.user.displayName && m.user.displayName.toLowerCase().includes(q));

      const isTargetMod = ["admin", "OWNER", "MODERATOR"].includes(m.role);
      const matchesRole =
        !roleFilter ||
        (roleFilter === "MODERATOR" && isTargetMod) ||
        (roleFilter === "MEMBER" && !isTargetMod);

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Üye adı veya @kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">Tüm Üyeler</option>
          <option value="MODERATOR">Yönetim Ekibi</option>
          <option value="MEMBER">Üyeler</option>
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424]">
          Arama kriterlerinize uygun üye bulunamadı.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#0D1424]">
          <InfiniteScroll
            items={filteredMembers}
            hasMore={hasMore && !search && !roleFilter}
            isLoading={loadingMore}
            onLoadMore={loadMore}
            renderItem={(member) => {
              const isTargetOwner = member.role === "OWNER";
              const isTargetMod = ["admin", "OWNER", "MODERATOR"].includes(
                member.role
              );
              const isSelf = currentUserId === member.user.id;

              return (
                <div
                  key={member.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/profile/${member.user.username}`}>
                      <Avatar
                        url={member.user.avatarUrl}
                        name={member.user.displayName || member.user.username}
                        size="md"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/profile/${member.user.username}`}
                        className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                      >
                        {member.user.displayName || member.user.username}
                      </Link>
                      {/* Unboxed Metadata Row */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        <span>@{member.user.username}</span>
                        <span aria-hidden="true">·</span>
                        {isTargetOwner ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Crown className="w-3 h-3" />
                            <span>Kurucu</span>
                          </span>
                        ) : isTargetMod ? (
                          <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                            <Shield className="w-3 h-3" />
                            <span>Yönetici</span>
                          </span>
                        ) : (
                          <span>Üye</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOwner && !isTargetOwner && !isSelf && (
                      <button
                        type="button"
                        disabled={roleActionId === member.user.id}
                        onClick={() =>
                          handleToggleRole(
                            member.user.id,
                            member.role,
                            member.user.username
                          )
                        }
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                          isTargetMod
                            ? "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                        }`}
                      >
                        {roleActionId === member.user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isTargetMod ? (
                          "Yetkiyi Kaldır"
                        ) : (
                          "Yönetici Yap"
                        )}
                      </button>
                    )}

                    {(isOwner || isModerator) &&
                      !isTargetOwner &&
                      !isSelf &&
                      (isOwner || !isTargetMod) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(member.user.id, member.user.username)
                          }
                          disabled={removingId === member.user.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          title="Üyeyi Çıkar"
                        >
                          {removingId === member.user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
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
