import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Hexagon,
  Lock,
  KeyRound,
  RotateCw,
  Edit3,
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const STEPS = [
  { id: 1, title: 'Kullanıcı Adı', shortTitle: 'Kullanıcı', icon: User, text: 'Topluluğa katılmak için eşsiz bir kullanıcı adı belirleyin.' },
  { id: 2, title: 'E-posta', shortTitle: 'E-posta', icon: Mail, text: 'Size ulaşabileceğimiz geçerli bir e-posta adresi girin.' },
  { id: 3, title: 'Şifre', shortTitle: 'Güvenlik', icon: ShieldCheck, text: 'Hesabınız için güçlü ve güvenli bir şifre oluşturun.' },
  { id: 4, title: 'Görünen Ad', shortTitle: 'Profil', icon: Sparkles, text: 'Profilinizde diğer insanlara nasıl görünmek istersiniz?' },
  { id: 5, title: 'Koşullar', shortTitle: 'Onay', icon: ClipboardCheck, text: 'Devam etmeden önce kullanım koşullarını onaylayın.' },
  { id: 6, title: 'E-posta Doğrulama', shortTitle: 'Doğrulama', icon: KeyRound, text: 'E-posta adresinize gönderilen 6 haneli güvenlik kodunu girin.' },
];

export function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    termsAccepted: false,
  });
  
  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP input when reaching step 6
  useEffect(() => {
    if (step === 6) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();

      }, 150);
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (formData.username.trim().length < 3) return 'Kullanıcı adı en az 3 karakter olmalıdır.';
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) return 'Sadece harf, rakam ve alt çizgi (_) kullanılabilir.';
    } else if (currentStep === 2) {
      if (!formData.email.trim() || !formData.email.includes('@')) return 'Geçerli bir e-posta adresi girin.';
    } else if (currentStep === 3) {
      if (formData.password.length < 8) return 'Şifre en az 8 karakter olmalıdır.';
      if (!/[a-z]/.test(formData.password)) return 'Şifre en az bir küçük harf içermelidir.';
      if (!/[A-Z]/.test(formData.password)) return 'Şifre en az bir büyük harf içermelidir.';
      if (!/[0-9]/.test(formData.password)) return 'Şifre en az bir rakam içermelidir.';
    } else if (currentStep === 4) {
      if (formData.displayName.trim().length < 2) return 'Lütfen görünen adınızı girin (en az 2 karakter).';
    } else if (currentStep === 5) {
      if (!formData.termsAccepted) return 'Devam etmek için kullanım koşullarını kabul etmelisiniz.';
    }
    return '';
  };

  // Step 5 -> Step 6: Send OTP and advance
  const handleSendOtpAndAdvance = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
      };

      const res = await fetch('/api/v1/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Doğrulama kodu gönderilemedi.');
      }

      setCooldown(data?.data?.cooldownSeconds || 60);
      setRemainingAttempts(null);
      setOtpDigits(['', '', '', '', '', '']);
      setStep(6);
    } catch (err: any) {
      setError(err.message || 'Doğrulama kodu gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');

    if (step === 5) {
      handleSendOtpAndAdvance();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((s) => s - 1);
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
          email: formData.email.trim(),
          displayName: formData.displayName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Kod tekrar gönderilemedi.');
      }
      setCooldown(data?.data?.cooldownSeconds || 60);
      setRemainingAttempts(null);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Kod tekrar gönderilemedi.');
    } finally {
      setResending(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (error) setError('');
    
    // Handle paste of full or partial code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      
      // If 6 digits are filled, automatically submit
      if (newOtp.every((d) => d !== '')) {
        verifyOtpAndSubmit(newOtp.join(''));
      }
      return;
    }

    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = cleaned;
    setOtpDigits(newOtp);

    // Auto advance focus
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    if (cleaned && index === 5 && newOtp.every((d) => d !== '')) {
      verifyOtpAndSubmit(newOtp.join(''));
    }
  };

  // Handle backspace / navigation in OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Verify OTP and complete registration
  const verifyOtpAndSubmit = async (codeOverride?: string) => {
    const fullOtp = codeOverride || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
        otp: fullOtp,
      };

      const res = await fetch('/api/v1/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.remainingAttempts !== undefined) {
          setRemainingAttempts(data.error.remainingAttempts);
        }
        throw new Error(data?.error?.message || 'Doğrulama kodu geçersiz.');
      }

      // Successful registration & immediate login
      if (data?.data?.accessToken && data?.data?.user) {
        useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
        navigate('/onboarding');
      } else {
        navigate('/login', { state: { fromRegister: true, message: 'Hesabınız başarıyla doğrulandı. Giriş yapabilirsiniz.' } });
      }
    } catch (err: any) {
      setError(err.message || 'Doğrulama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      handleNext();
      return;
    }
    if (step === 5) {
      handleSendOtpAndAdvance();
      return;
    }
    if (step === 6) {
      verifyOtpAndSubmit();
    }
  };

  const currentStepData = STEPS[step - 1];

  // Password rules helper
  const hasMinLength = formData.password.length >= 8;
  const hasLower = /[a-z]/.test(formData.password);
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="p-7 sm:p-10 shadow-xl border-slate-200/80 rounded-3xl bg-white relative overflow-hidden">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-500/25 mb-3">
              <Hexagon className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Genç Sosyal'e Katıl
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adım {step} / {STEPS.length} &bull; {currentStepData.shortTitle}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-8">
            <div className="relative flex items-center justify-between px-1">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full" />
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-900 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (step - 1) / (STEPS.length - 1) }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              />
              {STEPS.map((s) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center">
                    <motion.div
                      className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-500/30 scale-110'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <s.icon className="w-4 h-4" />}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Form Body */}
          <form onSubmit={handleSubmit} className="min-h-[220px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                    {currentStepData.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {currentStepData.text}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5"
                    role="alert"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span className="flex-1 leading-snug">{error}</span>
                  </motion.div>
                )}

                {/* Step 1: Username */}
                {step === 1 && (
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="reg-username" className="text-xs sm:text-sm font-semibold text-slate-700">
                      Kullanıcı Adı
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-username"
                        type="text"
                        name="username"
                        autoFocus
                        required
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                        placeholder="kullanici_adi"
                      />
                    </div>
                    <p className="text-xs text-slate-400 pl-1">
                      En az 3 karakter. Harf, rakam ve alt çizgi kullanılabilir.
                    </p>
                  </div>
                )}

                {/* Step 2: Email */}
                {step === 2 && (
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="reg-email" className="text-xs sm:text-sm font-semibold text-slate-700">
                      E-posta Adresi
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        name="email"
                        autoFocus
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                        placeholder="isim@ornek.com"
                      />
                    </div>
                    <p className="text-xs text-slate-400 pl-1">
                      Kayıt doğrulama kodu bu e-posta adresine gönderilecektir.
                    </p>
                  </div>
                )}

                {/* Step 3: Password */}
                {step === 3 && (
                  <div className="space-y-3 text-left">
                    <div className="space-y-1.5">
                      <label htmlFor="reg-password" className="text-xs sm:text-sm font-semibold text-slate-700">
                        Güvenli Şifre
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoFocus
                          required
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
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

                    {/* Security Checklist */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          ✓
                        </div>
                        <span>En az 8 karakter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${hasLower ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLower ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          ✓
                        </div>
                        <span>Küçük harf (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUpper ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          ✓
                        </div>
                        <span>Büyük harf (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          ✓
                        </div>
                        <span>En az 1 rakam (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Display Name */}
                {step === 4 && (
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="reg-displayname" className="text-xs sm:text-sm font-semibold text-slate-700">
                      Görünen Ad
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-displayname"
                        type="text"
                        name="displayName"
                        autoFocus
                        required
                        value={formData.displayName}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                        placeholder="Örn. Ahmet Yılmaz"
                      />
                    </div>
                    <p className="text-xs text-slate-400 pl-1">
                      Profilinizde diğer kullanıcılara bu isimle görüneceksiniz.
                    </p>
                  </div>
                )}

                {/* Step 5: Terms & Confirmation */}
                {step === 5 && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs">
                        <span className="text-slate-500">Kullanıcı Adı:</span>
                        <span className="font-bold text-slate-900">@{formData.username}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs">
                        <span className="text-slate-500">E-posta:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{formData.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Görünen Ad:</span>
                        <span className="font-bold text-slate-900">{formData.displayName}</span>
                      </div>
                    </div>

                    <label className="flex items-start gap-3.5 p-4 border border-slate-200/90 rounded-2xl cursor-pointer hover:bg-slate-50/80 transition-colors bg-white group">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 accent-slate-600 shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 select-none">
                        <Link
                          to="/terms"
                          target="_blank"
                          className="text-slate-900 hover:underline font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Kullanım Koşulları
                        </Link>{' '}
                        ve{' '}
                        <Link
                          to="/privacy"
                          target="_blank"
                          className="text-slate-900 hover:underline font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Gizlilik Politikası
                        </Link>
                        'nı okudum ve kabul ediyorum.
                      </span>
                    </label>
                  </div>
                )}

                {/* Step 6: OTP Code Verification */}
                {step === 6 && (
                  <div className="space-y-5 text-center">
                    {/* Sent Email Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold border border-slate-100 max-w-full">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{formData.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setStep(2);
                        }}
                        className="ml-1 text-slate-500 hover:text-slate-800 transition-colors"
                        title="E-postayı Değiştir"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 6 Digit Input Group */}
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
                            digit
                              ? 'border-slate-900 bg-slate-100/40 text-slate-900 ring-2 ring-slate-900/10'
                              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10'
                          }`}
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>

                    {/* Attempts info & expiration hint */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">
                        Kod 10 dakika boyunca geçerlidir. Lütfen spam kutunuzu da kontrol edin.
                      </p>
                      {remainingAttempts !== null && (
                        <p className="text-xs font-semibold text-rose-600">
                          Kalan deneme hakkı: {remainingAttempts}
                        </p>
                      )}
                    </div>

                    {/* Resend OTP button */}
                    <div className="pt-2">
                      {cooldown > 0 ? (
                        <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                          Yeni kod için {cooldown} saniye bekleyin
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-slate-700 hover:underline transition-colors disabled:opacity-50"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                          {resending ? 'Kod Gönderiliyor...' : 'Kodu Tekrar Gönder'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Action Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handlePrev}
                disabled={loading}
                aria-label="Önceki adım"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Geri
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              isLoading={loading}
              loadingText={step === 5 ? "Kod Gönderiliyor..." : "Doğrulanıyor..."}
              rightIcon={step === 6 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {step === 5
                ? 'Doğrulama Kodu Gönder'
                : step === 6
                ? 'Kodu Doğrula ve Tamamla'
                : 'Devam Et'}
            </Button>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="font-bold text-slate-900 hover:text-slate-700 hover:underline transition-colors"
              >
                Giriş Yapın
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
