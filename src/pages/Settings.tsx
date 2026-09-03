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
  const authUser = useAuthStore((state) => state.user);
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
  const [username, setUsername] = useState(() => authUser?.username || "");
  const [email, setEmail] = useState(() => authUser?.email || "");
  const [profileData, setProfileData] = useState<any>(() => ({
    displayName: authUser?.displayName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    website: authUser?.website || "",
    avatarUrl: authUser?.avatarUrl || "",
    coverUrl: authUser?.coverUrl || "",
    isPrivate: false,
    allowSearchEngineIndexing: true,
    messagePreference: "ANYONE",
    mentionPreference: "ANYONE",
    defaultPostVisibility: "PUBLIC",
  }));
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
      if (json.success && json.data) {
        const u = json.data;
        setEmail(u.email || "");
        setUsername(u.username || "");

        let currentProfile: any = {
          displayName: u.displayName || "",
          bio: u.bio || "",
          location: u.location || "",
          website: u.website || "",
          avatarUrl: u.avatarUrl || "",
          coverUrl: u.coverUrl || "",
          isPrivate: u.isPrivate ?? false,
          allowSearchEngineIndexing: u.allowSearchEngineIndexing ?? true,
          messagePreference: u.messagePreference || "ANYONE",
          mentionPreference: u.mentionPreference || "ANYONE",
          defaultPostVisibility: u.defaultPostVisibility || "PUBLIC",
        };

        if (u.username) {
          try {
            const pRes = await fetchApi(`/users/${u.username}`);
            const pJson = await pRes.json();
            if (pJson.success && pJson.data) {
              const p = pJson.data.profile || pJson.data;
              currentProfile = {
                displayName: (p.displayName !== undefined && p.displayName !== null) ? p.displayName : currentProfile.displayName,
                bio: (p.bio !== undefined && p.bio !== null) ? p.bio : currentProfile.bio,
                location: (p.location !== undefined && p.location !== null) ? p.location : currentProfile.location,
                website: (p.website !== undefined && p.website !== null) ? p.website : currentProfile.website,
                avatarUrl: (p.avatarUrl !== undefined && p.avatarUrl !== null) ? p.avatarUrl : currentProfile.avatarUrl,
                coverUrl: (p.coverUrl !== undefined && p.coverUrl !== null) ? p.coverUrl : currentProfile.coverUrl,
                isPrivate: (p.isPrivate !== undefined && p.isPrivate !== null) ? p.isPrivate : currentProfile.isPrivate,
                allowSearchEngineIndexing: (p.allowSearchEngineIndexing !== undefined && p.allowSearchEngineIndexing !== null) ? p.allowSearchEngineIndexing : currentProfile.allowSearchEngineIndexing,
                messagePreference: p.messagePreference || currentProfile.messagePreference,
                mentionPreference: p.mentionPreference || currentProfile.mentionPreference,
                defaultPostVisibility: p.defaultPostVisibility || currentProfile.defaultPostVisibility,
              };
            }
          } catch (err) {
            console.warn("User details fetch warning:", err);
          }
        }

        setProfileData(currentProfile);

        const currentAuthUser = useAuthStore.getState().user;
        if (currentAuthUser) {
          useAuthStore.getState().setUser({
            ...currentAuthUser,
            displayName: currentProfile.displayName || currentAuthUser.displayName,
            avatarUrl: currentProfile.avatarUrl || currentAuthUser.avatarUrl,
            bio: currentProfile.bio,
            location: currentProfile.location,
            website: currentProfile.website,
            coverUrl: currentProfile.coverUrl,
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
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-white" />
      </div>
    );
  }

  const allItems = navGroups.flatMap((g) => g.items);
  const currentItem = allItems.find((item) => item.id === activeTab) || allItems[0];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pt-20 pb-24 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Ayarlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base mt-1">
            Hesabınızı özelleştirin, gizlilik tercihlerinizi ve portföyünüzü yönetin.
          </p>
        </div>

        {/* MOBILE HORIZONTAL TABS */}
        <div className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
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
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
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
          <aside className="hidden md:block md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3.5 shadow-xs sticky top-24 transition-colors">
            <nav className="space-y-4" aria-label="Ayarlar Gezintisi">
              {navGroups.map((group, gIdx) => (
                <div key={group.title} className={gIdx > 0 ? "pt-2 border-t border-slate-100 dark:border-slate-800" : ""}>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                              ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs shadow-slate-500/20"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-xl transition-colors ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-semibold truncate">{item.label}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isActive
                                ? "text-white/80 translate-x-0.5"
                                : "text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400"
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
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {msg.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
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
                    username={username}
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
