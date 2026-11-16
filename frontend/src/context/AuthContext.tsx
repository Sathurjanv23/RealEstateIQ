'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('riq_token', newToken);
    localStorage.setItem('riq_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('riq_token');
    localStorage.removeItem('riq_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('riq_token');
    const storedUser = localStorage.getItem('riq_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('riq_token');
        localStorage.removeItem('riq_user');
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'ADMIN',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
