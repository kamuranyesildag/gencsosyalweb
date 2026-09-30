import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  X, 
  RotateCw,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { useSEO } from '../hooks/useSEO';

export function Register() {
  useSEO({
    allowIndexing: false,
    title: "Kayıt Ol | Genç Sosyal",
    description: "Genç Sosyal'e katılın, projelerinizi paylaşın, topluluklara katılın ve üretmeye devam edin.",
    canonicalPath: "/register"
  });

  const navigate = useNavigate();

  // Mode: "form" or "otp"
  const [mode, setMode] = useState<"form" | "otp">("form");

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP input when switching to OTP mode
  useEffect(() => {
    if (mode === "otp") {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [mode]);

  // Username debounce validation
  useEffect(() => {
    const cleanUser = username.trim();
    if (!cleanUser) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (cleanUser.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("En az 3 karakter olmalı.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Yalnızca harf, rakam ve alt çizgi (_) kullanılabilir.");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Kontrol ediliyor...");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/auth/check-username?username=${encodeURIComponent(cleanUser)}`);
        const json = await res.json();
        if (json.success) {
          if (json.data.available) {
            setUsernameStatus("available");
            setUsernameMessage("Bu kullanıcı adı kullanılabilir.");
          } else {
            setUsernameStatus("taken");
            setUsernameMessage(json.data.reason || "Bu kullanıcı adı zaten alınmış.");
          }
        } else {
          setUsernameStatus("invalid");
          setUsernameMessage(json.error?.message || "Geçersiz format.");
        }
      } catch (err) {
        setUsernameStatus("idle");
        setUsernameMessage("");
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [username]);

  // Calculate clean password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: "Zayıf", color: "bg-amber-500 text-amber-600" };
    if (score <= 3) return { level: 2, text: "Orta", color: "bg-blue-500 text-blue-600" };
    return { level: 3, text: "Güçlü", color: "bg-emerald-500 text-emerald-600" };
  };

  const strength = getPasswordStrength();

  // Step 1: Send registration OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    // Validations
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Lütfen adınızı ve soyadınızı eksiksiz girin.');
      return;
    }

    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      setError('Lütfen geçerli ve boşta olan bir kullanıcı adı seçin.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!termsAccepted) {
      setError('Devam etmek için kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim(),
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Kayıt işlemi başlatılamadı.');
      }

      setCooldown(data?.data?.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      setMode("otp");
    } catch (err: any) {
      setError(err.message || 'Kayıt talebi gönderilirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOtp = async (codeToVerify?: string) => {
    if (loading) return;
    const finalCode = codeToVerify || otpDigits.join('');

    if (finalCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          otp: finalCode
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Doğrulama kodu hatalı veya süresi dolmuş.');
      }

      // Save token and authenticate
      if (data?.data?.accessToken) {
        useAuthStore.getState().setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
        navigate('/onboarding', { state: { fromRegister: true }, replace: true });
      } else {
        navigate('/login', { state: { fromRegister: true } });
      }
    } catch (err: any) {
      setError(err.message || 'Hesap oluşturulurken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);

    try {
      const res = await fetch('/api/v1/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Doğrulama kodu yeniden gönderilemedi.');
      }

      setCooldown(data?.data?.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Kod yeniden gönderilemedi.');
    } finally {
      setResending(false);
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
      setTimeout(() => handleVerifyOtp(next.join('')), 50);
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
      setTimeout(() => handleVerifyOtp(paste), 50);
    }
  };

  return (
    <div className="w-full">
      {mode === "otp" ? (
        /* OTP Verification Mode */
        <div className="space-y-6">
          <div className="text-left">
            <button
              type="button"
              onClick={() => { setMode("form"); setError(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bilgileri Düzenle</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              E-postanı Doğrula
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong> adresine 6 haneli bir güvenlik kodu gönderdik.
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
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpDigits.some(d => !d)}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Hesap Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>Doğrula ve Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Kod ulaşmadı mı?</span>
              {cooldown > 0 ? (
                <span className="font-semibold text-slate-400">
                  {cooldown} saniye sonra tekrar iste
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                  <span>Kodu Yeniden Gönder</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Primary Registration Form */
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Genç Sosyal'e katıl
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Projelerini paylaş, topluluklara katıl ve üretmeye devam et.
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

          <form onSubmit={handleInitiateRegister} className="space-y-4" noValidate>
            {/* Görünen Ad (Ad Soyad) */}
            <div>
              <label 
                htmlFor="register-displayname" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <input
                  id="register-displayname"
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); if (error) setError(''); }}
                  placeholder="Örn: Deniz Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Kullanıcı Adı */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="register-username" 
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Kullanıcı Adı
                </label>
                {usernameStatus === "checking" && (
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Kontrol ediliyor...
                  </span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Kullanılabilir
                  </span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> Zaten alınmış
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  @
                </div>
                <input
                  id="register-username"
                  type="text"
                  autoCapitalize="none"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
                  placeholder="kullaniciadi"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                    usernameStatus === 'available'
                      ? 'border-emerald-400/80 focus:ring-emerald-500'
                      : usernameStatus === 'taken'
                      ? 'border-rose-400/80 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-white/[0.12] focus:ring-blue-600'
                  }`}
                  required
                />
              </div>
              {usernameMessage && usernameStatus !== 'available' && usernameStatus !== 'checking' && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{usernameMessage}</p>
              )}
            </div>

            {/* E-posta */}
            <div>
              <label 
                htmlFor="register-email" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="ornek@gencsosyal.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="register-password" 
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Şifre
                </label>
                {password && (
                  <span className={`text-[11px] font-bold ${strength.color}`}>
                    {strength.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  placeholder="En az 8 karakter"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
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

            {/* Şifre Tekrar */}
            <div>
              <label 
                htmlFor="register-password-confirm" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); if (error) setError(''); }}
                  placeholder="Şifrenizi tekrar yazın"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-[#0D121D] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                    passwordConfirm && password === passwordConfirm
                      ? 'border-emerald-400/80 focus:ring-emerald-500'
                      : passwordConfirm && password !== passwordConfirm
                      ? 'border-rose-400/80 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-white/[0.12] focus:ring-blue-600'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Kullanım Koşulları Onayı */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); if (error) setError(''); }}
                  className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-white/[0.2] focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <Link to="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Kullanım Koşulları
                  </Link>
                  'nı ve{' '}
                  <Link to="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Gizlilik Politikası
                  </Link>
                  'nı okudum, kabul ediyorum.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !termsAccepted || usernameStatus === "taken" || usernameStatus === "invalid"}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kod Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Devam Et</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Zaten bir hesabın var mı?{' '}
              <Link 
                to="/login" 
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
