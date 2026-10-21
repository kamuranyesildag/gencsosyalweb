import { useNavigate } from "react-router";
import React, { useState, useEffect } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import { useAuthStore } from "../context/useAuth";
import { AgeGatekeeperModal } from "./safety/AgeGatekeeperModal";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthInit();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      const protectedPrefixes = [
        '/create',
        '/notifications',
        '/messages',
        '/bookmarks',
        '/settings',
        '/support',
        '/admin',
        '/onboarding'
      ];
      const isStrictlyProtected = protectedPrefixes.some(prefix => window.location.pathname.startsWith(prefix));
      if (isStrictlyProtected) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener("session_expired", handleSessionExpired);
    return () => window.removeEventListener("session_expired", handleSessionExpired);
  }, [navigate]);

  return (
    <>
      {children}
      <AgeGatekeeperModal />
    </>
  );
}
