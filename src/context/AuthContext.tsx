import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, Clinic } from '../types';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  doctor: Doctor | null;
  clinic: Clinic | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    doctorName: string;
    email: string;
    password: string;
    specialty?: string;
    clinicName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('arabdoc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('arabdoc_token');
    if (!savedToken) {
      // Auto login with demo doctor
      try {
        const res = await api.login({ email: 'doctor@arabdoc.com', password: 'password123' });
        localStorage.setItem('arabdoc_token', res.token);
        setToken(res.token);
        setDoctor(res.doctor);
        setClinic(res.clinic);
      } catch (e) {
        setDoctor(null);
        setClinic(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const data = await api.getMe();
      setDoctor(data.doctor);
      setClinic(data.clinic);
      setIsLoading(false);
    } catch (_err) {
      console.warn('Token expired or invalid, auto-refreshing demo session...');
      localStorage.removeItem('arabdoc_token');
      // Attempt auto fallback login to keep session smooth
      try {
        const res = await api.login({ email: 'doctor@arabdoc.com', password: 'password123' });
        localStorage.setItem('arabdoc_token', res.token);
        setToken(res.token);
        setDoctor(res.doctor);
        setClinic(res.clinic);
      } catch (loginErr) {
        console.error('Fallback login failed:', loginErr);
        setToken(null);
        setDoctor(null);
        setClinic(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // If Supabase Auth is active, listen to auth state changes
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.access_token) {
          localStorage.setItem('arabdoc_token', session.access_token);
          setToken(session.access_token);
          refreshUser();
        }
      });
      authListenerSubscription = subscription;
    }

    // Auto-login fallback if no token exists
    const savedToken = localStorage.getItem('arabdoc_token');
    if (!savedToken) {
      api.login({ email: 'doctor@arabdoc.com', password: 'password123' })
        .then(res => {
          localStorage.setItem('arabdoc_token', res.token);
          setToken(res.token);
          setDoctor(res.doctor);
          setClinic(res.clinic);
        })
        .catch(err => {
          console.error('Auto login demo error:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      refreshUser();
    }

    return () => {
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Attempt Supabase Auth login if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && authData.session?.access_token) {
          localStorage.setItem('arabdoc_token', authData.session.access_token);
          setToken(authData.session.access_token);
        }
      } catch (sbErr) {
        console.warn('Supabase client auth attempt notice:', sbErr);
      }
    }

    const res = await api.login({ email, password });
    localStorage.setItem('arabdoc_token', res.token);
    setToken(res.token);
    setDoctor(res.doctor);
    setClinic(res.clinic);
  };

  const register = async (data: {
    doctorName: string;
    email: string;
    password: string;
    specialty?: string;
    clinicName?: string;
    phone?: string;
  }) => {
    // Attempt Supabase Auth signup if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.doctorName,
              specialty: data.specialty,
              clinicName: data.clinicName,
            },
          },
        });
      } catch (sbErr) {
        console.warn('Supabase client signup attempt notice:', sbErr);
      }
    }

    const res = await api.register(data);
    localStorage.setItem('arabdoc_token', res.token);
    setToken(res.token);
    setDoctor(res.doctor);
    setClinic(res.clinic);
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem('arabdoc_token');
    setToken(null);
    setDoctor(null);
    setClinic(null);
  };

  const upgradeToPremium = async () => {
    const res = await api.upgradePlan();
    setClinic(res.clinic);
    setIsUpgradeModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        clinic,
        token,
        isLoading,
        isAuthenticated: !!token && !!doctor,
        login,
        register,
        logout,
        refreshUser,
        upgradeToPremium,
        isUpgradeModalOpen,
        openUpgradeModal: () => setIsUpgradeModalOpen(true),
        closeUpgradeModal: () => setIsUpgradeModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
