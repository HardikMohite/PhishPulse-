import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getMe } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, setUser } = useAuthStore();
  // Always verify with the server — never trust localStorage alone.
  // This catches: expired cookies, revoked sessions, tampered store data.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // Cookie invalid / expired — clear any stale local state
        setUser(null);
      })
      .finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Fix: redirect to login, not hub page
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}