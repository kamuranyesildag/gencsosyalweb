import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { UserCircle, Image, MapPin, Link2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

export function ProfileCompletionCard() {
  const { user, isAuthenticated } = useAuthStore();
  const [completion, setCompletion] = useState(0);
  const [missingItems, setMissingItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchProfile = async () => {
      try {
        const res = await fetchApi(`/users/${user.username}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const profile = data.data;
          
          const fields = [
            { key: 'avatarUrl', label: 'Profil Fotoğrafı', icon: UserCircle },
            { key: 'coverUrl', label: 'Kapak Fotoğrafı', icon: Image },
            { key: 'bio', label: 'Hakkında (Bio)', icon: CheckCircle2 },
            { key: 'location', label: 'Konum', icon: MapPin },
            { key: 'website', label: 'Web Sitesi', icon: Link2 }
          ];
          
          let completed = 0;
          const missing: any[] = [];
          
          fields.forEach(field => {
            if (profile[field.key]) {
              completed++;
            } else {
              missing.push(field);
            }
          });
          
          setCompletion(Math.round((completed / fields.length) * 100));
          setMissingItems(missing);
        }
      } catch (error) {
        console.error("Error fetching profile completion:", error);
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || completion === 100 || missingItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-900">
        <div 
          className="h-full bg-slate-900 transition-all duration-1000 ease-out" 
          style={{ width: `${completion}%` }}
        />
      </div>
      
      <h2 className="text-[15px] font-extrabold mb-1 text-slate-900 dark:text-slate-100 tracking-tight mt-1">Profilini Tamamla</h2>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-4">Profilin %{completion} tamamlandı. Deneyimini geliştirmek için eksikleri doldurabilirsin.</p>
      
      <div className="space-y-2.5 mb-4">
        {missingItems.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <item.icon className="w-4 h-4 text-slate-400" />
            <span>{item.label} ekle</span>
          </div>
        ))}
        {missingItems.length > 2 && (
          <div className="text-xs text-slate-400 font-medium pl-6.5">
            + {missingItems.length - 2} adım daha
          </div>
        )}
      </div>
      
      <Link to="/settings">
        <Button variant="outline" size="sm" fullWidth>Profili Düzenle</Button>
      </Link>
    </div>
  );
}
