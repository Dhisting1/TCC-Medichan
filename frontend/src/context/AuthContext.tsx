import { createContext, useState, useContext, useEffect } from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USER_KEY = "medichain_user";
const TOKEN_KEY = "medichain_token";

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(() => {
    // restaura o usuário do localStorage ao inicializar
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(data: any, token: string) {
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    localStorage.setItem(TOKEN_KEY, token);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// utilitário para outros serviços acessarem o token armazenado
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
