import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { useSEO } from '../hooks/useSEO';

export function Login() {
  useSEO({
    allowIndexing: false,
    title: "Giriş Yap | Genç Sosyal",
    description: "Genç Sosyal hesabınıza güvenle giriş yapın ve üretimlerinize kaldığınız yerden devam edin.",
    canonicalPath: "/login"
  });

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Credentials, 2: 2FA TOTP, 3: Recovery Code
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA state
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [recoveryCode, setRecoveryCode] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isFromRegister = location.state?.fromRegister;
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  const handleFetchMe = async (token: string) => {
    const meRes = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();

    if (meRes.ok && meData.success) {
      useAuthStore.getState().setAuth(meData.data, token);
      if (isFromRegister || !meData.data.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } else {
      throw new Error('Kullanıcı bilgileri doğrulanamadı.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError('Lütfen e-posta/kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.code === "ACCOUNT_SUSPENDED") {
          const { setSuspension } = useAuthStore.getState();
          setSuspension(data.error.suspension || {
            userId: 0,
            username: cleanId,
            isPermanent: true,
            banReason: data.error.message || "Topluluk kurallarının ihlali"
          });
          navigate("/account-suspended", { replace: true });
          return;
        }
        throw new Error(data?.error?.message || 'Bilgiler eşleşmedi. E-posta/kullanıcı adı ve şifreni kontrol et.');
      }

      if (data.data.requiresTwoFactor) {
        setTwoFactorToken(data.data.twoFactorToken);
        setStep(2);
        setLoading(false);
        return;
      }

      setAccessToken(data.data.accessToken);
      await handleFetchMe(data.data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir sorun oluştu.');
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    const code = step === 2 ? otpDigits.join('') : undefined;
    const rCode = step === 3 ? recoveryCode.trim() : undefined;

    if (step === 2 && code?.length !== 6) {
      return setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
    }
    if (step === 3 && !rCode) {
      return setError('Lütfen kurtarma kodunuzu girin.');
    }

    setError('');
    setLoading(true);
    try {
      const payload: any = { token: twoFactorToken };
      if (step === 2) payload.code = code;
      if (step === 3) payload.recoveryCode = rCode;

      const res = await fetch('/api/v1/auth/login/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'İki faktörlü doğrulama kodu doğrulanamadı.');
      }

      setAccessToken(data.data.accessToken);
      await handleFetchMe(data.data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Doğrulama işlemi başarısız.');
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    setError('');

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    if (next.every(d => d !== '') && next.length === 6) {
      setTimeout(() => handle2FASubmit(), 50);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteDigits = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      const split = paste.split('');
      setOtpDigits(split);
      otpInputRefs.current[5]?.focus();
      setTimeout(() => handle2FASubmit(), 50);
    }
  };

  return (
    <div className="w-full">
      {/* 2FA Flow */}
      {step > 1 ? (
        <div className="space-y-6">
          <div className="text-left">
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Girişe geri dön</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 2 ? "İki Faktörlü Doğrulama" : "Kurtarma Kodu"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {step === 2 
                ? "Kimlik doğrulama uygulamanızdaki 6 haneli güvenlik kodunu girin."
                : "Daha önce kaydettiğiniz acil durum kurtarma kodunu girin."}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="flex justify-between gap-2" onPaste={handlePasteDigits}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handle2FASubmit()}
                disabled={loading || otpDigits.some(d => !d)}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Doğrula ve Giriş Yap"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(3); setError(''); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Doğrulama koduna erişemiyor musun? Kurtarma kodu kullan
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Kurtarma Kodu
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => { setRecoveryCode(e.target.value); setError(''); }}
                  placeholder="Örn: 8X4B-91ZA"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !recoveryCode.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kurtarma Kodu ile Giriş"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(2); setError(''); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Geri dön: 6 haneli TOTP kodunu kullan
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Standard Login Form */
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Tekrar hoş geldin
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Genç Sosyal'deki üretimlerine kaldığın yerden devam et.
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

          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* E-posta veya Kullanıcı Adı */}
            <div>
              <label 
                htmlFor="login-identifier" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                E-posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }}
                  placeholder="ornek@gencsosyal.com veya kullaniciadi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Şifre
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Şifreni mi unuttun?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
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

            {/* Primary Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !identifier.trim() || !password}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Henüz bir hesabın yok mu?{' '}
              <Link 
                to="/register" 
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
