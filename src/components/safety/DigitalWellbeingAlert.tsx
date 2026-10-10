import React, { useState, useEffect } from "react";
import { Moon, Clock, X, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../../context/useAuth";

export function DigitalWellbeingAlert() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [isNightTime, setIsNightTime] = useState(false);

  useEffect(() => {
    const checkNight = () => {
      const now = new Date();
      // UTC+3 Turkey hours
      const utc = now.getUTCHours();
      const trHour = (utc + 3) % 24;
      setIsNightTime(trHour >= 22 || trHour < 6);
    };

    checkNight();
    const interval = setInterval(checkNight, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Only show for minor accounts or screen-restricted accounts during night hours
  if (!user || (!user.isMinor && user.ageVerificationStatus !== "VERIFIED_CHILD") || !isNightTime || dismissed) {
    return null;
  }

  return (
    <div className="relative mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/90 to-purple-950/90 text-white shadow-lg border border-indigo-700/50 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-white/10 shrink-0 text-amber-300">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Genç Sosyal Dijital Esenlik
            </span>
            <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-200 font-medium">
              10 Ekim Yönetmeliği
            </span>
          </div>
          <h4 className="text-sm font-bold mt-0.5">
            Gece Dinlenme Zamanı
          </h4>
          <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
            Saat 22:00'yi geçti. Zihinsel gelişiminiz, uyku düzeniniz ve sağlığınız için ekran sürenizi sonlandırıp dinlenmeniz önerilir.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
