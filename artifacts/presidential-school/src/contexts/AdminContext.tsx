import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const api = useCallback(async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(`/api/admin${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const data = await res.json() as { ok: boolean; error?: string } & T;
    if (!res.ok || !data.ok) {
      if (res.status === 401) setUser(null);
      throw new Error((data as { error?: string }).error || "Request failed");
    }
    return data as T;
  }, []);

  useEffect(() => {
    api<{ ok: boolean; user: AdminUser }>("/session")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [api]);

  const login = useCallback(async (username: string, password: string) => {
    const d = await api<{ ok: boolean; user: AdminUser }>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(d.user);
    toast({ title: "Kirish muvaffaqiyatli", description: `Xush kelibsiz, ${d.user.name}` });
  }, [api, toast]);

  const logout = useCallback(async () => {
    await api("/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    toast({ title: "Chiqish muvaffaqiyatli" });
  }, [api, toast]);

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
