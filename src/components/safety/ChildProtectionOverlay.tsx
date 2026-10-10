import React from "react";
import { Shield } from "lucide-react";

interface ChildProtectionOverlayProps {
  isMinor?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ChildProtectionOverlay({ isMinor, children, className = "" }: ChildProtectionOverlayProps) {
  if (!isMinor) {
    return <>{children}</>;
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      onContextMenu={handleContextMenu}
      className={`relative select-none ${className}`}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {children}
      {/* Subtle regulatory protection watermark indicator */}
      <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/60 backdrop-blur-xs text-[10px] text-white/80 font-medium">
        <Shield className="w-3 h-3 text-blue-400" />
        <span>Korunan İçerik</span>
      </div>
    </div>
  );
}
