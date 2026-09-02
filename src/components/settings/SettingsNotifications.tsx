import React, { useState } from "react";
import { Bell, Save, Sparkles, MessageCircle, Heart, UserPlus, Mail } from "lucide-react";
import { Button } from "../ui/Button";

interface SettingsNotificationsProps {
  showMsg: (text: string, type?: "success" | "error") => void;
}

export function SettingsNotifications({ showMsg }: SettingsNotificationsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    likes: true,
    comments: true,
    mentions: true,
    follows: true,
    messages: true,
    newsletters: false,
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Persist to localStorage or mock update
    try {
      localStorage.setItem("notification_preferences", JSON.stringify(settings));
    } catch {}

    setTimeout(() => {
      setLoading(false);
      showMsg("Bildirim tercihleriniz başarıyla kaydedildi.");
    }, 400);
  };

  const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="font-bold text-slate-900 text-sm">{label}</div>
        {description && (
          <div className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
      </label>
    </div>
  );

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-900" />
            Bildirim Tercihleri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Hangi durumlarda anlık veya e-posta ile bildirim almak istediğinizi özelleştirin.
          </p>
        </div>

        <div className="space-y-6 divide-y divide-slate-100">
          {/* Genel Kanallar */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Bildirim Kanalları
            </h3>
            <ToggleRow
              label="Push Bildirimleri"
              description="Tarayıcı ve mobil uygulama üzerinden anlık bildirimler"
              checked={settings.pushEnabled}
              onChange={(c) => setSettings({ ...settings, pushEnabled: c })}
            />
            <ToggleRow
              label="E-posta Özetleri"
              description="Haftalık bülten ve önemli hesap güncellemeleri"
              checked={settings.emailEnabled}
              onChange={(c) => setSettings({ ...settings, emailEnabled: c })}
            />
          </div>

          {/* Etkileşimler */}
          <div className="pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sosyal Etkileşimler
            </h3>
            <ToggleRow
              label="Beğeniler"
              description="Gönderiniz veya projeniz beğenildiğinde"
              checked={settings.likes}
              onChange={(c) => setSettings({ ...settings, likes: c })}
            />
            <ToggleRow
              label="Yorumlar ve Yanıtlar"
              description="Gönderinize veya projenize yorum yapıldığında"
              checked={settings.comments}
              onChange={(c) => setSettings({ ...settings, comments: c })}
            />
            <ToggleRow
              label="Bahsedilmeler"
              description="Bir gönderi veya yorumda sizden bahsedildiğinde (@kullaniciadi)"
              checked={settings.mentions}
              onChange={(c) => setSettings({ ...settings, mentions: c })}
            />
            <ToggleRow
              label="Yeni Takipçiler"
              description="Biri sizi takip etmeye başladığında"
              checked={settings.follows}
              onChange={(c) => setSettings({ ...settings, follows: c })}
            />
          </div>

          {/* İletişim & Diğer */}
          <div className="pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mesajlar & Bülten
            </h3>
            <ToggleRow
              label="Direkt Mesajlar"
              description="Yeni bir özel mesaj aldığınızda"
              checked={settings.messages}
              onChange={(c) => setSettings({ ...settings, messages: c })}
            />
            <ToggleRow
              label="Geliştirici İpuçları & Etkinlikler"
              description="Genç Sosyal topluluk duyuruları ve yarışma haberleri"
              checked={settings.newsletters}
              onChange={(c) => setSettings({ ...settings, newsletters: c })}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-2xl font-bold w-full sm:w-auto shadow-xs"
          >
            Tercihleri Kaydet
          </Button>
        </div>
      </div>
    </form>
  );
}
