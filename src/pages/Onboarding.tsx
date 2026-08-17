import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Type,
  Info,
  Target,
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Image as ImageIcon,
  Sparkles,
  Hexagon,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const STEPS = [
  { id: 1, title: 'Profil Fotoğrafı', shortTitle: 'Fotoğraf', icon: Camera, text: 'Seni daha iyi tanımamız için bir profil fotoğrafı yükle.' },
  { id: 2, title: 'Görünen Ad', shortTitle: 'İsim', icon: Type, text: 'Genç Sosyal topluluğunda nasıl anılmak istersin?' },
  { id: 3, title: 'Biyografi', shortTitle: 'Hakkında', icon: Info, text: 'Kendinden, ilgi alanlarından ve hedeflerinden kısaca bahset.' },
  { id: 4, title: 'İlgi Alanları', shortTitle: 'İlgiler', icon: Target, text: 'Sana özel içerikleri ve toplulukları önermemiz için seç.' },
  { id: 5, title: 'Harika, Hazırsın!', shortTitle: 'Tamamla', icon: Rocket, text: 'Profilin oluşturuldu. Artık Genç Sosyal dünyasını keşfetmeye hazırsın!' },
];

const AVAILABLE_INTERESTS = [
  'Yazılım',
  'Yapay Zeka',
  'Tasarım & UI/UX',
  'Teknoloji',
  'Robotik & İHA',
  'Girişimcilik',
  'Oyun Geliştirme',
  'Siber Güvenlik',
  'Açık Kaynak',
  'Bilim & Uzay',
  'Müzik & Sanat',
  'Kitap & Edebiyat',
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    avatarUrl: user?.avatarUrl || '',
    displayName: user?.displayName || '',
    bio: (user as any)?.bio || '',
    interests: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleNext = () => {
    if (step === 2 && formData.displayName.trim().length < 2) {
      setError('Görünen ad en az 2 karakter olmalıdır.');
      return;
    }
    if (step === 3 && formData.bio.length > 500) {
      setError('Biyografi en fazla 500 karakter olabilir.');
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSkip = () => {
    setError('');
    setStep((s) => s + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
        body: data,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFormData((prev) => ({ ...prev, avatarUrl: json.data.url }));
      } else {
        throw new Error(json.error?.message || 'Fotoğraf yüklenemedi.');
      }
    } catch (err: any) {
      setError(err.message || 'Yükleme sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl,
      };
      if (formData.displayName.trim().length >= 2) {
        payload.displayName = formData.displayName.trim();
      }

      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Profil güncellenemedi.');
      }

      if (user) {
        setUser({
          ...user,
          displayName: payload.displayName || user.displayName,
          avatarUrl: formData.avatarUrl,
          bio: formData.bio,
        } as any);
      }
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      }
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const currentStepData = STEPS[step - 1];

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
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 mb-3">
              <Hexagon className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Profilini Özelleştir
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
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full origin-left"
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110'
                          : isCompleted
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
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

          {/* Step Body */}
          <div className="min-h-[260px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full text-center"
              >
                <div className="mb-6">
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
                    className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5 text-left"
                    role="alert"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span className="flex-1 leading-snug">{error}</span>
                  </motion.div>
                )}

                {/* Step 1: Avatar Upload */}
                {step === 1 && (
                  <div className="flex flex-col items-center gap-5">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group cursor-pointer"
                    >
                      <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-50 flex items-center justify-center relative transition-all group-hover:border-indigo-200">
                        {formData.avatarUrl ? (
                          <img
                            src={formData.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        )}

                        <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold">Değiştir</span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />

                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        fullWidth
                        isLoading={loading}
                        loadingText="Yükleniyor..."
                        leftIcon={<Upload className="w-4 h-4" />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Fotoğraf Seç
                      </Button>
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1.5 transition-colors"
                      >
                        Şimdilik Geç
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Display Name */}
                {step === 2 && (
                  <div className="space-y-3 max-w-sm mx-auto text-left">
                    <label htmlFor="onb-name" className="text-xs sm:text-sm font-semibold text-slate-700">
                      Görünen Ad
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <input
                        id="onb-name"
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
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        placeholder="Ad Soyad"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Daha sonra profil ayarlarından dilediğin zaman değiştirebilirsin.
                    </p>
                  </div>
                )}

                {/* Step 3: Bio */}
                {step === 3 && (
                  <div className="space-y-3 max-w-sm mx-auto text-left">
                    <label htmlFor="onb-bio" className="text-xs sm:text-sm font-semibold text-slate-700">
                      Hakkında
                    </label>
                    <div className="relative">
                      <textarea
                        id="onb-bio"
                        name="bio"
                        autoFocus
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                        placeholder="Neler üretiyorsun? Hangi teknolojiler veya alanlar ilgini çekiyor?"
                      />
                      <div
                        className={`text-right text-[11px] font-semibold mt-1 ${
                          formData.bio.length > 500 ? 'text-rose-500' : 'text-slate-400'
                        }`}
                      >
                        {formData.bio.length} / 500
                      </div>
                    </div>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors"
                      >
                        Şimdilik Boş Bırak
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Interests */}
                {step === 4 && (
                  <div className="flex flex-col items-center">
                    <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-md">
                      {AVAILABLE_INTERESTS.map((interest) => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all select-none ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                                : 'border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors"
                    >
                      Şimdilik Geç
                    </button>
                  </div>
                )}

                {/* Step 5: Summary */}
                {step === 5 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center flex flex-col items-center max-w-sm mx-auto">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center mb-3">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {formData.displayName || user?.username}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mb-2">
                      @{user?.username}
                    </p>
                    {formData.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 px-2 italic">
                        "{formData.bio}"
                      </p>
                    )}
                    {formData.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                        {formData.interests.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100"
                          >
                            {item}
                          </span>
                        ))}
                        {formData.interests.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            +{formData.interests.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && step < 5 && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handlePrev}
                disabled={loading}
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
              onClick={step === 5 ? handleFinish : handleNext}
              isLoading={loading}
              loadingText={step === 5 ? 'Başlatılıyor...' : 'Kaydediliyor...'}
              rightIcon={step === 5 ? <Rocket className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {step === 5 ? "Genç Sosyal'e Başla" : 'Devam Et'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
