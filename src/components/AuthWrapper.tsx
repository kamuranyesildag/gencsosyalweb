import { useNavigate } from "react-router";
import React, { useState, useEffect } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import { useAuthStore } from "../context/useAuth";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthInit();
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => {
        setTookTooLong(true);
      }, 4000);
    } else {
      setTookTooLong(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    const handleSessionExpired = () => {
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/'];
      if (!publicRoutes.includes(window.location.pathname)) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener("session_expired", handleSessionExpired);
    return () => window.removeEventListener("session_expired", handleSessionExpired);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#070A10] text-slate-900 dark:text-white p-4 font-sans transition-colors">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
            GS
          </div>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Genç Sosyal yükleniyor...
          </p>

          {tookTooLong && (
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Giriş yapmadan devam et
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-xs text-slate-500 hover:underline cursor-pointer"
              >
                Sayfayı Yenile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
