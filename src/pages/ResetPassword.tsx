import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export function ResetPassword() {
  useSEO({
    allowIndexing: false,
    title: "Şifre Sıfırlama | Genç Sosyal",
    description: "Hesabınız için yeni bir şifre belirleyin.",
    canonicalPath: "/reset-password"
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userIdStr = searchParams.get('id');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Geçersiz Bağlantı
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Şifre sıfırlama bağlantısı eksik veya süresi dolmuş olabilir. Lütfen yeni bir bağlantı talep edin.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/forgot-password"
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Yeniden Bağlantı İste</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setStatus('error');
      setMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
          userId: userIdStr ? parseInt(userIdStr, 10) : undefined
        }),
      });
      const json = await res.json();

      if (json.success) {
        setStatus('success');
        setMessage(json.data?.message || 'Şifreniz başarıyla güncellendi.');
      } else {
        setStatus('error');
        setMessage(json.error?.message || 'Şifre sıfırlama işlemi tamamlanamadı. Bağlantının süresi dolmuş olabilir.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Şifren Güncellendi
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Yeni şifren başarıyla kaydedildi. Artık hesabına güvenle giriş yapabilirsin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Yeni şifreni belirle
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Hesabın için güçlü ve güvenli yeni bir şifre oluştur.
            </p>
          </div>

          {status === 'error' && message && (
            <div 
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label 
                htmlFor="reset-password" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Yeni Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="En az 8 karakter"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label 
                htmlFor="reset-confirm-password" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Yeni Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="Şifrenizi tekrar yazın"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <span>Şifremi Güncelle</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] text-center">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
