import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { api, setUnauthorizedHandler } from "@/lib/api";

// =====================
// Types
// =====================
interface User {
  userId: string;
  email: string;
  is_admin: number; // 1 admin, 0 user
  token: string;
}

interface RegisterResponse {
  message: string;
  userId?: string;
  error?: string;
}

interface LoginResponse {
  message: string;
  token?: string;
  error?: string;
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  is_admin: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

// =====================
// Context setup
// =====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("token");
    } catch {}
    setUser(null);
    setIsAdmin(false);
  }, []);

  // Hubungkan handler 401/expired dari api.ts → logout + redirect
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = "/auth";
    });
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return false;
    }
    try {
      const me = await api.get<MeResponse>("/me", token);
      setUser({
        userId: me.id,
        email: me.email,
        is_admin: me.is_admin ?? 0,
        token,
      });
      setIsAdmin((me.is_admin ?? 0) === 1);
      return true;
    } catch {
      return false; // onUnauthorized dari api.ts sudah handle redirect
    }
  }, [logout]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = "/auth";
    });
  }, [logout]);

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post<RegisterResponse>("/register", {
        name,
        email,
        password,
      });
      if (res.userId) {
        return {
          success: true,
          message: res.message || "Registrasi berhasil.",
        };
      }
      return {
        success: false,
        message: res.error || res.message || "Gagal mendaftar. Coba lagi.",
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "Gagal mendaftar. Coba lagi.",
      };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post<LoginResponse>("/login", { email, password });
      if (!res.token) {
        return {
          success: false,
          message: res.error || res.message || "Email atau password salah.",
        };
      }

      localStorage.setItem("token", res.token);

      const ok = await refreshSession();
      if (!ok) {
        return { success: false, message: "Gagal mengambil profil." };
      }

      return {
        success: true,
        message: res.message || "Login berhasil.",
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "Terjadi kesalahan saat login.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
