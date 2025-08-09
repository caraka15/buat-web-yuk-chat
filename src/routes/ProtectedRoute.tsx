// src/routes/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, refreshSession } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      // hanya cek ketika user belum ada
      if (!user) {
        const ok = await refreshSession(); // akan redirect via api.ts jika expired
        if (!ok) return; // redirect terjadi di handler
      }
      setChecking(false);
    })();
  }, [user, refreshSession]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // kalau user tetap tidak ada (mis. tidak login) → ke /auth
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
