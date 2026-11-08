import React, { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { VerificationBottomSheet } from './VerificationBottomSheet';

export const VERIFICATION_CATEGORY_META: Record<
  string,
  { label: string; badgeTitle: string; description: string }
> = {
  INDIVIDUAL: {
    label: "Bireysel",
    badgeTitle: "Doğrulanmış Bireysel Hesap",
    description: "Tanınan veya Genç Sosyal topluluğu içinde bilinirliği onaylanmış gerçek kişi.",
  },
  CREATOR: {
    label: "İçerik Üreticisi",
    badgeTitle: "Doğrulanmış İçerik Üreticisi",
    description: "Düzenli, özgün ve topluluğa değer katan içerik üreten doğrulanmış hesap.",
  },
  ORGANIZATION: {
    label: "Kurum / Marka",
    badgeTitle: "Doğrulanmış Kurum / Marka",
    description: "Resmî kurum, şirket, üniversite kulübü veya doğrulanmış organizasyon hesabı.",
  },
  COMMUNITY: {
    label: "Topluluk",
    badgeTitle: "Doğrulanmış Topluluk",
    description: "Gerçek, aktif ve topluluk kurallarına uygun faaliyet gösteren doğrulanmış topluluk.",
  },
  PROJECT: {
    label: "Proje",
    badgeTitle: "Doğrulanmış Proje / Takım",
    description: "TEKNOFEST projeleri, teknoloji takımları veya özgün öğrenci projelerini temsil eden doğrulanmış hesap.",
  },
};

export function getVerificationCategoryLabel(category?: string | null): string {
  if (!category) return "Doğrulanmış Hesap";
  return VERIFICATION_CATEGORY_META[category]?.label || "Doğrulanmış Hesap";
}

export function getVerificationCategoryBadgeTitle(category?: string | null): string {
  if (!category) return "Doğrulanmış Hesap";
  return VERIFICATION_CATEGORY_META[category]?.badgeTitle || "Doğrulanmış Hesap";
}

interface VerifiedBadgeProps {
  className?: string;
  iconClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  withModal?: boolean;
  showCategoryPill?: boolean;
  targetUser?: {
    username: string;
    isVerified: boolean;
    verificationCategory?: string | null;
    verifiedAt?: string | null;
  };
}

export function VerifiedBadge({
  className = "",
  iconClassName = "w-4 h-4",
  onClick,
  withModal = true,
  showCategoryPill = false,
  targetUser,
}: VerifiedBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else if (withModal) {
      setShowModal(true);
    }
  };

  const categoryTitle = getVerificationCategoryBadgeTitle(targetUser?.verificationCategory);
  const categoryShort = targetUser?.verificationCategory
    ? VERIFICATION_CATEGORY_META[targetUser.verificationCategory]?.label
    : null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={categoryTitle}
        aria-label={categoryTitle}
        className={`inline-flex items-center gap-1.5 justify-center focus:outline-none hover:opacity-85 transition-opacity shrink-0 ${className}`}
      >
        <BadgeCheck className={`fill-blue-500 text-white shrink-0 ${iconClassName}`} />
        {showCategoryPill && categoryShort && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/12 text-blue-400 border border-blue-500/25 tracking-tight">
            {categoryShort}
          </span>
        )}
      </button>

      {withModal && (
        <VerificationBottomSheet
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          targetUser={targetUser}
        />
      )}
    </>
  );
}
