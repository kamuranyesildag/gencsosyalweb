import React, { useState, useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { Sparkles, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { SuggestedUsers } from "./SuggestedUsers";
import { InfoModal } from "./ui/InfoModal";

export function OnboardingModal() {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      const hasDismissed = sessionStorage.getItem("onboardingDismissed");
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("onboardingDismissed", "true");
  };

  if (step === 1) {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={handleClose}
        badgeText="Genç Sosyal Katılımı"
        title={`Hoş Geldin, ${user?.displayName || user?.username}!`}
        subtitle="Genç Sosyal topluluğuna katıldığın için çok mutluyuz. İlk adımlarını atmak ve toplulukla tanışmak için hazır mısın?"
        features={[
          {
            icon: Sparkles,
            title: "Düşünce ve Projelerini Paylaş",
            description: "Geliştirdiğin projeleri, yazılımsal fikirlerini ve güncel sorularını toplulukla buluştur.",
          },
          {
            icon: Users,
            title: "Geliştiricileri Takip Et",
            description: "Aynı ilgi alanlarına sahip yazılımcıları ve tasarımcıları takip ederek canlı akışını oluştur.",
          },
          {
            icon: ShieldCheck,
            title: "Rozet ve Seviyeni Yükselt",
            description: "Paylaşım yaptıkça ve topluluğa katıldıkça yeni yetenek rozetleri kazan.",
          },
        ]}
        primaryActionLabel="Topluluğu Keşfet"
        onPrimaryAction={() => setStep(2)}
        secondaryActionLabel="Daha Sonra"
        onSecondaryAction={handleClose}
      />
    );
  }

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={handleClose}
      badgeText="İki İkinci Adım"
      title="Takip Edebileceğin Kişiler"
      subtitle="İlgini çekebilecek ve ilham alabileceğin geliştiricilerden birkaçını takip et:"
      primaryActionLabel="Ana Sayfaya Git"
      onPrimaryAction={handleClose}
      secondaryActionLabel="Geri"
      onSecondaryAction={() => setStep(1)}
    >
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 my-2 max-h-[260px] overflow-y-auto text-left">
        <SuggestedUsers
          onFollowChange={() => {
            window.dispatchEvent(new Event("refreshOnboarding"));
          }}
        />
      </div>
    </InfoModal>
  );
}
