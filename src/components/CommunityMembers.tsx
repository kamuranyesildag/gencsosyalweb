import React, { useEffect, useState } from "react";
import { fetchApi } from "../lib/api";
import { Loader2, ShieldAlert, UserMinus } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Link } from "react-router";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "./InfiniteScroll";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";

export function CommunityMembers({ communityId, isOwnerOrAdmin, currentUserId }: { communityId: number, isOwnerOrAdmin: boolean, currentUserId: number }) {
  const { data: members, setData, loading, loadingMore, hasMore, loadInitial, loadMore } = usePagination(`/communities/${communityId}/members`);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleRemove = async (userId: number, username: string) => {
    if (!(await confirmDialog("Onay", `@${username} kullanıcısını topluluktan çıkarmak istediğinize emin misiniz?`))) return;
    
    setRemovingId(userId);
    try {
      const res = await fetchApi(`/communities/${communityId}/members/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev.filter(m => m.user.id !== userId));
      } else {
        toast.error(json.error?.message || "Kullanıcı çıkarılamadı.");
      }
    } catch (e) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-900" /></div>;

  if (members.length === 0) {
    return <div className="p-12 text-center text-gray-500">Üye bulunamadı.</div>;
  }

  return (
    <div className="divide-y divide-gray-100">
      <InfiniteScroll 
        items={members}
        hasMore={hasMore} 
        isLoading={loadingMore} 
        onLoadMore={loadMore}
        renderItem={(member) => (
          <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <Link to={`/profile/${member.user.username}`}>
              <Avatar url={member.user.avatarUrl} size="md" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${member.user.username}`} className="font-bold text-gray-900 truncate hover:underline">
                  {member.user.displayName || member.user.username}
                </Link>
                {['admin', 'OWNER', 'MODERATOR'].includes(member.role) && (
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {member.role === 'admin' || member.role === 'OWNER' ? 'Kurucu' : 'Mod'}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">@{member.user.username}</div>
            </div>
            
            {isOwnerOrAdmin && currentUserId !== member.user.id && !['admin', 'OWNER'].includes(member.role) && (
              <button 
                onClick={() => handleRemove(member.user.id, member.user.username)}
                disabled={removingId === member.user.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
                title="Üyeyi Çıkar"
              >
                {removingId === member.user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
