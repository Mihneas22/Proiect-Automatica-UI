import React, { createContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthClaims {
  name?: string;
  email?: string;
  role?: string | string[];
}

interface AuthContextType {
  user: AuthClaims | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

const LOCAL_STORAGE_KEY = "auth";

const getClaims = (jwtToken: string): AuthClaims | null => {
  try {
    const decoded: any = jwtDecode(jwtToken);

    const nameKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
    const emailKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    return {
      name: decoded[nameKey] ?? null,
      email: decoded[emailKey] ?? null,
      role: decoded[roleKey] ?? null,
    };
  } catch (err) {
    console.error("JWT decode failed", err);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthClaims | null>(null);

  // Restore auth on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
      setUser(getClaims(storedToken)); // may be null, and that's OK
    }
  }, []);

  const login = (jwtToken: string) => {
    setToken(jwtToken);
    setUser(getClaims(jwtToken)); // do NOT block login
    localStorage.setItem(LOCAL_STORAGE_KEY, jwtToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
