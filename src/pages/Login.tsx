import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function Login() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Login, 2: TOTP, 3: Recovery
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [recoveryCode, setRecoveryCode] = useState('');
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (meRes.ok) {
      useAuthStore.getState().setAuth(meData.data, token);
      if (isFromRegister) {
        navigate('/onboarding');
      } else {
        navigate('/home');
      }
    } else {
      throw new Error('Kullanıcı bilgileri alınamadı.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      return setError('Lütfen bilgilerinizi eksiksiz girin.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
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
    const code = step === 2 ? otpDigits.join('') : undefined;
    const rCode = step === 3 ? recoveryCode.trim() : undefined;

    if (step === 2 && code?.length !== 6) {
      return setError('Lütfen 6 haneli kodu eksiksiz girin.');
    }
    if (step === 3 && !rCode) {
      return setError('Lütfen kurtarma kodunu girin.');
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
        throw new Error(data?.error?.message || 'Doğrulama başarısız.');
      }

      setAccessToken(data.data.accessToken);
      await handleFetchMe(data.data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Doğrulama sırasında bir sorun oluştu.');
      setOtpDigits(['', '', '', '', '', '']);
      if (step === 2) otpInputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (error) setError('');
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      if (newOtp.every((d) => d !== '')) handle2FASubmit();
      return;
    }
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = cleaned;
    setOtpDigits(newOtp);
    if (cleaned && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (cleaned && index === 5 && newOtp.every((d) => d !== '')) {
      // Small timeout to allow state to update before submit
      setTimeout(() => handle2FASubmit(), 0);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
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
        <Card className="p-7 sm:p-10 shadow-xl border-slate-200/80 rounded-3xl bg-white overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                    <Hexagon className="w-7 h-7 fill-current" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Tekrar Hoş Geldiniz
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Genç Sosyal hesabınıza giriş yaparak devam edin.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span className="flex-1 leading-snug">{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="login-identifier" className="text-xs sm:text-sm font-semibold text-slate-700">Kullanıcı Adı veya E-posta</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                      <input id="login-identifier" type="text" required autoFocus autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }} className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" placeholder="ornek@genc.org veya @kullanici" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label htmlFor="login-password" className="text-xs sm:text-sm font-semibold text-slate-700">Şifre</label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Şifremi Unuttum?</Link>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                      <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }} className="w-full min-h-[44px] pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} loadingText="Giriş Yapılıyor..." rightIcon={<ArrowRight className="w-4 h-4" />}>Giriş Yap</Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500">
                    Henüz bir hesabınız yok mu? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Hemen Kaydolun</Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <button onClick={() => setStep(1)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">İki Faktörlü Doğrulama</h1>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Authenticator uygulamanızdaki 6 haneli kodu girin.
                  </p>
                </div>

                <form onSubmit={handle2FASubmit} className="space-y-6">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span className="flex-1 leading-snug">{error}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all outline-none ${
                          digit ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'
                        }`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} loadingText="Doğrulanıyor..." rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Doğrula
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <button type="button" onClick={() => { setError(''); setStep(3); }} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    Kurtarma kodu kullan
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <button onClick={() => setStep(2)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Kurtarma Kodu</h1>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Authenticator uygulamanıza erişemiyorsanız kurtarma kodlarınızdan birini girin.
                  </p>
                </div>

                <form onSubmit={handle2FASubmit} className="space-y-6">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span className="flex-1 leading-snug">{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={recoveryCode}
                      onChange={(e) => { setRecoveryCode(e.target.value.toUpperCase()); if (error) setError(''); }}
                      className="w-full min-h-[50px] px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-center text-lg tracking-widest font-mono text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none uppercase"
                      placeholder="XXXX-XXXX"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} loadingText="Doğrulanıyor..." rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Doğrula
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </Card>
      </motion.div>
    </div>
  );
}
