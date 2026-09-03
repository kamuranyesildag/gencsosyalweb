import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Shield, 
  Smartphone, 
  LogOut, 
  Lock, 
  Monitor, 
  Save, 
  Clock, 
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { confirmDialog } from "../ui/ConfirmDialog";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Skeleton } from "../ui/Skeleton";
import { useAuthStore } from "../../context/useAuth";

interface SettingsSecurityProps {
  showMsg: (text: string, type?: "success" | "error") => void;
}

export function SettingsSecurity({ showMsg }: SettingsSecurityProps) {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Session state
  const [revokingId, setRevokingId] = useState<number | null>(null);

  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupSecret, setSetupSecret] = useState("");
  const [setupQrUrl, setSetupQrUrl] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  
  // 2FA Disable states
  const [disableMode, setDisableMode] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  useEffect(() => {
    loadSessions();
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const res = await fetchApi("/auth/me");
      const json = await res.json();
      if (json.success && json.data.twoFactorEnabled !== undefined) {
        setIs2FAEnabled(json.data.twoFactorEnabled);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart2FASetup = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/auth/2fa/setup", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSetupSecret(json.data.secret);
        setSetupQrUrl(json.data.otpauthUrl);
        setSetupMode(true);
      } else {
        showMsg(json.error?.message || "2FA kurulumu başlatılamadı.", "error");
      }
    } catch (e: any) {
      showMsg(e.message || "Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupCode.length !== 6) {
      return showMsg("Lütfen 6 haneli kodu girin.", "error");
    }
    setLoading(true);
    try {
      const res = await fetchApi("/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode })
      });
      const json = await res.json();
      if (json.success) {
        setIs2FAEnabled(true);
        setSetupMode(false);
        setSetupCode("");
        setRecoveryCodes(json.data.recoveryCodes);
        showMsg("İki faktörlü doğrulama başarıyla etkinleştirildi.");
      } else {
        showMsg(json.error?.message || "Kod doğrulanamadı.", "error");
      }
    } catch (e: any) {
      showMsg(e.message || "Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword || disableCode.length !== 6) {
      return showMsg("Lütfen mevcut şifrenizi ve 6 haneli doğrulama kodunu girin.", "error");
    }
    setLoading(true);
    try {
      const res = await fetchApi("/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword, code: disableCode })
      });
      const json = await res.json();
      if (json.success) {
        setIs2FAEnabled(false);
        setDisableMode(false);
        setDisablePassword("");
        setDisableCode("");
        showMsg("İki faktörlü doğrulama devre dışı bırakıldı.");
      } else {
        showMsg(json.error?.message || "İşlem başarısız.", "error");
      }
    } catch (e: any) {
      showMsg(e.message || "Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetchApi("/auth/sessions");
      const json = await res.json();
      if (json.data) setSessions(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return showMsg("Lütfen mevcut ve yeni şifrenizi girin.", "error");
    }
    if (newPassword !== confirmPassword) {
      return showMsg("Yeni şifreler eşleşmiyor.", "error");
    }
    if (newPassword.length < 6) {
      return showMsg("Yeni şifre en az 6 karakter olmalıdır.", "error");
    }

    setLoading(true);
    try {
      const res = await fetchApi("/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg("Şifreniz başarıyla güncellendi.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMsg(json.error?.message || "Şifre güncellenemedi.", "error");
      }
    } catch (e: any) {
      showMsg(e.message || "Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (id: number) => {
    const confirmed = await confirmDialog(
      "Oturumu Sonlandır",
      "Bu oturumu kapatmak istediğinize emin misiniz? Bu cihazdaki giriş geçersiz kılınacaktır."
    );
    if (!confirmed) return;
    setRevokingId(id);
    try {
      await fetchApi(`/auth/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showMsg("Oturum başarıyla sonlandırıldı.");
    } catch (e: any) {
      showMsg(e.message || "Oturum kapatılamadı.", "error");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    const confirmed = await confirmDialog(
      "Diğer Tüm Oturumları Kapat",
      "Bu cihaz haricindeki diğer tüm oturumları kapatmak istediğinize emin misiniz?"
    );
    if (!confirmed) return;
    try {
      await fetchApi(`/auth/sessions/others`, { method: "DELETE" });
      await loadSessions();
      showMsg("Diğer tüm oturumlar başarıyla sonlandırıldı.");
    } catch (e: any) {
      showMsg(e.message || "Oturumlar kapatılamadı.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Şifre Değiştirme Kartı */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            Şifre Değiştir
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Hesap güvenliğinizi korumak için güçlü ve benzersiz bir şifre kullanın.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Mevcut Şifre
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Yeni Şifre
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrar yazın"
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
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
              Şifreyi Güncelle
            </Button>
          </div>
        </div>
      </form>

      {/* 2. İki Faktörlü Doğrulama (2FA) */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${is2FAEnabled ? "text-emerald-500" : "text-slate-400"}`} />
              İki Faktörlü Doğrulama (2FA)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Hesabınıza ek bir güvenlik katmanı ekleyin. Giriş yaparken bir doğrulama kodu istenir.
            </p>
          </div>
          <div>
            {is2FAEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                Aktif
              </span>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleStart2FASetup}
                isLoading={loading && !setupMode}
                className="rounded-full font-bold"
              >
                2FA'yı Etkinleştir
              </Button>
            )}
          </div>
        </div>

        {/* 2FA Etkinleştirme Modal / Alanı */}
        {setupMode && !is2FAEnabled && (
          <form onSubmit={handleEnable2FA} className="bg-slate-50/50 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Authenticator Uygulamasını İndirin</p>
                <p className="text-xs text-slate-500 mt-0.5">Google Authenticator, Microsoft Authenticator veya Authy kullanabilirsiniz.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0 font-bold">2</div>
              <div className="w-full">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">QR Kodu Taratın</p>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  {setupQrUrl && (
                    <div className="p-2 bg-white dark:bg-slate-950 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 shrink-0">
                      <QRCodeSVG value={setupQrUrl} size={140} level="M" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <p className="text-xs text-slate-500 font-medium">QR kodu tarayamıyorsanız şu anahtarı manuel olarak girebilirsiniz:</p>
                    <code className="block bg-slate-100 text-slate-800 dark:text-slate-100 text-sm font-mono p-2.5 rounded-lg break-all select-all font-medium border border-slate-200 dark:border-slate-800">
                      {setupSecret}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0 font-bold">3</div>
              <div className="w-full">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Doğrulama Kodunu Girin</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-center text-lg tracking-widest font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-300"
                  />
                  <Button type="submit" variant="primary" size="md" isLoading={loading} className="rounded-xl font-bold">
                    Doğrula & Etkinleştir
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
               <button type="button" onClick={() => setSetupMode(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">İptal Et</button>
            </div>
          </form>
        )}

        {/* Kurtarma Kodları Gösterimi (Sadece etkinleştirildikten hemen sonra) */}
        {recoveryCodes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">Kurtarma Kodlarınızı Kaydedin</h3>
                <p className="text-xs text-amber-700/90 font-medium mt-1">
                  Cihazınızı kaybetmeniz durumunda hesabınıza erişebilmek için bu kodları güvenli bir yerde saklayın. Bu kodlar bir daha gösterilmeyecektir.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-950/80 border border-amber-200 text-amber-900 font-mono text-sm px-3 py-2 rounded-lg text-center tracking-widest font-bold">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-2 gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setRecoveryCodes([])} className="rounded-xl font-bold border-amber-200 text-amber-700 hover:bg-amber-100">
                Kaydettim, Kapat
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={copyRecoveryCodes} leftIcon={copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                {copiedCodes ? "Kopyalandı" : "Tümünü Kopyala"}
              </Button>
            </div>
          </div>
        )}

        {/* 2FA Devre Dışı Bırakma */}
        {is2FAEnabled && !disableMode && recoveryCodes.length === 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDisableMode(true)}
              className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-2"
            >
              İki Faktörlü Doğrulamayı Kapat
            </button>
          </div>
        )}

        {is2FAEnabled && disableMode && (
           <form onSubmit={handleDisable2FA} className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-5 space-y-4">
             <h3 className="text-sm font-bold text-rose-900">2FA'yı Devre Dışı Bırak</h3>
             <p className="text-xs text-rose-700/80">Devre dışı bırakmak için mevcut şifrenizi ve doğrulama kodunu girin.</p>
             
             <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="block text-xs font-bold uppercase tracking-wider text-rose-800">Şifreniz</label>
                 <input
                   type="password"
                   required
                   value={disablePassword}
                   onChange={(e) => setDisablePassword(e.target.value)}
                   className="w-full bg-white dark:bg-slate-950 border border-rose-200 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                   placeholder="••••••••"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="block text-xs font-bold uppercase tracking-wider text-rose-800">Authenticator Kodu</label>
                 <input
                   type="text"
                   required
                   maxLength={6}
                   value={disableCode}
                   onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                   className="w-full bg-white dark:bg-slate-950 border border-rose-200 rounded-xl px-4 py-2 text-center text-lg tracking-widest font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                   placeholder="000000"
                 />
               </div>
             </div>

             <div className="flex gap-3 justify-end pt-2">
               <Button type="button" variant="ghost" size="sm" onClick={() => setDisableMode(false)} className="rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700">
                 İptal
               </Button>
               <Button type="submit" variant="danger" size="sm" isLoading={loading} className="rounded-xl font-bold">
                 Devre Dışı Bırak
               </Button>
             </div>
           </form>
        )}
      </div>

      {/* 3. Giriş Yapılan Cihazlar & Oturumlar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-900 dark:text-slate-100" />
              Aktif Oturumlar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Hesabınıza şu anda bağlı olan cihazları görüntüleyin ve yönetin.
            </p>
          </div>

          {sessions.length > 1 && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRevokeOthers}
              className="rounded-full font-bold text-xs shrink-0"
            >
              Diğer Tümünü Kapat
            </Button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {sessionsLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Aktif oturum bilgisi bulunamadı.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    {s.os === "Android" || s.os === "iOS" ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Monitor className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                      <span>
                        {s.browser || "Tarayıcı"} • {s.os || "İşletim Sistemi"}
                      </span>
                      {s.isCurrent && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">
                          Bu Cihaz
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                      {s.ipAddress ? `IP: ${s.ipAddress} · ` : ""}
                      Son aktif:{" "}
                      {s.lastActiveAt
                        ? formatDistanceToNow(new Date(s.lastActiveAt), {
                            addSuffix: true,
                            locale: tr,
                          })
                        : "Bilinmiyor"}
                    </div>
                  </div>
                </div>

                {!s.isCurrent && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    isLoading={revokingId === s.id}
                    onClick={() => handleRevokeSession(s.id)}
                    leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
                    className="rounded-full text-rose-600 hover:bg-rose-50 font-bold text-xs shrink-0"
                  >
                    Kapat
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
