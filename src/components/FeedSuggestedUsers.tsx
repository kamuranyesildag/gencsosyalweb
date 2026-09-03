import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchApi } from "../lib/api";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { motion } from "motion/react";
import { toast } from "./ui/Toast";
import { UserPlus, Check, X, Sparkles } from "lucide-react";

export function FeedSuggestedUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchApi("/onboarding/suggested-users");
        const json = await res.json();
        if (json.success) {
          setUsers(json.data.slice(0, 5)); // max 5 for feed
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
    try {
      const endpoint = isFollowing ? `/users/${userId}/follow` : `/users/${userId}/follow`;
      await fetchApi(endpoint, {
        method: isFollowing ? "DELETE" : "POST",
        data: isFollowing ? undefined : { followingId: userId },
      });
      toast.success(isFollowing ? "Takipten çıkıldı" : "Takip ediliyor");
    } catch (e) {
      setFollowingMap((prev) => ({ ...prev, [userId]: isFollowing }));
      toast.error("İşlem başarısız oldu.");
    }
  };

  if (loading || dismissed || users.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-sm py-6 my-4 mx-2 sm:mx-4 relative overflow-hidden max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="px-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Takip Önerileri
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">İlgini çekebilecek yetenekli kişiler</p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-4 scrollbar-hide -webkit-overflow-scrolling-touch px-4">
        <div className="flex gap-4">
          {users.map((user, index) => {
            const isFollowing = followingMap[user.id] || false;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-[160px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs"
              >
                <Link to={`/profile/${user.username}`} className="flex flex-col items-center">
                  <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="lg" className="w-16 h-16 mb-3 shadow-sm" />
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 w-full truncate px-1">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 w-full truncate mt-0.5 mb-4">
                    @{user.username}
                  </p>
                </Link>
                <Button
                  variant={isFollowing ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleFollow(user.id, isFollowing)}
                  className={`w-full rounded-xl text-xs font-bold py-2 ${isFollowing ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300" : ""}`}
                >
                  {isFollowing ? "Takipte" : "Takip Et"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
