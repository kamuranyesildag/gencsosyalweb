import React, { useState, useEffect } from "react";
import { EyeOff, Save, Shield, UserX, UserCheck } from "lucide-react";
import { fetchApi } from "../../lib/api";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

interface SettingsPrivacyProps {
  profileData: any;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  showMsg: (text: string, type?: "success" | "error") => void;
}

export function SettingsPrivacy({
  profileData,
  setProfileData,
  showMsg,
}: SettingsPrivacyProps) {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const res = await fetchApi("/blocks/me/blocked");
      const json = await res.json();
      if (json.success) setBlockedUsers(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnblock = async (id: number) => {
    setUnblockingId(id);
    try {
      const res = await fetchApi(`/blocks/${id}/block`, { method: "DELETE" });
      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
        showMsg("Kullanıcının engeli kaldırıldı.");
      }
    } catch (e) {
      console.error(e);
      showMsg("Engel kaldırılamadı.", "error");
    } finally {
      setUnblockingId(null);
    }
  };

  const handleUpdatePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi("/users/me", {
        method: "PATCH",
        data: {
          isPrivate: profileData.isPrivate,
          allowSearchEngineIndexing: profileData.allowSearchEngineIndexing,
          defaultPostVisibility: profileData.defaultPostVisibility,
          messagePreference: profileData.messagePreference,
          mentionPreference: profileData.mentionPreference,
        },
      });
      const json = await res.json();
      if (json.success) {
        showMsg("Gizlilik ayarları başarıyla güncellendi.");
      } else {
        showMsg(json.error?.message || "Güncelleme başarısız.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Gizlilik Tercihleri */}
      <form onSubmit={handleUpdatePrivacy} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            Gizlilik ve Görünürlük
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Hesabınızın görünürlüğünü ve diğer kullanıcılarla etkileşim sınırlarınızı belirleyin.
          </p>
        </div>

        <div className="space-y-5 divide-y divide-slate-100">
          {/* Gizli Hesap Toggle */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Gizli Hesap
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                Sadece onayladığınız takipçileriniz gönderilerinizi ve profil detaylarınızı görebilir.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={profileData.isPrivate}
                onChange={(e) =>
                  setProfileData({ ...profileData, isPrivate: e.target.checked })
                }
              />
              <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          {/* Arama Motoru İndeksleme Toggle */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Arama Motorlarında Görünürlük
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                Profilinizin Google ve diğer arama motorlarında dizine eklenmesine izin verin.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={profileData.allowSearchEngineIndexing}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    allowSearchEngineIndexing: e.target.checked,
                  })
                }
              />
              <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white dark:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          {/* Varsayılan Gönderi Görünürlüğü */}
          <div className="space-y-1.5 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Varsayılan Gönderi Görünürlüğü
            </label>
            <select
              value={profileData.defaultPostVisibility}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  defaultPostVisibility: e.target.value,
                })
              }
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all"
            >
              <option value="PUBLIC">Herkese Açık (Tüm Kullanıcılar)</option>
              <option value="FOLLOWERS">Sadece Takipçiler</option>
              <option value="PRIVATE">Gizli (Sadece Ben)</option>
            </select>
          </div>

          {/* Mesaj Alma Tercihi */}
          <div className="space-y-1.5 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Direkt Mesaj İzinleri
            </label>
            <select
              value={profileData.messagePreference}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  messagePreference: e.target.value,
                })
              }
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all"
            >
              <option value="ANYONE">Herkesten Mesaj Al</option>
              <option value="FOLLOWERS">Sadece Takip Ettiğim Kişiler</option>
              <option value="NONE">Hiç Kimse Mesaj Gönderemesin</option>
            </select>
          </div>

          {/* Bahsedilme (Mention) Tercihi */}
          <div className="space-y-1.5 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Etiketlenme / Bahsedilme İzinleri
            </label>
            <select
              value={profileData.mentionPreference}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  mentionPreference: e.target.value,
                })
              }
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all"
            >
              <option value="ANYONE">Herkes Benden Bahsedebilir (@kullaniciadi)</option>
              <option value="FOLLOWERS">Sadece Takip Ettiğim Kişiler</option>
              <option value="NONE">Kimse Benden Bahsedemez</option>
            </select>
          </div>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-2xl font-bold w-full sm:w-auto shadow-xs"
          >
            Gizlilik Ayarlarını Kaydet
          </Button>
        </div>
      </form>

      {/* 2. Engellenen Kullanıcılar Listesi */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600" />
            Engellenen Hesaplar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Engellediğiniz hesaplar sizinle iletişim kuramaz ve gönderilerinizi göremez.
          </p>
        </div>

        {blockedUsers.length === 0 ? (
          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
            Engellediğiniz herhangi bir kullanıcı bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedUsers.map((u) => (
              <div
                key={u.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    url={u.avatarUrl}
                    name={u.displayName || u.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {u.displayName || u.username}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @{u.username}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={unblockingId === u.id}
                  onClick={() => handleUnblock(u.id)}
                  className="rounded-full font-bold text-xs shrink-0 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                >
                  Engeli Kaldır
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
