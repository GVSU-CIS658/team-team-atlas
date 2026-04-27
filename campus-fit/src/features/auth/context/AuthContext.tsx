import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../../../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    university?: string,
    avatarDataUrl?: string | null,
  ) => Promise<void>;
  logout: () => Promise<void>;
    updateUser: (updates: Partial<Pick<User, 'username' | 'email' | 'avatarUrl'>>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function avatarKey(email: string) {
  return `campusfit_avatar_${email.toLowerCase()}`;
}

function decodeToken(token: string): Omit<User, "avatarUrl"> | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id, email: payload.email, username: payload.username };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const avatarUrl = localStorage.getItem(avatarKey(decoded.email));
        setUser({ ...decoded, avatarUrl });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; expiresIn: number }>(
      "/auth/login",
      { email, password },
    );
    localStorage.setItem("accessToken", data.accessToken);
    const decoded = decodeToken(data.accessToken);
    if (decoded) {
      const avatarUrl = localStorage.getItem(avatarKey(decoded.email));
      setUser({ ...decoded, avatarUrl });
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    university?: string,
    avatarDataUrl?: string | null,
  ) => {
    await api.post("/auth/register", { username, email, password, university });
    if (avatarDataUrl) {
      localStorage.setItem(avatarKey(email), avatarDataUrl);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

    const updateUser: AuthContextValue['updateUser'] = (updates) => {
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
