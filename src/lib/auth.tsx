import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';
import type { Profile, UserRole } from './types';

interface Session {
  user: { id: string; email: string };
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, extra?: Record<string, string>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUser = (user: Profile & { id: string; email: string }) => {
    setSession({ user: { id: user.id, email: user.email } });
    setProfile(user as Profile);
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        const user = JSON.parse(stored);
        applyUser(user);
        // Refresh profile from server in background
        api.get('/api/auth/me')
          .then((res) => {
            const u = res.data.user;
            localStorage.setItem('user', JSON.stringify(u));
            applyUser(u);
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setSession(null);
            setProfile(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      applyUser(user);
      return { error: null };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      return { error: msg };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    extra?: Record<string, string>
  ): Promise<{ error: string | null }> => {
    try {
      const res = await api.post('/api/auth/signup', {
        email,
        password,
        full_name: fullName,
        role,
        ...extra,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      applyUser(user);
      return { error: null };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed';
      return { error: msg };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      const u = res.data.user;
      localStorage.setItem('user', JSON.stringify(u));
      applyUser(u);
    } catch {
      // silently ignore
    }
  }, []);

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    try {
      const res = await api.patch('/api/users/me', updates);
      const u = res.data.user;
      localStorage.setItem('user', JSON.stringify(u));
      applyUser(u);
      return { error: null };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed';
      return { error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
