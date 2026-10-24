import React, { useEffect, useState } from "react";
import { Loader2, BadgeCheck, ShieldAlert, Clock, CheckCircle2, Circle, Shield, UserCheck, Sparkles } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";
import { InfoModal } from "./ui/InfoModal";

export function VerificationBottomSheet({
  isOpen,
  onClose,
  targetUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: { username: string; isVerified: boolean };
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"none" | "pending" | "under_review" | "approved" | "rejected">("none");

  useEffect(() => {
    if (isOpen) {
      if (user?.isVerified || targetUser?.isVerified) {
        setStatus("approved");
        setLoading(false);
        return;
      }

      setLoading(true);
      fetchApi("/verification/me")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.length > 0) {
            const active = json.data.find((r: any) => r.status === "pending" || r.status === "under_review");
            if (active) {
              setStatus(active.status);
            } else {
              const rejected = json.data.find((r: any) => r.status === "rejected");
              if (rejected) {
                setStatus("rejected");
              } else {
                setStatus("none");
              }
            }
          } else {
            setStatus("none");
          }
        })
        .catch(() => {
          setStatus("none");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.isVerified, targetUser?.isVerified]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText="Sistem Doğrulaması"
        title="Durum Kontrol Ediliyor"
        subtitle="Mavi tik başvurusu ve hesap kimlik doğrulama durumu sorgulanıyor..."
      >
        <div className="py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </InfoModal>
    );
  }

  if (status === "approved" || user?.isVerified || targetUser?.isVerified) {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText="Onaylanmış Hesap"
        title="Doğrulanmış Rozeti Aktif"
        subtitle={`${targetUser?.username ? `@${targetUser.username}` : "Bu hesap"} Genç Sosyal topluluğunda resmi doğrulama sürecinden geçmiş gerçek ve özgün bir kullanıcıdır.`}
        features={[
          {
            icon: BadgeCheck,
            title: "Resmi Kimlik Doğrulaması",
            description: "Genç Sosyal ekibi tarafından kimlik ve geliştirici profili onaylanmıştır.",
          },
          {
            icon: UserCheck,
            title: "Topluluk Güveni",
            description: "Aramalarda ve gönderi akışında doğrulanmış mavi tik rozeti gösterilir.",
          },
        ]}
        primaryActionLabel="Anlaşıldı"
        onPrimaryAction={onClose}
      />
    );
  }

  if (status === "pending" || status === "under_review") {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText="İnceleme Aşamasında"
        title="Başvurunuz Değerlendiriliyor"
        subtitle="Gönderdiğiniz mavi tik doğrulama belgesi moderasyon ekibimizin sırasında."
        features={[
          {
            icon: CheckCircle2,
            title: "1. Başvuru Alındı",
            description: "Gerekli bilgi ve belgeler sistemimize başarıyla iletildi.",
          },
          {
            icon: Clock,
            title: "2. Ekip İncelemesi Devam Ediyor",
            description: "Topluluk yöneticilerimiz kriterleri ve profil geçmişini inceliyor.",
          },
        ]}
        primaryActionLabel="Gelişmeleri Takip Et"
        onPrimaryAction={() => {
          onClose();
          navigate("/settings?tab=verification");
        }}
        secondaryActionLabel="Kapat"
        onSecondaryAction={onClose}
      />
    );
  }

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      badgeText="Rozet Edinme"
      title="Doğrulanmış Mavi Tik Alın"
      subtitle="Gerçek kişi veya geliştirici markası olduğunuzu kanıtlayarak ayrıcalıklara erişin."
      features={[
        {
          icon: Shield,
          title: "Profilini Eksiksiz Doldur",
          description: "Profil fotoğrafı, biyografi ve sosyal medya bağlantılarını ekle.",
        },
        {
          icon: Sparkles,
          title: "Topluluk Katılımı Göster",
          description: "Geliştirici topluluğunda aktif gönderi paylaşarak görünürlüğünü artır.",
        },
      ]}
      primaryActionLabel="Doğrulama Talebi Oluştur"
      onPrimaryAction={() => {
        onClose();
        navigate("/settings?tab=verification");
      }}
      secondaryActionLabel="Şimdi Değil"
      onSecondaryAction={onClose}
    />
  );
}
