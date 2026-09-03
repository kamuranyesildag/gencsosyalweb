import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Hexagon, Mail, ArrowRight, ArrowLeft, MailCheck, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'İşlem başarısız oldu.');
      }

      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Şifre sıfırlama talebi iletilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="p-7 sm:p-10 shadow-xl border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-slate-950">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-500/25 mb-4">
              <Hexagon className="w-7 h-7 fill-current" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Şifremi Unuttum
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <MailCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">E-posta Gönderildi</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="primary" size="lg" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Giriş Sayfasına Dön
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5"
                  role="alert"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span className="flex-1 leading-snug">{error}</span>
                </motion.div>
              )}

              <div className="space-y-1.5 text-left">
                <label htmlFor="forgot-email" className="text-xs sm:text-sm font-semibold text-slate-700">
                  E-posta Adresi
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800/90 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="ornek@genc.org"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  loadingText="Gönderiliyor..."
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sıfırlama Bağlantısı Gönder
                </Button>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
