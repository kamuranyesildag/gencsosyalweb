import { useEffect } from "react";
import { useAuthStore } from "../context/useAuth";
import { fetchApi } from "../lib/api";

export function useAuthInit() {
  const { setAuth, logout, setLoading, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
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
              if (meData.success && mounted) {
                setAuth(meData.data, token);
                return;
              }
            }
          }
        }
        
        if (mounted) logout();
      } catch (error) {
        if (mounted) logout();
      }
    };

    if (!isAuthenticated && isLoading) {
       initAuth();
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, setAuth, logout]);
}
