import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import { decodeJwt } from "jose";

// =====================
// Types
// =====================
interface User {
  userId: string;
  email: string;
  is_admin: number;
}

interface RegisterResponse {
  message: string;
  userId: string;
}

interface LoginResponse {
  message: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// =====================
// Context setup
// =====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios instance untuk memudahkan API call
const api = axios.create({
  baseURL: "http://localhost:8000", // ganti dengan domain VPS kalau sudah deploy
  headers: { "Content-Type": "application/json" },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cek token di localStorage saat load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = decodeJwt(token);
        setUser({
          userId: decoded.userId,
          email: decoded.email,
          is_admin: decoded.is_admin,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // =====================
  // Register
  // =====================
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post<RegisterResponse>("/register", {
        name,
        email,
        password,
      });

      if (response.data.userId) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: "Gagal membuat akun." };
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      return { success: false, message: "Terjadi kesalahan saat mendaftar." };
    }
  };

  // =====================
  // Login
  // =====================
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post<LoginResponse>("/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const decoded: any = decodeJwt(response.data.token);
        setUser({
          userId: decoded.userId,
          email: decoded.email,
          is_admin: decoded.is_admin,
        });
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: "Email atau password salah." };
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, message: "Terjadi kesalahan saat login." };
    }
  };

  // =====================
  // Logout
  // =====================
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk pakai AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
