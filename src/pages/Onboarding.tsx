import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../context/useAuth';
import { Button } from '../components/ui/Button';

const STEPS = [
  { id: 1, title: 'Profil Fotoğrafı', text: 'Seni daha iyi tanımamız için bir profil fotoğrafı yükle.' },
  { id: 2, title: 'Görünen Ad', text: 'Toplulukta nasıl anılmak istersin?' },
  { id: 3, title: 'Biyografi', text: 'Kendinden, ilgi alanlarından ve hedeflerinden kısaca bahset.' },
  { id: 4, title: 'İlgi Alanları', text: 'Profilini renklendirmek için ilgi alanlarını seç.' },
  { id: 5, title: 'Harika, Hazırsın!', text: 'Profilin oluşturuldu. Keşfetmeye başlayabilirsin.' },
];

const AVAILABLE_INTERESTS = [
  'Yazılım', 'Yapay Zeka', 'Tasarım & UI/UX', 'Teknoloji',
  'Robotik', 'Girişimcilik', 'Oyun Geliştirme', 'Siber Güvenlik',
  'Açık Kaynak', 'Bilim & Uzay', 'Müzik & Sanat', 'Edebiyat',
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
      if (formData.interests.length > 0) {
        payload.interests = formData.interests;
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
      
      // Complete onboarding
      const completeRes = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        }
      });
      if (completeRes.ok) {
        const completeJson = await completeRes.json();
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
  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-12 max-w-xs mx-auto">
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-center text-[11px] font-bold text-slate-400 mt-3 tracking-widest uppercase">
            Adım {step} / {STEPS.length}
          </p>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-base text-slate-500 max-w-sm mx-auto">
              {currentStepData.text}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-rose-50 rounded-2xl text-sm font-medium text-rose-600 border border-rose-100"
            >
              {error}
            </motion.div>
          )}

          <div className="min-h-[220px] flex flex-col justify-center max-w-sm mx-auto">
            {/* Step 1: Avatar Upload */}
            {step === 1 && (
              <div className="flex flex-col items-center gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-36 h-36 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative transition-all group-hover:border-slate-300">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                      <Camera className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">Fotoğraf Yükle</span>
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

                <div className="flex flex-col gap-3 w-full">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    isLoading={loading}
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-12 text-sm"
                  >
                    Fotoğraf Seç
                  </Button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors py-2"
                  >
                    Şimdilik Geç
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Display Name */}
            {step === 2 && (
              <div className="w-full">
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
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none text-center"
                  placeholder="Adın Soyadın"
                />
              </div>
            )}

            {/* Step 3: Bio */}
            {step === 3 && (
              <div className="w-full">
                <textarea
                  id="onb-bio"
                  name="bio"
                  autoFocus
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none resize-none"
                  placeholder="Neler üretiyorsun? İlgi alanların neler?"
                />
                <div className="flex justify-between items-center mt-3 px-1">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Atla
                  </button>
                  <span
                    className={`text-xs font-semibold ${
                      formData.bio.length > 500 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {formData.bio.length} / 500
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <div className="flex flex-col items-center">
                <div className="flex flex-wrap gap-2.5 justify-center mb-8">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2.5 rounded-full text-sm font-bold border transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
                  className="text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Sonra Seçerim
                </button>
              </div>
            )}

            {/* Step 5: Summary */}
            {step === 5 && (
              <div className="w-full p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center mb-5">
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
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  {formData.displayName || user?.username}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-4">
                  @{user?.username}
                </p>
                
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                    {formData.interests.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs"
                      >
                        {item}
                      </span>
                    ))}
                    {formData.interests.length > 3 && (
                      <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-xs">
                        +{formData.interests.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-3 mt-12 max-w-sm mx-auto">
            {step > 1 && step < 5 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrev}
                disabled={loading}
                className="w-14 h-14 rounded-full p-0 flex items-center justify-center shrink-0"
                aria-label="Geri"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={step === 5 ? handleFinish : handleNext}
              isLoading={loading}
              loadingText={step === 5 ? 'Hazırlanıyor...' : 'İşleniyor...'}
              className="h-14 rounded-full text-base font-bold shadow-sm"
              rightIcon={step === 5 ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            >
              {step === 5 ? "Platforma Giriş Yap" : 'Devam Et'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
