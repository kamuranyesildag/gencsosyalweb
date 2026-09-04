import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { Medal } from "lucide-react";

export function UserBadges({ userId }: { userId: number }) {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetchApi(`/gamification/badges/${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setBadges(d.data || []);
      })
      .catch(() => {});
  }, [userId]);

  if (badges.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
      <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-4">
        <Medal className="w-5 h-5 text-indigo-500" />
        Kazanılan Rozetler
      </h3>
      <div className="flex flex-wrap gap-3">
        {badges.map(b => (
          <div key={b.id} className="flex items-center gap-2.5 p-2 pr-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center text-xl">
              {b.badge.iconUrl === 'Target' ? '🎯' : '🏅'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{b.badge.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{new Date(b.awardedAt).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
