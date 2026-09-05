import { useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { fetchApi } from "../lib/api";

let initPromise: Promise<void> | null = null;

export function useAuthInit() {
  const { setAuth, logout, setLoading, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (initPromise) {
        await initPromise;
        return;
      }
      
      initPromise = (async () => {
        try {
          // First try to get a new access token using the httpOnly refresh token cookie
          const refreshRes = await fetch("/api/v1/auth/refresh", { method: "POST" });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success) {
              const token = refreshData.data.accessToken;
              
              // Now fetch user details
              const meRes = await fetch("/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (meRes.ok) {
                const meData = await meRes.json();
                
                if (meData.success) {
                  setAuth(meData.data, token);
                  return;
                }
              }
            }
          }
          
          logout();
        } catch (error) {
          logout();
        }
      })();
      
      await initPromise;
      initPromise = null;
    };

    if (!isAuthenticated && isLoading) {
       initAuth();
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, setAuth, logout]);
}
