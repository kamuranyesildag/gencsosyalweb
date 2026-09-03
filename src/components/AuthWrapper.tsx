import { useNavigate } from "react-router";
import React from "react";
import { useEffect } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import { useAuthStore } from "../context/useAuth";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthInit();
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleSessionExpired = () => {
      // Avoid redirecting if we are already on a public route like login or register
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
