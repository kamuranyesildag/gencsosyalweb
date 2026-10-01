import { useNavigate } from "react-router";
import React, { useState, useEffect } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import { useAuthStore } from "../context/useAuth";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthInit();
  const navigate = useNavigate();

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

  return <>{children}</>;
}
