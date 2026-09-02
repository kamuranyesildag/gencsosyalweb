import React, { useState } from "react";
import { 
  Mail, 
  Trash2, 
  LogOut, 
  Lock, 
  AlertTriangle, 
  ShieldAlert,
  Save,
  Check
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";
import { confirmDialog } from "../ui/ConfirmDialog";
import { Button } from "../ui/Button";

interface SettingsAccountProps {
  showMsg: (text: string, type?: "success" | "error") => void;
  email: string;
}

export function SettingsAccount({ showMsg, email: initialEmail }: SettingsAccountProps) {
  const { logout } = useAuthStore();
  const [email, setEmail] = useState(initialEmail || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return showMsg("E-posta adresinizi güncellemek için lütfen mevcut şifrenizi girin.", "error");
    }
    setLoading(true);
    try {
      const res = await fetchApi("/users/me/email", {
        method: "PUT",
        data: { email, password: currentPassword },
      });
      const json = await res.json();
      if (json.success) {
        showMsg("E-posta adresiniz başarıyla güncellendi.");
        setCurrentPassword("");
      } else {
        showMsg(json.error?.message || "E-posta güncellenemedi.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return showMsg("Hesabınızı silmek için şifrenizi girmelisiniz.", "error");
    }
    const confirmed = await confirmDialog(
      "Hesabı Kalıcı Olarak Sil",
      "Hesabınızı silmek istediğinize emin misiniz? Tüm projeleriniz, gönderileriniz ve verileriniz kalıcı olarak kaldırılacaktır. Bu işlem geri alınamaz."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetchApi("/users/me/delete", {
        method: "POST",
        data: { password: deletePassword },
      });
      const json = await res.json();
      if (json.success) {
        logout();
      } else {
        showMsg(json.error?.message || "Hesap silinemedi.", "error");
      }
    } catch (e) {
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog(
      "Oturumu Kapat",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
    );
    if (confirmed) {
      logout();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. E-posta & İletişim Kartı */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-900" />
            İletişim Bilgileri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Giriş yapmak ve sistem bildirimleri almak için kullandığınız e-posta adresini yönetin.
          </p>
        </div>

        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              E-posta Adresi
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@gencsosyal.org"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Mevcut Şifreniz (Güvenlik Doğrulaması)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
            />
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
              E-postayı Güncelle
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Oturum Yönetimi Kartı */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Oturumu Sonlandır</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Bu cihazdaki mevcut aktif oturumunuzdan güvenle çıkış yapın.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-slate-600" />}
          className="rounded-2xl font-bold shrink-0 w-full sm:w-auto"
        >
          Çıkış Yap
        </Button>
      </div>

      {/* 3. Tehlikeli Bölge - Hesap Silme Kartı */}
      <div className="bg-rose-50/50 border border-rose-200/70 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-rose-700">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950">Hesabı Kalıcı Olarak Sil</h3>
            <p className="text-xs text-rose-800 font-medium mt-0.5">
              Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir.
            </p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-rose-900">
            Onaylamak İçin Şifrenizi Girin
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Mevcut şifreniz"
            className="w-full bg-white border border-rose-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            size="md"
            isLoading={deleting}
            disabled={!deletePassword}
            onClick={handleDeleteAccount}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="rounded-2xl font-bold w-full sm:w-auto shadow-xs shadow-rose-500/20"
          >
            Hesabımı Kalıcı Olarak Sil
          </Button>
        </div>
      </div>
    </div>
  );
}
