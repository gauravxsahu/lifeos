import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string;
  careerCategory: string;
  communicationStyle: string;
  preference?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (localStorage.getItem('lifeos_token')) {
        const res = await api.getMe();
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user session:', err);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    setUser(res.user);
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
