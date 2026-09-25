import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/api-config";

interface AdminUser { username: string; name: string }

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  api: <T = unknown>(endpoint: string, options?: RequestInit) => Promise<T>;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_USER: AdminUser = { username: "admin", name: "Administrator" };

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check localStorage on mount to persist session across page reloads
  useEffect(() => {
    if (localStorage.getItem("is_admin") === "true") {
      setUser(ADMIN_USER);
    }
    setIsLoading(false);
  }, []);

  const api = useCallback(async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(`${API_BASE}/api/admin${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const data = await res.json() as { ok: boolean; error?: string } & T;
    if (!res.ok || !data.ok) {
      if (res.status === 401) {
        localStorage.removeItem("is_admin");
        setUser(null);
      }
      throw new Error((data as { error?: string }).error || "Request failed");
    }
    return data as T;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("is_admin", "true");
      setUser(ADMIN_USER);
      toast({ title: "Kirish muvaffaqiyatli", description: `Xush kelibsiz, ${ADMIN_USER.name}` });
    } else {
      throw new Error("Login yoki parol noto'g'ri");
    }
  }, [toast]);

  const logout = useCallback(async () => {
    localStorage.removeItem("is_admin");
    setUser(null);
    toast({ title: "Chiqish muvaffaqiyatli" });
  }, [toast]);

  return (
    <AdminContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, api }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
