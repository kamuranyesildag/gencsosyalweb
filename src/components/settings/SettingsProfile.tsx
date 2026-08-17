import React, { useState } from "react";
import { 
  User, 
  Camera, 
  Upload, 
  Loader2, 
  Save, 
  Globe, 
  MapPin, 
  FileText,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../../context/useAuth";
import { fetchApi } from "../../lib/api";
import { Button } from "../ui/Button";

interface SettingsProfileProps {
  profileData: any;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  showMsg: (text: string, type?: "success" | "error") => void;
  loadProfile: () => Promise<void>;
}

export function SettingsProfile({
  profileData,
  setProfileData,
  showMsg,
}: SettingsProfileProps) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showMsg("Sadece JPEG, PNG, GIF veya WEBP formatları desteklenir.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showMsg("Dosya boyutu 10MB'dan küçük olmalıdır.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const isAvatar = type === "avatar";
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setProfileData((prev: any) => ({
          ...prev,
          [isAvatar ? "avatarUrl" : "coverUrl"]: json.data.url,
        }));

        // Auto-save to user profile
        const updateRes = await fetch("/api/v1/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            [isAvatar ? "avatarUrl" : "coverUrl"]: json.data.url,
          }),
        });

        if (updateRes.ok) {
          if (isAvatar && user) {
            setUser({ ...user, avatarUrl: json.data.url });
          }
          showMsg(
            isAvatar
              ? "Profil fotoğrafı başarıyla güncellendi."
              : "Kapak görseli başarıyla güncellendi."
          );
        } else {
          showMsg("Görsel yüklendi ancak profile kaydedilemedi.", "error");
        }
      } else {
        showMsg(json.error?.message || "Dosya yüklenemedi.", "error");
      }
    } catch (err) {
      showMsg("Yükleme sırasında bir hata oluştu.", "error");
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingCover(false);
    }
    e.target.value = "";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi("/users/me", {
        method: "PATCH",
        data: {
          displayName: profileData.displayName,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          avatarUrl: profileData.avatarUrl,
          coverUrl: profileData.coverUrl,
        },
      });
      const json = await res.json();
      if (json.success) {
        if (user) {
          setUser({ ...user, displayName: profileData.displayName });
        }
        showMsg("Profil bilgileri başarıyla güncellendi.");
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
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* 1. Görseller Bölümü */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Görsel Kimlik
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Profilinizi ve kapak görselinizi özelleştirerek kendinizi tanıtın.
          </p>
        </div>

        <div className="space-y-6">
          {/* Cover Photo Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Kapak Fotoğrafı
            </label>
            <div className="relative w-full h-36 sm:h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 group">
              {profileData.coverUrl ? (
                <img
                  src={profileData.coverUrl}
                  alt="Kapak Fotoğrafı"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-xs font-semibold">Kapak fotoğrafı ekleyin</span>
                </div>
              )}
              <label className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingCover ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-1.5" />
                    <span className="text-xs text-white font-bold">Kapağı Değiştir</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "cover")}
                  disabled={uploadingCover}
                />
              </label>
            </div>
          </div>

          {/* Avatar Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow-md group shrink-0">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User className="w-10 h-10" />
                </div>
              )}
              <label className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold">Değiştir</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "avatar")}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Profil Fotoğrafı</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Kare veya dairesel, en fazla 10MB boyutunda PNG, JPG veya WEBP formatında görsel yükleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Temel Bilgiler Bölümü */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Hakkında & Detaylar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Topluluk profilinizde görüntülenecek temel bilgileri düzenleyin.
          </p>
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Görünen Ad
            </label>
            <input
              type="text"
              required
              value={profileData.displayName}
              onChange={(e) =>
                setProfileData({ ...profileData, displayName: e.target.value })
              }
              placeholder="Ad Soyad veya Takma Ad"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Biyografi
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {profileData.bio?.length || 0}/160
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={160}
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              placeholder="Kendiniz, ilgi alanlarınız veya projeleriniz hakkında kısa bir bilgi..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Location & Website Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Konum
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                placeholder="Örn: İstanbul, Türkiye"
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Web Sitesi
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) =>
                  setProfileData({ ...profileData, website: e.target.value })
                }
                placeholder="https://example.com"
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-2xl font-bold w-full sm:w-auto shadow-xs"
          >
            Değişiklikleri Kaydet
          </Button>
        </div>
      </div>
    </form>
  );
}
