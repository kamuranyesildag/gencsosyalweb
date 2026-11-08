import React, { useEffect, useState } from "react";
import {
  Loader2,
  BadgeCheck,
  Clock,
  CheckCircle2,
  Shield,
  UserCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";
import { InfoModal } from "./ui/InfoModal";
import { VERIFICATION_CATEGORY_META } from "./VerifiedBadge";

export function VerificationBottomSheet({
  isOpen,
  onClose,
  targetUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    username: string;
    isVerified: boolean;
    verificationCategory?: string | null;
    verifiedAt?: string | null;
  };
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<
    "none" | "pending" | "under_review" | "info_required" | "approved" | "rejected"
  >("none");
  const [resolvedCategory, setResolvedCategory] = useState<string | null>(
    targetUser?.verificationCategory || null
  );

  useEffect(() => {
    if (isOpen) {
      if (targetUser?.isVerified) {
        setStatus("approved");
        setResolvedCategory(targetUser.verificationCategory || null);
        setLoading(false);
        return;
      }

      if (user?.isVerified && (!targetUser || targetUser.username === user.username)) {
        setStatus("approved");
        setLoading(false);
        return;
      }

      setLoading(true);
      fetchApi("/verification/me")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            if (json.currentVerification?.isVerified) {
              setStatus("approved");
              setResolvedCategory(json.currentVerification.verificationCategory || null);
              return;
            }
            const list = Array.isArray(json.data) ? json.data : [];
            const active = list.find((r: any) =>
              ["pending", "under_review", "info_required"].includes(r.status)
            );
            if (active) {
              setStatus(active.status);
              setResolvedCategory(active.category || null);
            } else {
              const rejected = list.find((r: any) => r.status === "rejected");
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
  }, [isOpen, user?.isVerified, user?.username, targetUser]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText="Sistem Doğrulaması"
        title="Durum Kontrol Ediliyor"
        subtitle="Mavi tik başvurusu ve hesap doğrulama kriterleri sorgulanıyor..."
      >
        <div className="py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </InfoModal>
    );
  }

  if (status === "approved" || targetUser?.isVerified) {
    const catKey = targetUser?.verificationCategory || resolvedCategory || "INDIVIDUAL";
    const catMeta = VERIFICATION_CATEGORY_META[catKey] || VERIFICATION_CATEGORY_META.INDIVIDUAL;

    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText={`Kategori: ${catMeta.label}`}
        title={catMeta.badgeTitle}
        subtitle={`${
          targetUser?.username ? `@${targetUser.username}` : "Bu hesap"
        }, Genç Sosyal'in özgünlük, aktiflik, güvenilirlik ve topluluk kriterlerini karşılayarak doğrulanmıştır.`}
        features={[
          {
            icon: BadgeCheck,
            title: `Doğrulama Kategorisi: ${catMeta.label}`,
            description: catMeta.description,
          },
          {
            icon: UserCheck,
            title: "Kriterlere Dayalı Güvenilirlik",
            description:
              "Hesap yaşı, gerçek takipçi kitlesi, profil bütünlüğü ve 30 günlük düzenli topluluk etkinliği doğrulanmıştır.",
          },
        ]}
        primaryActionLabel="Anlaşıldı"
        onPrimaryAction={onClose}
      />
    );
  }

  if (status === "info_required") {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText="Ek Bilgi Gerekli"
        title="Başvurunuz İçin Ek Bilgi Bekleniyor"
        subtitle="İnceleme ekibimiz mavi tik başvurunuzu tamamlamak için sizden ek açıklama veya bağlantı talep etti."
        features={[
          {
            icon: AlertCircle,
            title: "Yönetici Notunu İnceleyin",
            description:
              "Doğrulama ayarları sayfasından talep edilen detayı görüntüleyip yanıtınızı iletebilirsiniz.",
          },
        ]}
        primaryActionLabel="Ek Bilgi Gönder"
        onPrimaryAction={() => {
          onClose();
          navigate("/settings?tab=verification");
        }}
        secondaryActionLabel="Kapat"
        onSecondaryAction={onClose}
      />
    );
  }

  if (status === "pending" || status === "under_review") {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        badgeText={status === "under_review" ? "İnceleniyor" : "İnceleme Bekliyor"}
        title="Başvurunuz Değerlendiriliyor"
        subtitle="Mavi tik doğrulama başvurunuz Genç Sosyal inceleme ekibi tarafından kriterlere göre değerlendiriliyor."
        features={[
          {
            icon: CheckCircle2,
            title: "1. Kriter ve Başvuru Kaydı Alındı",
            description: "Hesap metrikleriniz ve destekleyici bağlantılarınız inceleme sırasına eklendi.",
          },
          {
            icon: Clock,
            title: "2. Özgünlük ve Güvenilirlik İncelemesi",
            description: "Yöneticilerimiz hesap geçmişinizi, etkileşim kalitesini ve kategori uygunluğunu inceliyor.",
          },
        ]}
        primaryActionLabel="Başvuru Durumunu Gör"
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
      badgeText="Mavi Tik Doğrulama Sistemi"
      title="Doğrulanmış Hesap Başvurusu"
      subtitle="Genç Sosyal'de mavi tik; gerçek kişileri, içerik üreticilerini, kurumları, aktif toplulukları ve TEKNOFEST/öğrenci projelerini temsil eden güvenilir hesaplara verilir."
      features={[
        {
          icon: Shield,
          title: "Asgari Uygunluk Kriterleri",
          description:
            "En az 1.000 gerçek takipçi (veya aktif proje/topluluk temsili), 90 gün hesap yaşı ve %100 tamamlanmış profil gereklidir.",
        },
        {
          icon: Sparkles,
          title: "Özgünlük ve Düzenli Aktiflik",
          description:
            "Son 30 günde düzenli etkinlik göstermeli, spam veya sahte etkileşim barındırmamalısınız.",
        },
      ]}
      primaryActionLabel="Uygunluk Durumunu Kontrol Et"
      onPrimaryAction={() => {
        onClose();
        navigate("/settings?tab=verification");
      }}
      secondaryActionLabel="Şimdi Değil"
      onSecondaryAction={onClose}
    />
  );
}
