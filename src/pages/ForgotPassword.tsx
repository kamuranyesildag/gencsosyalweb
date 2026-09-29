import React, { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowRight, ArrowLeft, MailCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export function ForgotPassword() {
  useSEO({
    allowIndexing: false,
    title: "Şifremi Unuttum | Genç Sosyal",
    description: "Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.",
    canonicalPath: "/forgot-password"
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'İşlem gerçekleştirilemedi.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama talebi iletilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {success ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <MailCheck className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Talimatlar Gönderildi
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Bu e-posta adresiyle (<strong className="text-slate-900 dark:text-white">{email}</strong>) ilişkili bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Giriş Yapmaya Dön</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Şifreni mi unuttun?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              E-posta adresini gir. Hesabına yeniden erişmen için gereken adımları gönderelim.
            </p>
          </div>

          {error && (
            <div 
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label 
                htmlFor="forgot-email" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Kayıtlı E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="ornek@gencsosyal.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Şifre Sıfırlama Bağlantısı Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Giriş yapmaya dön</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
