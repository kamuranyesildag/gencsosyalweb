import React, { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { VerificationBottomSheet } from './VerificationBottomSheet';

interface VerifiedBadgeProps {
  className?: string;
  iconClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  withModal?: boolean;
  targetUser?: { username: string; isVerified: boolean };
}

export function VerifiedBadge({ 
  className = "", 
  iconClassName = "w-4 h-4", 
  onClick, 
  withModal = true,
  targetUser
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

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Doğrulanmış Hesap"
        className={`inline-flex items-center justify-center focus:outline-none hover:opacity-80 transition-opacity shrink-0 ${className}`}
      >
        <BadgeCheck className={`fill-blue-500 text-white ${iconClassName}`} />
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
