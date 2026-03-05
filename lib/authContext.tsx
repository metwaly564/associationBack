"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { message } from 'antd';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (pathname === '/login') {
          router.push('/news');
        }
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      if (pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'فشل تسجيل الدخول' } };
      }

      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      message.success('تم تسجيل الدخول بنجاح');
      
      // استخدام window.location للتأكد من إعادة التوجيه
      window.location.href = '/news';
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'حدث خطأ أثناء تسجيل الدخول' } };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
      message.success('تم تسجيل الخروج بنجاح');
      router.push('/login');
    } catch (error) {
      message.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
