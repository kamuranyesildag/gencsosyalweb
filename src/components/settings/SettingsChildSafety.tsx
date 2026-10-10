import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Clock, 
  Moon, 
  Key, 
  Send, 
  FileText, 
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../../context/useAuth";

interface SettingsChildSafetyProps {
  showMsg: (text: string, type?: "success" | "error") => void;
}

export function SettingsChildSafety({ showMsg }: SettingsChildSafetyProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [safetyData, setSafetyData] = useState<any>(null);

  // Parental Control Form
  const [parentEmail, setParentEmail] = useState("");
  const [dailyScreenTime, setDailyScreenTime] = useState(120);
  const [pairingCodeInput, setPairingCodeInput] = useState("");
  const [parentalLoading, setParentalLoading] = useState(false);

  // Appeal Form
  const [appealReason, setAppealReason] = useState("");
  const [appealBirthDate, setAppealBirthDate] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  useEffect(() => {
    loadSafetyStatus();
  }, []);

  const loadSafetyStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("gencsosyal_token");
      const res = await fetch("/api/v1/child-safety/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSafetyData(json.data);
        if (json.data?.parentalControl?.dailyScreenTimeMinutes) {
          setDailyScreenTime(json.data.parentalControl.dailyScreenTimeMinutes);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestParental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail || !parentEmail.includes("@")) {
      showMsg("Lütfen geçerli bir veli e-posta adresi girin.", "error");
      return;
    }
    setParentalLoading(true);
    try {
      const token = localStorage.getItem("gencsosyal_token");
      const res = await fetch("/api/v1/child-safety/parental-control/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
          dailyScreenTimeMinutes: dailyScreenTime
        })
      });
      const json = await res.json();
      if (json.success) {
        showMsg(json.data.message || "Veli eşleştirme talebi oluşturuldu.");
        await loadSafetyStatus();
      } else {
        showMsg(json.error?.message || "Talep oluşturulamadı.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setParentalLoading(false);
    }
  };

  const handleVerifyParental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCodeInput.trim()) {
      showMsg("Lütfen eşleştirme kodunu girin.", "error");
      return;
    }
    setParentalLoading(true);
    try {
      const token = localStorage.getItem("gencsosyal_token");
      const res = await fetch("/api/v1/child-safety/parental-control/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pairingCode: pairingCodeInput.trim().toUpperCase(),
          dailyScreenTimeMinutes: dailyScreenTime
        })
      });
      const json = await res.json();
      if (json.success) {
        showMsg("Ebeveyn kontrolü başarıyla etkinleştirildi!");
        setPairingCodeInput("");
        await loadSafetyStatus();
      } else {
        showMsg(json.error?.message || "Eşleştirme kodu doğrulanamadı.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setParentalLoading(false);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (appealReason.trim().length < 15) {
      showMsg("İtiraz gerekçeniz en az 15 karakter olmalıdır.", "error");
      return;
    }
    setAppealLoading(true);
    try {
      const token = localStorage.getItem("gencsosyal_token");
      const res = await fetch("/api/v1/child-safety/appeal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: appealReason.trim(),
          declaredBirthDate: appealBirthDate || undefined
        })
      });
      const json = await res.json();
      if (json.success) {
        showMsg("İtirazınız insan moderatör incelemesine iletildi.");
        setAppealSubmitted(true);
        setAppealReason("");
      } else {
        showMsg(json.error?.message || "İtiraz kaydedilemedi.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setAppealLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs text-slate-500">Mevzuat ve güvenlik bilgileri yükleniyor...</p>
      </div>
    );
  }

  const isMinor = safetyData?.isMinor;
  const status = safetyData?.ageVerificationStatus || "UNVERIFIED";

  return (
    <div className="space-y-6">
      {/* 1. Mevzuat & Yaş Durumu Kartı */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Sosyal Ağ Çocuk Güvenliği & Yaş Doğrulama
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              10 Ekim 2026 Resmî Yönetmeliği kapsamında ayrıştırılmış hizmet ve çocuk koruma standartları.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              status === "VERIFIED_CHILD"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                : status === "VERIFIED_ADULT"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {status === "VERIFIED_CHILD" ? "15-18 Genç Hesabı" : status === "VERIFIED_ADULT" ? "18+ Yetişkin Hesabı" : "Doğrulanmamış"}
            </span>
          </div>
        </div>

        {/* Ayrıştırılmış Hizmet Korumaları Özeti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Varsayılan Gizli Profil</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isMinor 
                ? "Çocuk kullanıcıların profilleri mevzuat gereği varsayılan olarak gizlidir ve harici arama motorlarına kapalıdır."
                : "Yetişkin kullanıcılar için isteğe bağlı gizlilik ayarları geçerlidir."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <EyeOff className="w-4 h-4 text-purple-600" />
              <span>Doğrudan Mesajlaşma Koruması</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              15-18 yaşındaki kullanıcılar yabancı yetişkinlerden doğrudan mesaj alamaz; yalnızca karşılıklı takipleşilen bağlantılarla sohbet edebilir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dijital Esenlik (22:00 - 06:00)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Gece saatlerinde uyku düzeni ve zihinsel sağlık için otomatik ekran molası bildirimleri aktiftir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Kriptografik Yaş Belirteci</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono truncate">
              {safetyData?.hasVerificationToken ? "GENC-AGE-V1.VERIFIED" : "Belirteç Oluşturulmadı"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Ebeveyn Kontrolleri (Parental Controls) */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Ebeveyn / Veli Eşleştirmesi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yönetmeliğin 8. Maddesi uyarınca ebeveynler çocuk hesaplarıyla eşleşerek ekran süresi ve güvenlik sınırlarını yönetebilir.
          </p>
        </div>

        {safetyData?.parentalControl?.status === "ACTIVE" ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ebeveyn Eşleşmesi Aktif</span>
            </div>
            <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
              <p>Bağlı Veli E-postası: <strong>{safetyData.parentalControl.parentEmailMasked}</strong></p>
              <p>Günlük Ekran Limiti: <strong>{safetyData.parentalControl.dailyScreenTimeMinutes} Dakika</strong></p>
              <p>Mesajlaşma Sınırı: <strong>Aktif (Sadece Karşılıklı Takip)</strong></p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {safetyData?.parentalControl?.status === "PENDING" && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <p className="font-bold">Eşleşme Onayı Bekleniyor</p>
                <p>Velinizle paylaşabileceğiniz eşleşme kodu oluşturulmuştur. Veliniz aşağıya bu kodu girerek onaylayabilir.</p>
              </div>
            )}

            <form onSubmit={handleRequestParental} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Veli E-posta Adresi
                  </label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="veli@ornek.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Günlük Ekran Süresi Limiti
                  </label>
                  <select
                    value={dailyScreenTime}
                    onChange={(e) => setDailyScreenTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={60}>60 Dakika (1 Saat)</option>
                    <option value={90}>90 Dakika (1.5 Saat)</option>
                    <option value={120}>120 Dakika (2 Saat - Önerilen)</option>
                    <option value={180}>180 Dakika (3 Saat)</option>
                    <option value={240}>240 Dakika (4 Saat)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={parentalLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {parentalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Eşleştirme Kodu Gönder</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleVerifyParental} className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Eşleştirme Kodunu Onayla (Veli Tarafı)
                  </label>
                  <input
                    type="text"
                    value={pairingCodeInput}
                    onChange={(e) => setPairingCodeInput(e.target.value)}
                    placeholder="Örn: GS-74921"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={parentalLoading || !pairingCodeInput}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kodu Onayla</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 3. İtiraz ve İnsan İncelemesi (Human Review Appeals) */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Yaş Tespiti ve Kısıtlama İtirazı
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yönetmeliğin 9. Maddesi uyarınca, yaş tespiti veya çocuk koruma kısıtlamalarına karşı yapılan itirazlar otomatik algoritmalar yerine yetkili insan moderatörler tarafından incelenir.
          </p>
        </div>

        {appealSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>İtirazınız kaydedildi. Uzman incelemesi tamamlandığında e-posta ve bildirim yoluyla bilgilendirileceksiniz.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitAppeal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Doğru Doğum Tarihiniz (Opsiyonel)
              </label>
              <input
                type="date"
                value={appealBirthDate}
                onChange={(e) => setAppealBirthDate(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                İtiraz Gerekçesi (En az 15 karakter)
              </label>
              <textarea
                required
                rows={3}
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Yaş bilginizin yanlış tespit edildiğini veya kısıtlamaların hatalı uygulandığını düşünüyorsanız ayrıntılarıyla belirtin..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <button
              type="submit"
              disabled={appealLoading || appealReason.trim().length < 15}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {appealLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>İtirazı İnsan İncelemesine Gönder</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
