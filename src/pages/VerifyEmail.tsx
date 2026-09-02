import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Hexagon, ArrowRight, Loader2 } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz doğrulama bağlantısı.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetchApi('/auth/verify-email', {
          method: 'POST',
          data: { token },
        });
        const json = await res.json();

        if (json.success) {
          setStatus('success');
          setMessage(json.data.message || 'E-posta adresiniz başarıyla doğrulandı.');
        } else {
          setStatus('error');
          setMessage(json.error?.message || 'E-posta doğrulama başarısız oldu.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="p-7 sm:p-10 shadow-xl border-slate-200/80 rounded-3xl bg-white text-center">
          {/* Header Brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-500/25 mb-4">
              <Hexagon className="w-7 h-7 fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              E-posta Doğrulama
            </h1>
          </div>

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Hesabınız doğrulanıyor, lütfen bekleyin...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Doğrulama Başarılı!</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {message}
              </p>
              <Link to="/login" className="w-full">
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Doğrulama Başarısız</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {message}
              </p>
              <Link to="/login" className="w-full">
                <Button variant="secondary" size="lg" fullWidth>
                  Giriş Ekranına Dön
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
