import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff, Hexagon } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4 sm:px-6">
        <Card className="w-full max-w-md p-8 text-center bg-white rounded-3xl border-slate-200/80 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Geçersiz Bağlantı</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeniden talepte bulunun.
          </p>
          <Link to="/forgot-password">
            <Button variant="primary" size="md" fullWidth>
              Yeniden Bağlantı İste
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setStatus('error');
      setMessage('Şifre en az bir küçük harf içermelidir.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setStatus('error');
      setMessage('Şifre en az bir büyük harf içermelidir.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setStatus('error');
      setMessage('Şifre en az bir rakam içermelidir.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        data: { token, newPassword: password },
      });
      const json = await res.json();

      if (json.success) {
        setStatus('success');
        setMessage(json.data.message || 'Şifreniz başarıyla güncellendi.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setStatus('error');
        setMessage(json.error?.message || 'Şifre sıfırlama işlemi tamamlanamadı.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
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
        <Card className="p-7 sm:p-10 shadow-xl border-slate-200/80 rounded-3xl bg-white">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-500/25 mb-4">
              <Hexagon className="w-7 h-7 fill-current" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Yeni Şifre Belirle
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Hesabınız için güçlü ve güvenli yeni bir şifre girin.
            </p>
          </div>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Şifreniz Değiştirildi</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {message} Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5"
                  role="alert"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span className="flex-1 leading-snug">{message}</span>
                </motion.div>
              )}

              <div className="space-y-1.5 text-left">
                <label htmlFor="reset-new-password" className="text-xs sm:text-sm font-semibold text-slate-700">
                  Yeni Şifre
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="reset-confirm-password" className="text-xs sm:text-sm font-semibold text-slate-700">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="••••••••"
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
                  loadingText="Şifre Güncelleniyor..."
                  disabled={!password || !confirmPassword}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Şifreyi Kaydet
                </Button>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
