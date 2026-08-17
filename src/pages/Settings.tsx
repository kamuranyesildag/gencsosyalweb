import React, { useState, useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { fetchApi } from "../lib/api";
import { SettingsProjects } from "../components/SettingsProjects";
import { SettingsVerification } from "../components/SettingsVerification";
import { SettingsInvites } from "../components/SettingsInvites";
import { SettingsProfile } from "../components/settings/SettingsProfile";
import { SettingsAccount } from "../components/settings/SettingsAccount";
import { SettingsPrivacy } from "../components/settings/SettingsPrivacy";
import { SettingsSecurity } from "../components/settings/SettingsSecurity";
import { SettingsNotifications } from "../components/settings/SettingsNotifications";
import { SettingsAppearance } from "../components/settings/SettingsAppearance";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Shield, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  Bell, 
  Palette, 
  LayoutGrid, 
  UserCheck, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight
} from "lucide-react";

export type SettingsTab = 
  | "profile" 
  | "account" 
  | "privacy" 
  | "notifications" 
  | "appearance" 
  | "security" 
  | "projects" 
  | "verification" 
  | "invites";

interface NavGroup {
  title: string;
  items: {
    id: SettingsTab;
    icon: React.ElementType;
    label: string;
    description: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Kişisel",
    items: [
      { id: "profile", icon: User, label: "Profil Bilgileri", description: "İsim, biyografi, avatar ve kapak" },
      { id: "account", icon: Lock, label: "Hesap & İletişim", description: "E-posta adresi ve hesap yönetimi" },
    ],
  },
  {
    title: "Tercihler",
    items: [
      { id: "privacy", icon: EyeOff, label: "Gizlilik & Engelleme", description: "Görünürlük ve engellenenler" },
      { id: "notifications", icon: Bell, label: "Bildirimler", description: "Push ve e-posta tercihleri" },
      { id: "appearance", icon: Palette, label: "Görünüm", description: "Tema ve animasyonlar" },
    ],
  },
  {
    title: "Gelişmiş",
    items: [
      { id: "security", icon: Shield, label: "Güvenlik & Oturumlar", description: "Şifre ve aktif cihazlar" },
      { id: "projects", icon: LayoutGrid, label: "Projelerim", description: "Portföy projeleri ve vitrin" },
      { id: "invites", icon: UserCheck, label: "İş Birliği Davetleri", description: "Ortak üretici davetleri" },
      { id: "verification", icon: CheckCircle2, label: "Hesap Doğrulama", description: "Mavi tik rozet başvurusu" },
    ],
  },
];

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as SettingsTab;
    const validTabs: SettingsTab[] = [
      "profile", "account", "privacy", "notifications", 
      "appearance", "security", "projects", "verification", "invites"
    ];
    return validTabs.includes(tab) ? tab : "profile";
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatarUrl: "",
    coverUrl: "",
    isPrivate: false,
    allowSearchEngineIndexing: true,
    messagePreference: "ANYONE",
    mentionPreference: "ANYONE",
    defaultPostVisibility: "PUBLIC",
  });
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "success" as "success" | "error" });

  useEffect(() => {
    loadProfile();
  }, []);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 4000);
  };

  const loadProfile = async () => {
    try {
      const res = await fetchApi("/auth/me");
      const json = await res.json();
      if (json.success) {
        setEmail(json.data.email || "");

        const pRes = await fetchApi(`/users/${json.data.username}`);
        const pJson = await pRes.json();
        if (pJson.success && pJson.data.profile) {
          const p = pJson.data.profile;
          setProfileData({
            displayName: p.displayName || "",
            bio: p.bio || "",
            location: p.location || "",
            website: p.website || "",
            avatarUrl: p.avatarUrl || "",
            coverUrl: p.coverUrl || "",
            isPrivate: p.isPrivate || false,
            allowSearchEngineIndexing: p.allowSearchEngineIndexing ?? true,
            messagePreference: p.messagePreference || "ANYONE",
            mentionPreference: p.mentionPreference || "ANYONE",
            defaultPostVisibility: p.defaultPostVisibility || "PUBLIC",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `?tab=${tabId}`);
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const allItems = navGroups.flatMap((g) => g.items);
  const currentItem = allItems.find((item) => item.id === activeTab) || allItems[0];

  return (
    <div className="min-h-screen bg-slate-50/60 pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ayarlar
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            Hesabınızı özelleştirin, gizlilik tercihlerinizi ve portföyünüzü yönetin.
          </p>
        </div>

        {/* MOBILE HORIZONTAL TABS */}
        <div className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-slate-200/80 pb-3">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN SETTINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* DESKTOP SIDEBAR NAV */}
          <aside className="hidden md:block md:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-xs sticky top-24">
            <nav className="space-y-4" aria-label="Ayarlar Gezintisi">
              {navGroups.map((group, gIdx) => (
                <div key={group.title} className={gIdx > 0 ? "pt-2 border-t border-slate-100" : ""}>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </div>
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTabChange(item.id)}
                          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl font-bold transition-all text-left group ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-xl transition-colors ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-semibold truncate">{item.label}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isActive
                                ? "text-white/80 translate-x-0.5"
                                : "text-slate-300 group-hover:text-slate-500"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <main className="md:col-span-8 w-full">
            {/* Global Notification Banner */}
            <AnimatePresence>
              {msg.text && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border shadow-xs ${
                    msg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {msg.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{msg.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB CONTENT WITH TRANSITIONS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "profile" && (
                  <SettingsProfile
                    profileData={profileData}
                    setProfileData={setProfileData}
                    showMsg={showMsg}
                    loadProfile={loadProfile}
                  />
                )}
                {activeTab === "account" && (
                  <SettingsAccount email={email} showMsg={showMsg} />
                )}
                {activeTab === "privacy" && (
                  <SettingsPrivacy
                    profileData={profileData}
                    setProfileData={setProfileData}
                    showMsg={showMsg}
                  />
                )}
                {activeTab === "notifications" && (
                  <SettingsNotifications showMsg={showMsg} />
                )}
                {activeTab === "appearance" && (
                  <SettingsAppearance showMsg={showMsg} />
                )}
                {activeTab === "security" && (
                  <SettingsSecurity showMsg={showMsg} />
                )}
                {activeTab === "projects" && <SettingsProjects />}
                {activeTab === "verification" && <SettingsVerification />}
                {activeTab === "invites" && <SettingsInvites />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
