import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "./ui/Toast";
import { UserPlus, Check } from "lucide-react";

export function SuggestedUsers({ onFollowChange }: { onFollowChange?: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchApi("/onboarding/suggested-users");
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    setFollowingMap((prev) => ({ ...prev, [userId]: !isFollowing }));
    if (onFollowChange) onFollowChange();

    try {
      const endpoint = isFollowing ? `/users/${userId}/follow` : `/users/${userId}/follow`;
      await fetchApi(endpoint, {
        method: isFollowing ? "DELETE" : "POST",
        data: isFollowing ? undefined : { followingId: userId },
      });
      toast.success(isFollowing ? "Takipten çıkıldı" : "Takip ediliyor");
    } catch (e) {
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [userId]: isFollowing }));
      toast.error("İşlem başarısız oldu. Lütfen tekrar deneyin.");
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>;

  if (users.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {users.map((user) => {
          const isFollowing = followingMap[user.id] || false;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="sm" />
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-xs font-medium text-slate-500 truncate">@{user.username}</p>
                </div>
              </Link>
              
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                onClick={() => handleFollow(user.id, isFollowing)}
                className={`shrink-0 rounded-full px-4 text-xs font-bold ${isFollowing ? "border-slate-200 text-slate-700 bg-white" : ""}`}
                leftIcon={isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              >
                {isFollowing ? "Takipte" : "Takip Et"}
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
