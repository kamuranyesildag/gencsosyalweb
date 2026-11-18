import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  Shield,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { useSEO } from '../hooks/useSEO';
import { toast } from '../components/ui/Toast';

export function Login() {
  useSEO({
    allowIndexing: false,
    title: 'Giriş Yap | Genç Sosyal',
    description:
      'Genç Sosyal hesabınıza güvenle giriş yapın ve üretimlerinize kaldığınız yerden devam edin.',
    canonicalPath: '/login',
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleFetchMe = async (token: string, refreshToken?: string) => {
    const meRes = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();

    if (meRes.ok && meData.success) {
      useAuthStore.getState().setAuth(meData.data, token, refreshToken);
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
        body: JSON.stringify({ identifier: cleanId, password, rememberMe }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.code === 'ACCOUNT_SUSPENDED') {
          const { setSuspension } = useAuthStore.getState();
          setSuspension(
            data.error.suspension || {
              userId: 0,
              username: cleanId,
              isPermanent: true,
              banReason: data.error.message || 'Topluluk kurallarının ihlali',
            }
          );
          navigate('/account-suspended', { replace: true });
          return;
        }
        throw new Error(
          data?.error?.message ||
            'Bilgiler eşleşmedi. E-posta/kullanıcı adı ve şifreni kontrol et.'
        );
      }

      if (data.data.requiresTwoFactor) {
        setTwoFactorToken(data.data.twoFactorToken);
        setStep(2);
        setLoading(false);
        return;
      }

      setAccessToken(data.data.accessToken, data.data.refreshToken);
      await handleFetchMe(data.data.accessToken, data.data.refreshToken);
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
        throw new Error(
          data?.error?.message || 'İki faktörlü doğrulama kodu doğrulanamadı.'
        );
      }

      setAccessToken(data.data.accessToken, data.data.refreshToken);
      await handleFetchMe(data.data.accessToken, data.data.refreshToken);
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
    if (next.every((d) => d !== '') && next.length === 6) {
      setTimeout(() => handle2FASubmit(), 50);
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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
      {step > 1 ? (
        /* 2FA Flow */
        <div className="space-y-6">
          <div className="text-left">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Girişe geri dön</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 2 ? 'İki Faktörlü Doğrulama' : 'Kurtarma Kodu'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {step === 2
                ? 'Kimlik doğrulama uygulamanızdaki 6 haneli güvenlik kodunu girin.'
                : 'Daha önce kaydettiğiniz acil durum kurtarma kodunu girin.'}
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
              <div
                className="flex justify-between gap-2"
                onPaste={handlePasteDigits}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
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
                disabled={loading || otpDigits.some((d) => !d)}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Doğrula ve Giriş Yap'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(3);
                    setError('');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
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
                  onChange={(e) => {
                    setRecoveryCode(e.target.value);
                    setError('');
                  }}
                  placeholder="Örn: 8X4B-91ZA"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono transition-all text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !recoveryCode.trim()}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Kurtarma Kodu ile Giriş'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Geri dön: 6 haneli TOTP kodunu kullan
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Standard Login Screen Matching Mockup 1 */
        <div className="space-y-5">
          {/* Top Centered GS Logo with Lightning Badge & Welcome Header */}
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl tracking-tight shadow-lg shadow-blue-600/25">
                GS
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-center text-blue-600">
                <Zap className="w-3.5 h-3.5 fill-blue-600" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Tekrar hoş geldin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Türkiye&apos;nin gençler için geliştirilmiş yerli sosyal medya platformu{' '}
              <strong className="font-bold text-slate-800 dark:text-slate-200">
                Genç Sosyal
              </strong>
              &apos;e giriş yap.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* White Form Card (Mockup 1) */}
          <div className="bg-white dark:bg-[#0D121D] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* E-posta veya Kullanıcı Adı */}
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  E-posta veya kullanıcı adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="elif.yildiz@ogr.itu.edu.tr"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#080E1A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#0D121D] focus:border-blue-600 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#080E1A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#0D121D] focus:border-blue-600 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Beni hatırla & Şifremi unuttum */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Beni hatırla</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>

              {/* Primary Submit CTA */}
              <button
                type="submit"
                disabled={loading || !identifier.trim() || !password}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
            </form>

            {/* Divider: veya şununla devam et */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200/80 dark:border-white/[0.08]" />
              <span className="shrink mx-3 text-[11px] font-medium text-slate-400">
                veya şununla devam et
              </span>
              <div className="grow border-t border-slate-200/80 dark:border-white/[0.08]" />
            </div>

            {/* Social Buttons Row (Google & GitHub) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    'Kurumsal e-posta veya kullanıcı adınızla doğrudan giriş yapabilirsiniz.'
                  )
                }
                className="py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#080E1A] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-red-500 font-black text-sm">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    'GitHub hesabınızı giriş yaptıktan sonra Profil > Ayarlar bölümünden bağlayabilirsiniz.'
                  )
                }
                className="py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#080E1A] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Hesabın yok mu?{' '}
              <Link
                to="/register"
                className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Kayıt ol
              </Link>
            </p>
          </div>

          {/* Security Shield Notice Card (Mockup 1) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 fill-blue-600/20" />
            </div>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Hesabın ve verilerin güvende. Devam ederek{' '}
              <Link
                to="/terms"
                className="font-bold text-slate-800 dark:text-slate-200 underline hover:text-blue-600"
              >
                Kullanım Koşulları
              </Link>{' '}
              ve{' '}
              <Link
                to="/privacy"
                className="font-bold text-slate-800 dark:text-slate-200 underline hover:text-blue-600"
              >
                Gizlilik Politikası
              </Link>
              &apos;nı kabul etmiş olursun.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
